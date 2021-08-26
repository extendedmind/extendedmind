use anyhow::Result;
use async_std::channel::{bounded, Receiver, Sender};
use async_std::sync::{Arc, Mutex};
use futures::stream::StreamExt;
use log::*;
use std::collections::HashMap;
use std::io;
use std::process;
use std::sync::atomic::AtomicBool;
use std::time::{Duration, Instant};
use tide_websockets::{Message, WebSocket};

use async_ctrlc::CtrlC;
use async_std::task;

use extendedmind_engine::{Bytes, ChannelWriter, Engine};

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

#[derive(Clone)]
struct State {
    // Engine
    engine: Engine,
    // System command receiver
    system_commands: Receiver<Result<Bytes, io::Error>>,
    // Stores the channels needed to make a protocol
    channels: HashMap<String, SplitChannels>,
}

#[derive(Clone)]
struct SplitChannels {
    engine_channel: (
        Sender<Result<Bytes, io::Error>>,
        Receiver<Result<Bytes, io::Error>>,
    ),
    socket_channel: (
        Sender<Result<Bytes, io::Error>>,
        Receiver<Result<Bytes, io::Error>>,
    ),
}

#[derive(Clone)]
struct WrappedData {
    data: Bytes,
    receiver_type: ReceiverType,
    discovery_key: Option<String>,
}

type WrappedBytesClosure =
    Box<dyn Fn(Result<Bytes, io::Error>) -> Result<WrappedData, io::Error> + Send + Sync>;

type ChannelSenderReceiver = (
    Sender<Result<Bytes, io::Error>>,
    Receiver<Result<Bytes, io::Error>>,
);

async fn async_main(initial_state: State) -> Result<()> {
    let mut app = tide::with_state(initial_state);

    app.at("/ws/:discovery_key").get(WebSocket::new(
        |req: tide::Request<State>, stream| async move {
            // Get handle to async-tungstenite WebSocketStream
            let ws_writer = stream.clone();
            let mut ws_reader = stream.clone();

            // Get discovery key from the path
            let discovery_key: Arc<String> = Arc::new(req.param("discovery_key")?.parse().unwrap());
            debug!("{}", &discovery_key);

            // Launch a task for the protocol
            let (engine_sender, engine_receiver) = req.state().channels[discovery_key.as_ref()]
                .engine_channel
                .clone();
            let engine = req.state().engine.clone();
            task::spawn(async move {
                engine
                    .connect_passive(engine_receiver, ChannelWriter::new(engine_sender))
                    .await
                    .ok();
            });

            // Launch a second task for listening to receivers
            let (client_sender, client_receiver): ChannelSenderReceiver = bounded(1000);
            task::spawn(async move {
                let (receivers, hypercore_sender) =
                    collect_receivers_and_sender(req.state(), client_receiver, discovery_key);
                let mut merged_receivers = futures::stream::select_all(receivers);
                let mut now = Instant::now();
                while let Some(Ok(wrapped_value)) = merged_receivers.next().await {
                    match wrapped_value.receiver_type {
                        ReceiverType::System => {
                            if wrapped_value.data.as_ref().get(0)
                                == Some(&(SystemCommand::Disconnect as u8))
                            {
                                debug!("got disconnect");
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

    app.listen("0.0.0.0:8080").await?;
    Ok(())
}

type CollectedReceiversAndSender = (
    Vec<futures::stream::Map<Receiver<Result<Bytes, io::Error>>, WrappedBytesClosure>>,
    Sender<Result<Bytes, io::Error>>,
);

fn collect_receivers_and_sender(
    state: &State,
    client_receiver: Receiver<Result<Bytes, io::Error>>,
    discovery_key: Arc<String>,
) -> CollectedReceiversAndSender {
    let (writer, reader) = state.channels[discovery_key.as_ref()]
        .socket_channel
        .clone();
    (
        vec![
            state
                .system_commands
                .clone()
                .map(Box::new(|read_result: Result<Bytes, io::Error>| {
                    read_result.map(|data| WrappedData {
                        data,
                        receiver_type: ReceiverType::System,
                        discovery_key: None,
                    })
                }) as WrappedBytesClosure),
            reader.map(Box::new(move |read_result: Result<Bytes, io::Error>| {
                read_result.map(|data| WrappedData {
                    data,
                    receiver_type: ReceiverType::Hypercore,
                    discovery_key: Some((*discovery_key).clone()),
                })
            }) as WrappedBytesClosure),
            client_receiver.map(Box::new(|read_result: Result<Bytes, io::Error>| {
                read_result.map(|data| WrappedData {
                    data,
                    receiver_type: ReceiverType::Client,
                    discovery_key: None,
                })
            }) as WrappedBytesClosure),
        ],
        writer,
    )
}

fn main() -> Result<()> {
    fern::Dispatch::new()
        .format(|out, message, record| {
            out.finish(format_args!(
                "{}[{}][{}] {}",
                chrono::Local::now().format("[%Y-%m-%d %H:%M:%S]"),
                record.target(),
                record.level(),
                message
            ))
        })
        .level(log::LevelFilter::Debug)
        .chain(std::io::stdout())
        .apply()?;

    // Initialize the engine blocking
    let engine = futures::executor::block_on(async move { Engine::new_disk(false, None).await });

    // Create channels
    let (ping_sender, system_command_receiver): ChannelSenderReceiver = bounded(1000);
    let (incoming_sender, incoming_receiver): ChannelSenderReceiver = bounded(1000);
    let (outgoing_sender, outgoing_receiver): ChannelSenderReceiver = bounded(1000);

    // Create state for websocket
    let initial_state = State {
        engine,
        system_commands: system_command_receiver,
        channels: [(
            "demo".to_string(),
            SplitChannels {
                engine_channel: (incoming_sender, outgoing_receiver),
                socket_channel: (outgoing_sender, incoming_receiver),
            },
        )]
        .iter()
        .cloned()
        .collect(),
    };

    // Listen to ctrlc in a separate task
    let ctrlc = CtrlC::new().expect("cannot create Ctrl+C handler?");
    let disconnect_sender = ping_sender.clone();
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
            // debug!("Sending WakeUp");
            ping_sender
                .send(Ok(Bytes::from_static(&[SystemCommand::WakeUp as u8])))
                .await
                .unwrap();
        }
    });

    // Block server with initial state
    futures::executor::block_on(async_main(initial_state))?;

    Ok(())
}
