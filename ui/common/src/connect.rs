use extendedmind_core::{
    capnp, ui_protocol, DocumentId, FeedPersistence, Peermerge, RandomAccess, StateEvent,
    StateEventContent, ROOT,
};
use futures::channel::mpsc::{UnboundedReceiver, UnboundedSender};
use futures::stream::StreamExt;
use log::*;
use std::fmt::Debug;

pub async fn poll_state_event<T, U>(
    peermerge: Peermerge<T, U>,
    main_document_id: &DocumentId,
    mut state_event_receiver: UnboundedReceiver<StateEvent>,
    ui_protocol_sender: UnboundedSender<
        capnp::message::TypedBuilder<extendedmind_core::ui_protocol::Owned>,
    >,
    debug_outgoing: bool, // TODO: This is a kludge
) where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send + 'static,
    U: FeedPersistence,
{
    debug!("poll_state_event called");
    let mut remaining_feed_discovery_keys = peermerge.feed_discovery_keys(&main_document_id).await;
    while let Some(event) = state_event_receiver.next().await {
        debug!("got state event {:?}", event);
        match event.content {
            StateEventContent::DocumentInitialized() => {
                if !debug_outgoing {
                    debug!("StateEvent::DocumentInitialized");
                    let message = create_init_message(&peermerge, main_document_id).await;
                    ui_protocol_sender.unbounded_send(message).unwrap();
                }
            }
            StateEventContent::RemotePeerSynced((feed_discovery_key, ..)) => {
                if debug_outgoing && main_document_id == &event.document_id {
                    remaining_feed_discovery_keys.retain(|key| key != &feed_discovery_key);
                    if remaining_feed_discovery_keys.is_empty() {
                        debug!("StateEvent::RemotePeerSynced ready");
                        let message = create_init_message(&peermerge, main_document_id).await;
                        ui_protocol_sender.unbounded_send(message).unwrap();
                    }
                }
            }
            _ => {}
        }
    }
}

async fn create_init_message<T, U>(
    peermerge: &Peermerge<T, U>,
    document_id: &DocumentId,
) -> capnp::message::TypedBuilder<ui_protocol::Owned>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send + 'static,
    U: FeedPersistence,
{
    let version = peermerge
        .get_scalar(document_id, ROOT, "version")
        .await
        .unwrap()
        .unwrap()
        .to_u64()
        .unwrap() as u8;
    let mut message = capnp::message::TypedBuilder::<ui_protocol::Owned>::new_default();
    let mut ui_protocol = message.init_root();
    ui_protocol.set_version(0);
    let payload = ui_protocol.init_payload();
    let mut model = payload.init_init();
    model.set_version(version);
    message
}
