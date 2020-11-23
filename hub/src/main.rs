use anyhow::Result;
use std::collections::HashMap;
use std::io;
use std::process;
use std::sync::atomic::AtomicBool;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tide::Request;

use async_std::sync::{channel, Arc, Receiver, Sender};
use futures::sink::SinkExt;
use futures::stream::StreamExt;

use async_ctrlc::CtrlC;
use async_std::task;

use extendedmind_engine::{AsyncSender, Bytes, Engine};

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
    system_commands: Receiver<Result<Bytes, io::Error>>,
    // Stores
    streams: HashMap<String, (AsyncSender, Receiver<Result<Bytes, io::Error>>)>,
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

    app.at("/ws/:discovery_key")
        .get(|req: Request<State>| async move {
            tide::websocket::upgrade(req, |_req, handle| async move {
                // https://docs.rs/async-tungstenite/0.10.0/async_tungstenite/struct.WebSocketStream.html
                let ws = handle.into_inner();
                let (mut ws_writer, mut ws_reader) = ws.split();
                let discovery_key: String = _req.param("discovery_key")?.parse().unwrap();
                dbg!(&discovery_key);
                let (client_sender, client_receiver): ChannelSenderReceiver = channel(1000);
                let discovery_key: Arc<String> = Arc::new("demo".to_string());
                task::spawn(async move {
                    let (receivers, hypercore_sender) = collect_receivers_and_sender(
                        _req.state(),
                        client_receiver.clone(),
                        discovery_key,
                    );
                    let mut merged_receivers = futures::stream::select_all(receivers);
                    let mut now = Instant::now();
                    while let Some(Ok(wrapped_value)) = merged_receivers.next().await {
                        match wrapped_value.receiver_type {
                            ReceiverType::System => {
                                if wrapped_value.data.as_ref().get(0)
                                    == Some(&(SystemCommand::Disconnect as u8))
                                {
                                    dbg!("got disconnect");
                                    ws_writer.close().await.unwrap();
                                    break;
                                }
                                // Send ping message if enough time has elapsed
                                if now.elapsed().as_secs() > 30 {
                                    dbg!("sending ping");
                                    ws_writer
                                        .send(tungstenite::Message::Ping(Vec::new()))
                                        .await
                                        .unwrap();
                                    now = Instant::now();
                                }
                            }
                            ReceiverType::Client => {
                                dbg!(
                                    "got client request, forwarding to hypercore {}",
                                    wrapped_value.data.len()
                                );
                                hypercore_sender.clone().send(wrapped_value.data).await;
                            }
                            ReceiverType::Hypercore => {
                                let msg = wrapped_value.data.as_ref().to_vec();
                                dbg!("got hypercore message, sending to client, {:?}", msg.len());
                                ws_writer
                                    .send(tungstenite::Message::Binary(msg))
                                    .await
                                    .unwrap();
                            }
                        }
                    }
                });
                loop {
                    let incoming_msg = ws_reader.next().await;
                    let msg = incoming_msg.unwrap().unwrap();
                    dbg!("got incoming client message {:?}", msg.len());
                    client_sender.send(Ok(Bytes::from(msg.into_data()))).await;
                }
            })
        });

    app.listen("0.0.0.0:8080").await?;
    Ok(())
}

type CollectedReceiversAndSender = (
    Vec<futures::stream::Map<Receiver<Result<Bytes, io::Error>>, WrappedBytesClosure>>,
    AsyncSender,
);

fn collect_receivers_and_sender(
    state: &State,
    client_receiver: Receiver<Result<Bytes, io::Error>>,
    discovery_key: Arc<String>,
) -> CollectedReceiversAndSender {
    let (writer, reader) = state.streams[discovery_key.as_ref()].clone();
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

    let (ping_sender, system_command_receiver): ChannelSenderReceiver = channel(1000);
    let (incoming_sender, incoming_receiver): ChannelSenderReceiver = channel(1000);
    let (outgoing_sender, outgoing_receiver): ChannelSenderReceiver = channel(1000);
    let incoming_sender = AsyncSender::new(incoming_sender);
    let outgoing_sender = AsyncSender::new(outgoing_sender);
    let initial_state = State {
        system_commands: system_command_receiver,
        streams: [("demo".to_string(), (incoming_sender, outgoing_receiver))]
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
            .await;
        *abort_writer.as_ref().lock().unwrap() = AtomicBool::new(true);
        // Wait 2s before killing, to allow time for file saving and closing sockets
        task::sleep(Duration::from_millis(2000)).await;
        process::exit(0);
    });

    // Need to start a system executor to send the WakeUp command, we send it once per second so
    // that the listener will send a WS Ping when it wants to in a 1s delay.
    task::spawn(async move {
        let mut interval = async_std::stream::interval(Duration::from_secs(1));
        while interval.next().await.is_some() && !*abort.as_ref().lock().unwrap().get_mut() {
            task::sleep(Duration::from_millis(1000)).await;
            // dbg!("Sending WakeUp");
            ping_sender
                .send(Ok(Bytes::from_static(&[SystemCommand::WakeUp as u8])))
                .await;
        }
    });

    // Launch a task for the demo owner
    task::spawn(async move {
        let engine = Engine::new_disk(false, None).await;
        engine
            .connect_passive(incoming_receiver, outgoing_sender)
            .await
            .unwrap();
    });

    // Block server with initial state
    futures::executor::block_on(async_main(initial_state))?;

    Ok(())
}
