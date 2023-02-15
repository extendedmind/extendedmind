use crate::connect::poll_state_event;
use async_std::task;
use extendedmind_core::{
    capnp, FeedDiskPersistence, NameDescription, Peermerge, RandomAccessDisk, Result, StateEvent,
};
use futures::channel::mpsc::{unbounded, UnboundedReceiver, UnboundedSender};
use log::*;
use peermerge_tcp::connect_tcp_client_disk;
use std::collections::HashMap;
use std::path::PathBuf;

pub async fn connect_to_hub(
    data_root_dir: PathBuf,
    hub_host: &str,
    hub_port: u16,
    doc_url: &str,
    ui_protocol_sender: UnboundedSender<
        capnp::message::TypedBuilder<extendedmind_core::ui_protocol::Owned>,
    >,
) -> Result<()> {
    debug!("connect_to_hub called");

    let mut peermerge = get_peermerge(&data_root_dir).await?;
    let doc_id = peermerge.attach_proxy_document_disk(&doc_url).await;
    let peermerge_for_task = peermerge.clone();
    let (mut state_event_sender, state_event_receiver): (
        UnboundedSender<StateEvent>,
        UnboundedReceiver<StateEvent>,
    ) = unbounded();
    let hub_host = hub_host.to_string();
    task::spawn(async move {
        connect_tcp_client_disk(
            peermerge_for_task,
            &hub_host,
            hub_port,
            &mut state_event_sender,
        )
        .await
        .unwrap();
    });

    poll_state_event(peermerge, doc_id, state_event_receiver, ui_protocol_sender).await;

    Ok(())
}

async fn get_peermerge(
    data_root_dir: &PathBuf,
) -> Result<Peermerge<RandomAccessDisk, FeedDiskPersistence>> {
    let peermerge = if Peermerge::document_infos_disk(data_root_dir)
        .await
        .is_some()
    {
        Peermerge::open_disk(HashMap::new(), data_root_dir).await
    } else {
        Peermerge::create_new_disk(NameDescription::new("extendedmind_proxy"), data_root_dir).await
    };
    Ok(peermerge)
}
