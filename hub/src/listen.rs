use async_std::task;
use extendedmind_core::StateEvent;
use futures::channel::mpsc::{unbounded, UnboundedReceiver, UnboundedSender};
use futures::stream::StreamExt;
use peermerge_tcp::connect_tcp_server_disk;

use crate::{common::AdminCommand, init::InitializeResult};

pub async fn listen(initialize_result: InitializeResult, tcp_port: u16) -> std::io::Result<()> {
    // Create channels
    let (mut peermerge_state_event_sender, mut peermerge_state_event_receiver): (
        UnboundedSender<StateEvent>,
        UnboundedReceiver<StateEvent>,
    ) = unbounded();

    // Listen to admin commands
    let mut admin_command_receiver = initialize_result.admin_command_receiver;
    let admin_result_sender = initialize_result.admin_result_sender;
    let mut peermerge_for_task = initialize_result.peermerge.clone();
    task::spawn(async move {
        while let Some(event) = admin_command_receiver.next().await {
            match event {
                AdminCommand::Register { peermerge_doc_url } => {
                    peermerge_for_task
                        .attach_proxy_document_disk(&peermerge_doc_url)
                        .await;
                    admin_result_sender.try_send(Ok(())).unwrap();
                }
                AdminCommand::BustCache { .. } => {
                    // Nothing to do, just exit
                    admin_result_sender.try_send(Ok(())).unwrap();
                }
            }
        }
    });

    // Listen to peermerge state events, even if just to log them
    task::spawn(async move {
        while let Some(event) = peermerge_state_event_receiver.next().await {
            log::debug!("Received peermerge event {:?}", event);
        }
    });

    // Start server
    connect_tcp_server_disk(
        initialize_result.peermerge,
        "0.0.0.0",
        tcp_port,
        &mut peermerge_state_event_sender,
    )
    .await
    .unwrap();
    Ok(())
}
