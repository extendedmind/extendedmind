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

    msg_sender.send(vec![1]).await.unwrap();
}
