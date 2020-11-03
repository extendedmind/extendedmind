use anyhow::Result;
use bytes::Bytes;
use std::collections::HashMap;
use std::time::Duration;
use tide::Request;

use async_std::sync::{channel, Arc, Receiver, Sender};
use futures::sink::SinkExt;
use futures::stream::StreamExt;
use tungstenite::Message;

use async_std::task;

#[derive(Clone, Copy)]
#[repr(u8)]
enum SystemCommand {
    WakeUp = 1,
    Disconnect = 2,
}

#[derive(Clone, Debug)]
enum ReceiverType {
    System,
    Hypercore,
    Client,
}

#[derive(Clone)]
struct State {
    system_commands: Receiver<Bytes>,
    writers: HashMap<Bytes, Sender<Bytes>>,
    readers: HashMap<Bytes, Receiver<Bytes>>,
}

#[derive(Clone)]
struct WrappedData {
    data: Bytes,
    receiver_type: ReceiverType,
    id: Option<Bytes>,
}

type WrappedBytesClosure = Box<dyn Fn(Bytes) -> WrappedData + Send + Sync>;
// type WrappedWebSocketClosure =
//     Box<dyn Fn(Result<tungstenite::Message, std::io::Error>) -> WrappedData + Send + Sync>;

async fn async_main(initial_state: State) -> Result<()> {
    let mut app = tide::with_state(initial_state);

    app.at("/ws").get(|req: Request<State>| async move {
        tide::websocket::upgrade(req, |_req, handle| async move {
            // https://docs.rs/async-tungstenite/0.10.0/async_tungstenite/struct.WebSocketStream.html
            let (mut ws_writer, mut ws_reader) = handle.into_inner().split();
            let init_msg: Bytes = Bytes::from(ws_reader.next().await.unwrap().unwrap().into_data());
            dbg!(&init_msg);
            let hypercore_writer = _req.state().writers[&*init_msg].clone();
            ws_writer
                .send(Message::Text("reply-to-init".to_string()))
                .await
                .unwrap();
            let (client_sender, client_receiver): (Sender<Bytes>, Receiver<Bytes>) = channel(1000);
            let init_msg: Arc<Bytes> = Arc::new(init_msg.clone());
            task::spawn(async move {
                let receivers = collect_receivers(_req.state(), client_receiver.clone(), init_msg);
                let mut merged = futures::stream::select_all(receivers);
                while let Some(wrapped_value) = merged.next().await {
                    dbg!("got value of type {}", wrapped_value.receiver_type);
                    ws_writer
                        .send(tungstenite::Message::Binary(
                            wrapped_value.data.as_ref().to_vec(),
                        ))
                        .await
                        .unwrap();
                    dbg!("got result");
                }
            });
            loop {
                let incoming_msg = ws_reader.next().await;
                let msg = incoming_msg.unwrap().unwrap();
                client_sender.send(Bytes::from(msg.into_data())).await;
            }
        })
    });

    app.listen("0.0.0.0:8080").await?;
    Ok(())
}

fn collect_receivers(
    state: &State,
    client_receiver: Receiver<Bytes>,
    init_msg: Arc<Bytes>,
) -> Vec<futures::stream::Map<async_std::sync::Receiver<bytes::Bytes>, WrappedBytesClosure>> {
    let reader = state.readers[init_msg.as_ref()].clone();
    vec![
        state
            .system_commands
            .clone()
            .map(Box::new(|data| WrappedData {
                data,
                receiver_type: ReceiverType::System,
                id: None,
            }) as WrappedBytesClosure),
        reader.map(Box::new(move |data| WrappedData {
            data,
            receiver_type: ReceiverType::Hypercore,
            id: Some((*init_msg).clone()),
        }) as WrappedBytesClosure),
        client_receiver.map(Box::new(move |data| WrappedData {
            data,
            receiver_type: ReceiverType::Client,
            id: None,
        }) as WrappedBytesClosure),
    ]
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
    let (ping_sender, system_command_receiver) = channel(1000);
    let (demo_sender, demo_receiver) = channel(1000);
    let initial_state = State {
        system_commands: system_command_receiver,
        writers: [(Bytes::from_static("demo".as_bytes()), demo_sender)]
            .iter()
            .cloned()
            .collect(),
        readers: [(Bytes::from_static("demo".as_bytes()), demo_receiver)]
            .iter()
            .cloned()
            .collect(),
    };

    // TODO: This should be used on SIGINT/SIGTERM
    let disconnect_sender = ping_sender.clone();

    // Need to start a system executor to send the WakeUp command, we send it once per 5 seconds so
    // that the listener will send a WS Ping every 30 to 35 seconds.
    task::spawn(async move {
        loop {
            task::sleep(Duration::from_millis(5000)).await;
            dbg!("Sending WakeUp");
            ping_sender
                .send(Bytes::from_static(&[SystemCommand::WakeUp as u8]))
                .await;
        }
    });

    futures::executor::block_on(async_main(initial_state))?;

    Ok(())
}
