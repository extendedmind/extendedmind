use async_std::task;
use extendedmind_core::{FeedDiskPersistence, Peermerge, RandomAccessDisk, StateEvent};
use futures::channel::mpsc::{unbounded, UnboundedReceiver, UnboundedSender};
use futures::stream::StreamExt;
use peermerge_tcp::connect_tcp_server_disk;

pub async fn listen(
    peermerge: Peermerge<RandomAccessDisk, FeedDiskPersistence>,
    tcp_port: u16,
) -> std::io::Result<()> {
    // Create channels
    let (mut peermerge_state_event_sender, mut peermerge_state_event_receiver): (
        UnboundedSender<StateEvent>,
        UnboundedReceiver<StateEvent>,
    ) = unbounded();

    // Listen to peermerge state events, even if just to log them
    task::spawn(async move {
        while let Some(event) = peermerge_state_event_receiver.next().await {
            log::debug!("Received peermerge event {:?}", event);
        }
    });

    // Start server
    connect_tcp_server_disk(
        peermerge,
        "0.0.0.0",
        tcp_port,
        &mut peermerge_state_event_sender,
    )
    .await
    .unwrap();
    Ok(())
}
