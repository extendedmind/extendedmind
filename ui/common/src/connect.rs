use extendedmind_engine::{capnp, ui_protocol, Engine, RandomAccess};
use futures::channel::mpsc::UnboundedSender;
use futures::sink::SinkExt;
use log::*;
use std::fmt::Debug;

pub async fn connect_active<T>(engine: Engine<T>, mut msg_sender: UnboundedSender<Vec<u8>>)
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    debug!("connect_to_hub called");

    let mut message = capnp::message::TypedBuilder::<ui_protocol::Owned>::new_default();
    {
        let mut ui_protocol = message.init_root();
        ui_protocol.set_version(99);
        let payload = ui_protocol.init_payload();
        let mut model = payload.init_init();
        model.set_version(55);
    }
    let reader = capnp::message::Reader::new(
        message.borrow_inner().get_segments_for_output(),
        Default::default(),
    );
    let words = &reader.canonicalize().unwrap();
    let bytes = capnp::Word::words_to_bytes(words).to_vec();
    msg_sender.send(bytes).await.unwrap();
}
