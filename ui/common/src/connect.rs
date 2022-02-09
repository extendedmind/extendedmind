use async_std::channel::{Receiver, Sender};
use extendedmind_engine::{automerge, capnp, ui_protocol, EngineEvent};
use log::*;
use std::convert::TryInto;

pub async fn poll_engine_event(
    engine_event_receiver: Receiver<EngineEvent>,
    ui_protocol_sender: Sender<
        capnp::message::TypedBuilder<extendedmind_engine::ui_protocol::Owned>,
    >,
) {
    debug!("poll_engine_event called");
    loop {
        let engine_event = engine_event_receiver.recv().await.unwrap();
        match engine_event {
            EngineEvent::BackendLoaded(backend) => {
                debug!("EngineEvent::BackendLoaded");
                let patch = backend.get_patch().unwrap();
                let mut frontend = automerge::Frontend::new();
                frontend.apply_patch(patch).unwrap();
                let version = frontend
                    .state()
                    .get_value(automerge::Path::root().key("version"))
                    .unwrap();
                let version = version.primitive().unwrap().uint().unwrap();
                let mut message = capnp::message::TypedBuilder::<ui_protocol::Owned>::new_default();
                {
                    let mut ui_protocol = message.init_root();
                    ui_protocol.set_version(0);
                    let payload = ui_protocol.init_payload();
                    let mut model = payload.init_init();
                    model.set_version(version.try_into().unwrap());
                }
                ui_protocol_sender.send(message).await.unwrap();
            }
        }
    }
}
