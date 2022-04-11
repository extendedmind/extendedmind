use anyhow::Result;
use async_ctrlc::CtrlC;
use async_std::channel::{bounded, Receiver, Sender};
use async_std::sync::{Arc, Mutex};
use async_std::task;
use clap::Parser;
use futures::stream::StreamExt;
use log::{debug, info};
use std::io;
use std::path::PathBuf;
use std::process;
use std::sync::atomic::AtomicBool;
use std::time::{Duration, Instant};
use tide::{Body, Response, StatusCode};
use tide_websockets::{Message, WebSocket};

use extendedmind_engine::{tcp, Bytes, ChannelWriter, Engine, EngineEvent, RandomAccessDisk};

#[derive(Clone, Copy)]
#[repr(u8)]
enum SystemCommand {
    WakeUp = 1,
    Disconnect = 2,
}

#[derive(Copy, Clone, Debug)]
enum ReceiverType {
    System,
    Hypercore,
    Client,
}

#[derive(derivative::Derivative)]
#[derivative(Clone(bound = ""))]
struct State {
    // Engine
    engine: Engine<RandomAccessDisk>,
    // System command receiver
    system_commands: Receiver<Result<Bytes, io::Error>>,
    // Directory for data files
    data_root_dir: PathBuf,
    // Directory for static files
    static_root_dir: Option<PathBuf>,
    // Port to listen for HTTP traffic
    http_port: Option<u16>,
    // Port to listen for TCP hypercore protocol traffic
    tcp_port: Option<u16>,
}

#[derive(Clone)]
struct WrappedData {
    data: Bytes,
    receiver_type: ReceiverType,
}

type WrappedBytesClosure =
    Box<dyn Fn(Result<Bytes, io::Error>) -> Result<WrappedData, io::Error> + Send + Sync>;

type ChannelSenderReceiver = (
    Sender<Result<Bytes, io::Error>>,
    Receiver<Result<Bytes, io::Error>>,
);

async fn index(req: tide::Request<State>) -> tide::Result<Response> {
    let static_root_dir = &req.state().static_root_dir;
    if let Some(static_root_dir) = static_root_dir {
        let mut res = Response::new(StatusCode::Ok);
        res.set_body(
            Body::from_file(
                static_root_dir
                    .join(req.url().path().get(1..).unwrap())
                    .join("index.html"),
            )
            .await
            .unwrap(),
        );

        Ok(res)
    } else {
        let res = Response::new(StatusCode::NotFound);
        Ok(res)
    }
}

async fn async_main(initial_state: State) -> Result<()> {
    let http_port = initial_state.http_port;
    let tcp_port = initial_state.tcp_port;
    let engine = initial_state.engine.clone();

    if let Some(http_port) = http_port {
        let http_server = http_server(initial_state).unwrap();
        let http_listener = http_server.listen("0.0.0.0:".to_owned() + &http_port.to_string());
        if let Some(tcp_port) = tcp_port {
            let tcp_listener = tcp::listen(format!("0.0.0.0:{}", tcp_port), engine);
            futures::try_join!(http_listener, tcp_listener)?;
        } else {
            http_listener.await?;
        }
    } else {
        if let Some(tcp_port) = tcp_port {
            tcp::listen(format!("0.0.0.0:{}", tcp_port), engine).await?;
        } else {
            anyhow::bail!("Either tcp_port or http_port has to be provided");
        };
    }

    Ok(())
}

fn http_server(initial_state: State) -> Result<tide::Server<State>> {
    let static_root_dir = initial_state.static_root_dir.clone();
    let mut app = tide::with_state(initial_state);

    if let Some(static_root_dir) = static_root_dir {
        app.at("").get(index);
        app.at("/extendedmind").get(index);
        app.at("/").serve_dir(static_root_dir.to_str().unwrap())?;
    }

    app.at("/extendedmind/hypercore").get(WebSocket::new(
        |req: tide::Request<State>, stream| async move {
            debug!("WS connect to hypercore");
            // Get handle to async-tungstenite WebSocketStream
            let ws_writer = stream.clone();
            let mut ws_reader = stream.clone();

            // Create engine and hypercore channels for this connection
            let (engine_sender, hypercore_receiver): ChannelSenderReceiver = bounded(1000);
            let (hypercore_sender, engine_receiver): ChannelSenderReceiver = bounded(1000);

            // Create the engine event channel
            let (engine_event_sender, engine_event_receiver): (
                Sender<EngineEvent>,
                Receiver<EngineEvent>,
            ) = async_std::channel::bounded(1000);

            // Get passable handle on engine
            let engine = req.state().engine.clone();

            // Launch a task for the protocol
            task::spawn(async move {
                engine
                    .connect_passive(
                        ChannelWriter::new(engine_sender),
                        engine_receiver,
                        engine_event_sender,
                        engine_event_receiver,
                    )
                    .await
                    .ok();
            });

            // Create channel for client data
            let (client_sender, client_receiver): ChannelSenderReceiver = bounded(1000);

            // Launch a second task for listening to receivers
            task::spawn(async move {
                let receivers = collect_receivers(req.state(), hypercore_receiver, client_receiver);
                let mut merged_receivers = futures::stream::select_all(receivers);
                let mut now = Instant::now();
                while let Some(Ok(wrapped_value)) = merged_receivers.next().await {
                    match wrapped_value.receiver_type {
                        ReceiverType::System => {
                            if wrapped_value.data.as_ref().get(0)
                                == Some(&(SystemCommand::Disconnect as u8))
                            {
                                debug!("got disconnect");
                                ws_writer.send(Message::Close(None)).await.unwrap();
                                break;
                            }
                            // Send ping message if enough time has elapsed
                            if now.elapsed().as_secs() > 30 {
                                debug!("sending ping");
                                ws_writer.send(Message::Ping(Vec::new())).await.unwrap();
                                now = Instant::now();
                            }
                        }
                        ReceiverType::Client => {
                            debug!(
                                "got client request, forwarding to hypercore {}",
                                wrapped_value.data.len()
                            );
                            hypercore_sender
                                .clone()
                                .send(Ok(wrapped_value.data))
                                .await
                                .unwrap();
                        }
                        ReceiverType::Hypercore => {
                            let msg = wrapped_value.data.as_ref().to_vec();
                            debug!("got hypercore message, sending to client, {:?}", msg.len());
                            ws_writer.send(Message::Binary(msg)).await.unwrap();
                        }
                    }
                }
            });

            // Block loop on incoming messages
            while let Some(Ok(Message::Binary(msg))) = ws_reader.next().await {
                debug!("got incoming client message {:?}", msg.len());
                client_sender.send(Ok(Bytes::from(msg))).await.unwrap();
            }
            Ok(())
        },
    ));
    return Ok(app);
}

fn collect_receivers(
    state: &State,
    hypercore_receiver: Receiver<Result<Bytes, io::Error>>,
    client_receiver: Receiver<Result<Bytes, io::Error>>,
) -> Vec<futures::stream::Map<Receiver<Result<Bytes, io::Error>>, WrappedBytesClosure>> {
    vec![
        state
            .system_commands
            .clone()
            .map(Box::new(|read_result: Result<Bytes, io::Error>| {
                read_result.map(|data| WrappedData {
                    data,
                    receiver_type: ReceiverType::System,
                })
            }) as WrappedBytesClosure),
        hypercore_receiver.map(Box::new(move |read_result: Result<Bytes, io::Error>| {
            read_result.map(|data| WrappedData {
                data,
                receiver_type: ReceiverType::Hypercore,
            })
        }) as WrappedBytesClosure),
        client_receiver.map(Box::new(|read_result: Result<Bytes, io::Error>| {
            read_result.map(|data| WrappedData {
                data,
                receiver_type: ReceiverType::Client,
            })
        }) as WrappedBytesClosure),
    ]
}

#[derive(Parser)]
#[clap(version = "0.1.0", author = "Timo Tiuraniemi <timo.tiuraniemi@iki.fi>")]
struct Opts {
    #[clap(short, long)]
    data_root_dir: PathBuf,
    #[clap(short, long)]
    static_root_dir: Option<PathBuf>,
    #[clap(short, long)]
    http_port: Option<u16>,
    #[clap(short, long)]
    tcp_port: Option<u16>,
    #[clap(short, long)]
    log_to_stderr: bool,
}

fn setup_logging(log_to_stderr: bool) {
    let base_config = fern::Dispatch::new()
        .format(|out, message, record| {
            out.finish(format_args!(
                "{}[{}][{}] {}",
                chrono::Local::now().format("[%Y-%m-%d %H:%M:%S]"),
                record.target(),
                record.level(),
                message
            ))
        })
        .level(log::LevelFilter::Debug);
    let std_config = if log_to_stderr {
        fern::Dispatch::new().chain(std::io::stderr())
    } else {
        fern::Dispatch::new().chain(std::io::stdout())
    };

    base_config.chain(std_config).apply().unwrap();
}

fn main() -> Result<()> {
    // Read in command line arguments and setup logging
    let opts: Opts = Opts::parse();
    setup_logging(opts.log_to_stderr);
    info!("enter: hub");
    let data_root_dir = &opts.data_root_dir;

    // Initialize the engine blocking
    let engine =
        futures::executor::block_on(
            async move { Engine::new_disk(data_root_dir, false, None).await },
        );

    // Create channels
    let (system_command_sender, system_command_receiver): ChannelSenderReceiver = bounded(1000);

    // Create state for websocket
    let initial_state = State {
        engine,
        system_commands: system_command_receiver,
        http_port: opts.http_port,
        tcp_port: opts.tcp_port,
        data_root_dir: opts.data_root_dir,
        static_root_dir: opts.static_root_dir,
    };

    // Listen to ctrlc in a separate task
    let ctrlc = CtrlC::new().expect("cannot create Ctrl+C handler?");
    let disconnect_sender = system_command_sender.clone();
    let abort: Arc<Mutex<AtomicBool>> = Arc::new(Mutex::new(AtomicBool::new(false)));
    let abort_writer = abort.clone();
    task::spawn(async move {
        ctrlc.await;
        disconnect_sender
            .send(Ok(Bytes::from_static(&[SystemCommand::Disconnect as u8])))
            .await
            .unwrap();
        *abort_writer.as_ref().lock().await = AtomicBool::new(true);
        // Wait 200ms before killing, to allow time for file saving and closing sockets
        task::sleep(Duration::from_millis(200)).await;
        process::exit(0);
    });

    // Need to start a system executor to send the WakeUp command, we send it once per second so
    // that the listener will send a WS Ping when it wants to in a 1s delay.
    task::spawn(async move {
        let mut interval = async_std::stream::interval(Duration::from_secs(1));
        while interval.next().await.is_some() && !*abort.as_ref().lock().await.get_mut() {
            task::sleep(Duration::from_millis(1000)).await;
            system_command_sender
                .send(Ok(Bytes::from_static(&[SystemCommand::WakeUp as u8])))
                .await
                .unwrap();
        }
    });

    // Block server with initial state
    futures::executor::block_on(async_main(initial_state))?;

    Ok(())
}
