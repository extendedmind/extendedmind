use async_std::channel::{Receiver, Sender};
use extendedmind_core::{automerge, capnp, ui_protocol, EngineEvent};
use log::*;

pub async fn poll_engine_event(
    engine_event_receiver: Receiver<EngineEvent>,
    ui_protocol_sender: Sender<capnp::message::TypedBuilder<extendedmind_core::ui_protocol::Owned>>,
) {
    debug!("poll_engine_event called");
    loop {
        let engine_event = engine_event_receiver.recv().await.unwrap();
        match engine_event {
            EngineEvent::DocumentLoaded(doc) => {
                debug!("EngineEvent::DocumentLoaded");
                let (version, _change) = doc.get(&automerge::ROOT, "version").unwrap().unwrap();
                let version = version.to_u64().unwrap() as u8;
                let mut message = capnp::message::TypedBuilder::<ui_protocol::Owned>::new_default();
                {
                    let mut ui_protocol = message.init_root();
                    ui_protocol.set_version(0);
                    let payload = ui_protocol.init_payload();
                    let mut model = payload.init_init();
                    model.set_version(version);
                }
                ui_protocol_sender.send(message).await.unwrap();
            }
        }
    }
}
