pub use extendedmind_engine::{Engine, RandomAccess};
use futures::channel::mpsc::UnboundedSender as Sender;
use futures::sink::SinkExt;
use log::*;
use std::fmt::Debug;

pub enum Message {
    ContentUpdated(u64),
}

pub async fn connect_active<T>(engine: Engine<T>, mut msg_sender: Sender<Message>)
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    debug!("connect_to_hub called");
    msg_sender.send(Message::ContentUpdated(1)).await.unwrap();
}

pub async fn test(mut msg_sender: Sender<Message>) {
    debug!("test");
    msg_sender.send(Message::ContentUpdated(1)).await.unwrap();
}
