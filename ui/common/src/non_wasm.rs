use crate::connect::poll_state_event;
use async_std::task;
use extendedmind_core::{
    capnp, DocumentId, FeedDiskPersistence, NameDescription, Peermerge, RandomAccessDisk, Result,
    StateEvent,
};
use futures::channel::mpsc::{unbounded, UnboundedReceiver, UnboundedSender};
use futures::stream::StreamExt;
use log::*;
use peermerge_tcp::connect_tcp_client_disk;
use std::collections::HashMap;
use std::path::PathBuf;

pub async fn connect_to_hub(
    peermerge: Peermerge<RandomAccessDisk, FeedDiskPersistence>,
    main_document_id: DocumentId,
    hub_domain: &str,
    hub_port: u16,
    ui_protocol_sender: UnboundedSender<
        capnp::message::TypedBuilder<extendedmind_core::ui_protocol::Owned>,
    >,
) -> Result<()> {
    debug!("connect_to_hub called");

    let peermerge_for_task = peermerge.clone();
    let (mut state_event_sender, state_event_receiver): (
        UnboundedSender<StateEvent>,
        UnboundedReceiver<StateEvent>,
    ) = unbounded();
    let hub_host = hub_domain.to_string();
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

    poll_state_event(
        peermerge,
        &main_document_id,
        state_event_receiver,
        ui_protocol_sender,
        true,
    )
    .await;

    Ok(())
}

pub async fn peermerge_state(
    data_root_dir: &PathBuf,
    encryption_key: Option<String>,
) -> (Option<DocumentId>, HashMap<DocumentId, String>) {
    let document_infos = Peermerge::document_infos_disk(&data_root_dir).await;
    let mut encryption_keys: HashMap<DocumentId, String> = HashMap::new();
    if let Some(document_infos) = document_infos {
        let mut main_document_id: Option<DocumentId> = None;
        for document_info in document_infos {
            if document_info.parent_document_id.is_none() && !document_info.doc_url_info.proxy_only
            {
                if main_document_id.is_some() {
                    panic!("Peermerge contains multiple main documents.")
                }
                main_document_id = Some(document_info.document_id);
            }
            if document_info.doc_url_info.encrypted.unwrap_or(false) {
                if let Some(encryption_key) = encryption_key.as_ref() {
                    encryption_keys.insert(document_info.document_id, encryption_key.clone());
                } else {
                    panic!("A document is encrypted but no encryption key given");
                }
            }
        }
        if main_document_id.is_none() {
            panic!("Peermerge doesn't contain a main document.")
        }
        (main_document_id, encryption_keys)
    } else if encryption_key.is_some() {
        panic!("Encryption key given but repository not yet created");
    } else {
        (None, encryption_keys)
    }
}

pub async fn create_document(
    data_root_dir: PathBuf,
    description: Option<String>,
    encrypted: bool,
) -> Result<
    (
        Peermerge<RandomAccessDisk, FeedDiskPersistence>,
        DocumentId,
        String,
        String,
        Option<String>,
    ),
    Box<dyn std::error::Error>,
> {
    let (main_document_id, encryption_keys) = peermerge_state(&data_root_dir, None).await;
    if main_document_id.is_some() {
        panic!("Already created");
    }
    let mut peermerge = get_peermerge(&data_root_dir, encryption_keys).await?;
    let document_header: NameDescription = description.map_or_else(
        || NameDescription::new("extendedmind"),
        |description| NameDescription::new_with_description("extendedmind", &description),
    );
    let document_id = peermerge
        .create_new_document_disk(document_header, vec![("version", 1)], encrypted)
        .await;
    let encryption_key = peermerge.encryption_key(&document_id).await;
    let doc_url = peermerge.doc_url(&document_id).await;
    let proxy_doc_url = peermerge.proxy_doc_url(&document_id).await;
    Ok((
        peermerge,
        document_id,
        doc_url,
        proxy_doc_url,
        encryption_key,
    ))
}

pub async fn back_up(
    data_root_dir: PathBuf,
    encryption_key: Option<String>,
    hub_domain: String,
    hub_port: u16,
) -> Result<(), Box<dyn std::error::Error>> {
    debug!("cli: back-up");
    let (ui_protocol_sender, mut ui_protocol_receiver): (
        UnboundedSender<capnp::message::TypedBuilder<extendedmind_core::ui_protocol::Owned>>,
        UnboundedReceiver<capnp::message::TypedBuilder<extendedmind_core::ui_protocol::Owned>>,
    ) = unbounded();

    let (main_document_id, encryption_keys) = peermerge_state(&data_root_dir, encryption_key).await;
    let main_document_id = main_document_id.expect("Peermerge not created, can't back up");
    let peermerge = get_peermerge(&data_root_dir, encryption_keys).await?;

    task::spawn_local(async move {
        debug!("Connecting to hub");
        connect_to_hub(
            peermerge,
            main_document_id,
            &hub_domain,
            hub_port,
            ui_protocol_sender,
        )
        .await
        .unwrap();
    });

    // TODO: Eventually this would be a loop
    // loop {
    debug!("Begin listening to ui protocol messages");
    let message = ui_protocol_receiver.next().await.unwrap();
    let mut packed_message = Vec::<u8>::new();
    capnp::serialize_packed::write_message(&mut packed_message, message.borrow_inner()).unwrap();
    debug!("Got message {:?}", packed_message);
    // }

    Ok(())
}

pub async fn get_peermerge(
    data_root_dir: &PathBuf,
    encryption_keys: HashMap<DocumentId, String>,
) -> Result<Peermerge<RandomAccessDisk, FeedDiskPersistence>> {
    let peermerge = if Peermerge::document_infos_disk(data_root_dir)
        .await
        .is_some()
    {
        Peermerge::open_disk(encryption_keys, data_root_dir).await
    } else {
        Peermerge::create_new_disk(NameDescription::new("extendedmind_ui"), data_root_dir).await
    };
    Ok(peermerge)
}
