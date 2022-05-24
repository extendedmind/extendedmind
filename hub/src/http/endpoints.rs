use crate::common::{ChannelSenderReceiver, State, SystemCommand};
use async_std::channel::{bounded, Receiver, Sender};
use async_std::task;
use extendedmind_engine::{Bytes, ChannelWriter, EngineEvent};
use futures::stream::StreamExt;
use log::debug;
use std::io;
use std::time::Instant;
use tide::{Body, Response, StatusCode};
use tide_websockets::{Message, WebSocketConnection};

#[derive(Copy, Clone, Debug)]
pub enum ReceiverType {
    System,
    Hypercore,
    Client,
}

#[derive(Clone)]
struct WrappedData {
    data: Bytes,
    receiver_type: ReceiverType,
}

type WrappedBytesClosure =
    Box<dyn Fn(Result<Bytes, io::Error>) -> Result<WrappedData, io::Error> + Send + Sync>;

pub async fn handle_index(req: tide::Request<State>) -> tide::Result<Response> {
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

pub async fn handle_hypercore(
    req: tide::Request<State>,
    stream: WebSocketConnection,
) -> tide::Result<()> {
    debug!("WS connect to hypercore");
    // Get handle to async-tungstenite WebSocketStream
    let ws_writer = stream.clone();
    let mut ws_reader = stream.clone();

    // Create engine and hypercore channels for this connection
    let (engine_sender, hypercore_receiver): ChannelSenderReceiver = bounded(1000);
    let (hypercore_sender, engine_receiver): ChannelSenderReceiver = bounded(1000);

    // Create the engine event channel
    let (engine_event_sender, engine_event_receiver): (Sender<EngineEvent>, Receiver<EngineEvent>) =
        async_std::channel::bounded(1000);

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
