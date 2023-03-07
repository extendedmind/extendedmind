use axum::extract::ws::{Message, WebSocket};
use axum::extract::{ConnectInfo, WebSocketUpgrade};
use axum::response::IntoResponse;
use extendedmind_hub::extendedmind_core::{
    Bytes, ChannelWriter, FeedDiskPersistence, Peermerge, ProtocolBuilder, RandomAccessDisk,
    StateEvent,
};
use futures::channel::mpsc::{unbounded, UnboundedReceiver, UnboundedSender};
use futures::sink::SinkExt;
use futures::stream::{IntoAsyncRead, StreamExt, TryStreamExt};
use log::debug;
use std::io;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::task;

use crate::common::ServerState;

pub type ChannelSenderReceiver = (
    UnboundedSender<Result<Bytes, io::Error>>,
    UnboundedReceiver<Result<Bytes, io::Error>>,
);

pub async fn handle_websocket(
    ws: WebSocketUpgrade,
    axum::extract::State(state): axum::extract::State<Arc<ServerState>>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
) -> impl IntoResponse {
    debug!("WS connect to peermerge from {}", addr);
    let peermerge = state.peermerge.clone();
    ws.on_upgrade(move |socket| handle_websocket_upgrade(socket, addr, peermerge))
}

async fn handle_websocket_upgrade(
    socket: WebSocket,
    addr: SocketAddr,
    peermerge: Peermerge<RandomAccessDisk, FeedDiskPersistence>,
) {
    debug!("WS upgrade to peermerge from {}", addr);
    let (mut ws_writer, mut ws_reader) = socket.split();

    // Create client and peermerge proxy channels for this connection
    let (client_sender, peermerge_receiver): ChannelSenderReceiver = unbounded();
    let (peermerge_sender, mut client_receiver): ChannelSenderReceiver = unbounded();

    // Create peermerge state event channel
    let (mut state_event_sender, mut state_event_receiver): (
        UnboundedSender<StateEvent>,
        UnboundedReceiver<StateEvent>,
    ) = unbounded();

    // Launch a task for connecting to the protocol
    let mut peermerge_for_task = peermerge.clone();
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
}
