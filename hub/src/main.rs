use anyhow::Result;
use bytes::Bytes;
use std::collections::HashMap;
use std::rc::Rc;
use std::sync::Arc;
use std::time::Duration;
use tide::Request;

use async_std::sync::{channel, Receiver, Sender};
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

#[derive(Clone)]
enum ReceiverType {
    System,
    Hypercore,
}

#[derive(Clone)]
struct State {
    system_commands: Receiver<Bytes>,
    writers: HashMap<String, Sender<Bytes>>,
    readers: HashMap<String, Receiver<Bytes>>,
}

#[derive(Clone)]
struct WrappedData {
    data: Bytes,
    receiver_type: ReceiverType,
    id: Option<String>,
}

type WrappedDataClosure = Box<dyn Fn(Bytes) -> WrappedData + Send + Sync>;

async fn async_main(initial_state: State) -> Result<()> {
    let mut app = tide::with_state(initial_state);

    app.at("/ws").get(|req: Request<State>| async move {
        tide::websocket::upgrade(req, |_req, handle| async move {
            // https://docs.rs/async-tungstenite/0.10.0/async_tungstenite/struct.WebSocketStream.html
            let mut ws = handle.into_inner();
            // Handshake the inner protocol
            let init_msg: Arc<String> = Arc::new(ws.next().await.unwrap().unwrap().to_string());

            let system_commands =
                _req.state()
                    .system_commands
                    .clone()
                    .map(Box::new(|data| WrappedData {
                        data,
                        receiver_type: ReceiverType::System,
                        id: None,
                    }) as WrappedDataClosure);
            dbg!(&init_msg);
            let writer = _req.state().writers[&*init_msg].clone();
            let reader = _req.state().readers[&*init_msg]
                .clone()
                .map(Box::new(move |data| WrappedData {
                    data,
                    receiver_type: ReceiverType::System,
                    id: Some((&*init_msg).to_string()),
                }) as WrappedDataClosure);
            ws.send(Message::Text("reply-to-init".to_string()))
                .await
                .unwrap();

            let streams = vec![system_commands, reader];

            // Start polling
            //
            // Use https://docs.rs/futures/0.3.7/futures/stream/fn.select_all.html
            // to merge many streams.
            futures::stream::select_all(streams).next().await.unwrap();
            let msg = ws.next().await.unwrap().unwrap();
            dbg!(&msg);
            ws.send(msg).await.unwrap();

            loop {
                let msg = Arc::new(ws.next().await.unwrap().unwrap());
                dbg!(&msg);
                // Send somehow!
                // writer.send(Bytes::from_static(&msg.into_data())).await;
            }
        })
    });

    app.listen("0.0.0.0:8080").await?;
    Ok(())
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
        writers: [("demo".to_string(), demo_sender)]
            .iter()
            .cloned()
            .collect(),
        readers: [("demo".to_string(), demo_receiver)]
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
