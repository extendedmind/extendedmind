use async_std::task;
use extendedmind_hub::extendedmind_engine::{Bytes, ChannelWriter, ProtocolBuilder, StateEvent};
use futures::channel::mpsc::{unbounded, UnboundedReceiver, UnboundedSender};
use futures::stream::{IntoAsyncRead, StreamExt, TryStreamExt};
use log::debug;
use std::io;
use tide_websockets::{Message, WebSocketConnection};

use crate::common::State;

pub type ChannelSenderReceiver = (
    UnboundedSender<Result<Bytes, io::Error>>,
    UnboundedReceiver<Result<Bytes, io::Error>>,
);

pub async fn handle_peermerge(
    req: tide::Request<State>,
    stream: WebSocketConnection,
) -> tide::Result<()> {
    debug!("WS connect to peermerge");
    // Get handle to async-tungstenite WebSocketStream
    let ws_writer = stream.clone();
    let mut ws_reader = stream.clone();

    // Create client and peermerge proxy channels for this connection
    let (client_sender, peermerge_receiver): ChannelSenderReceiver = unbounded();
    let (peermerge_sender, mut client_receiver): ChannelSenderReceiver = unbounded();

    // Create peermerge state event channel
    let (mut state_event_sender, mut state_event_receiver): (
        UnboundedSender<StateEvent>,
        UnboundedReceiver<StateEvent>,
    ) = unbounded();

    // Launch a task for connecting to the protocol
    let mut peermerge_for_task = req.state().peermerge.clone();
    task::spawn(async move {
        let receiver: IntoAsyncRead<UnboundedReceiver<Result<Bytes, io::Error>>> =
            peermerge_receiver.into_async_read();
        let sender = ChannelWriter::new(peermerge_sender);
        let mut protocol = ProtocolBuilder::new(false).connect_rw(receiver, sender);
        peermerge_for_task
            .connect_protocol_disk(&mut protocol, &mut state_event_sender)
            .await
            .expect("Should not error when exiting");
    });

    // Launch a second task for registering peermerge state events
    task::spawn(async move {
        while let Some(event) = state_event_receiver.next().await {
            debug!("Got state event {:?}", event);
        }
    });

    // Launch a third task for listening to client data (coming from peermerge) and passing it on
    // to websocket.
    task::spawn(async move {
        while let Some(Ok(data)) = client_receiver.next().await {
            let msg = data.as_ref().to_vec();
            debug!("got outgoing data, forwarding to websocket {}", msg.len());
            ws_writer.send(Message::Binary(msg)).await.unwrap();
        }
    });

    // Block loop on incoming messages
    while let Some(Ok(Message::Binary(msg))) = ws_reader.next().await {
        debug!("got incoming data, passing to peermerge {:?}", msg.len());
        client_sender.unbounded_send(Ok(Bytes::from(msg))).unwrap();
    }
    Ok(())
}
