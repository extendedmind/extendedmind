use extendedmind_core::{
    capnp, ui_protocol, DocumentId, FeedDiskPersistence, Peermerge, RandomAccessDisk, StateEvent,
    StateEventContent, ROOT,
};
use futures::channel::mpsc::{UnboundedReceiver, UnboundedSender};
use futures::stream::StreamExt;
use log::*;

pub async fn poll_state_event(
    peermerge: Peermerge<RandomAccessDisk, FeedDiskPersistence>,
    main_document_id: &DocumentId,
    mut state_event_receiver: UnboundedReceiver<StateEvent>,
    ui_protocol_sender: UnboundedSender<
        capnp::message::TypedBuilder<extendedmind_core::ui_protocol::Owned>,
    >,
) {
    debug!("poll_state_event called");
    let mut remaining_feed_discovery_keys = peermerge.feed_discovery_keys(&main_document_id).await;
    while let Some(event) = state_event_receiver.next().await {
        debug!("got state event {:?}", event);
        match event.content {
            StateEventContent::RemotePeerSynced((feed_discovery_key, ..)) => {
                if main_document_id == &event.document_id {
                    remaining_feed_discovery_keys.retain(|key| key != &feed_discovery_key);
                    if remaining_feed_discovery_keys.is_empty() {
                        debug!("StateEvent::DocumentInitialized");
                        let version = peermerge
                            .get_scalar(&event.document_id, ROOT, "version")
                            .await
                            .unwrap()
                            .unwrap();
                        let version = version.to_u64().unwrap() as u8;
                        let mut message =
                            capnp::message::TypedBuilder::<ui_protocol::Owned>::new_default();
                        {
                            let mut ui_protocol = message.init_root();
                            ui_protocol.set_version(0);
                            let payload = ui_protocol.init_payload();
                            let mut model = payload.init_init();
                            model.set_version(version);
                        }
                        ui_protocol_sender.unbounded_send(message).unwrap();
                    }
                }
            }
            _ => {}
        }
    }
}
