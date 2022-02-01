mod channel_writer;

use anyhow::Result;
use async_std::channel::Receiver;
use async_std::sync::{Arc, Mutex};
use futures::io::{AsyncRead, AsyncWrite};
use futures::stream::{IntoAsyncRead, StreamExt, TryStreamExt};
use log::*;
use random_access_memory::RandomAccessMemory;
use smol_str::SmolStr;
use std::collections::HashMap;
use std::fmt::Debug;
use std::io;
use std::path::PathBuf;

// Non-WASM imports
#[cfg(not(target_arch = "wasm32"))]
use std::io::Write;

pub use automerge;
pub use bytes::Bytes;
pub use channel_writer::ChannelWriter;
pub use extendedmind_schema_rust::capnp;
pub use extendedmind_schema_rust::model_capnp::model;
pub use extendedmind_schema_rust::ui_protocol_capnp::ui_protocol;
pub use extendedmind_schema_rust::wire_protocol_capnp::wire_protocol;
pub use hypercore;
pub use hypercore_protocol;
#[cfg(not(target_arch = "wasm32"))]
pub use random_access_disk::RandomAccessDisk;
pub use random_access_storage::RandomAccess;

mod communication;
use communication::FeedStore;
mod common;
use common::FeedWrapper;

#[derive(derivative::Derivative)]
#[derivative(Clone(bound = ""))]
pub struct Engine<T>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    pub data: Arc<Mutex<Option<automerge::Backend>>>,
    pub is_initiator: bool,
    pub feedstore: Arc<FeedStore<T>>,
}

fn get_initial_data() -> Arc<Mutex<Option<automerge::Backend>>> {
    let mut backend = automerge::Backend::new();
    let mut frontend = automerge::Frontend::new();
    let (_output, change) = frontend
        .change(Some("init".into()), |doc| {
            let mut initial_value = HashMap::<SmolStr, automerge::Value>::new();
            initial_value.insert(
                "version".into(),
                automerge::Value::Primitive(automerge::Primitive::Uint(0)),
            );
            let initial_value = automerge::Value::Map(initial_value);
            doc.add_change(automerge::LocalChange::set(
                automerge::Path::root(),
                initial_value,
            ))
        })
        .unwrap();
    backend.apply_local_change(change.unwrap()).unwrap();
    Arc::new(Mutex::new(Some(backend)))
}

pub fn get_public_key(public_key: &str) -> hypercore::PublicKey {
    let key = hex::decode(public_key).unwrap();
    hypercore::PublicKey::from_bytes(key.as_ref()).unwrap()
}

pub fn get_discovery_key(public_key: hypercore::PublicKey) -> String {
    let public_key = public_key.to_bytes();
    hex::encode(hypercore_protocol::discovery_key(&public_key))
}

#[cfg(not(target_arch = "wasm32"))]
impl Engine<RandomAccessDisk> {
    pub async fn new_disk(
        data_root_dir: &PathBuf,
        is_initiator: bool,
        public_key: Option<&str>,
    ) -> Engine<RandomAccessDisk> {
        let mut feedstore: FeedStore<RandomAccessDisk> = FeedStore::new();

        // Create a hypercore
        let feed_dir = data_root_dir.join(PathBuf::from(format!("{}.db", is_initiator)));
        let primary_feed = if let Some(public_key) = public_key {
            let storage = hypercore::Storage::new_disk(&feed_dir, false)
                .await
                .unwrap();
            dbg!("Disk: Using given public key {}", &public_key);
            let public_key = get_public_key(&public_key);
            hypercore::Feed::builder(public_key, storage)
                .build()
                .await
                .unwrap()
        } else {
            let primary_feed = hypercore::Feed::open(&feed_dir).await.unwrap();
            let public_key = hex::encode(primary_feed.public_key());
            let mut hub_key_file = std::fs::OpenOptions::new()
                .create(true)
                .write(true)
                .truncate(true)
                .open(data_root_dir.join("HUB_KEY.txt"))
                .unwrap();
            hub_key_file.write_all(&public_key.as_bytes()).unwrap();
            hub_key_file.flush().unwrap();
            dbg!(
                "Disk: Reading public key, init: {} value: {}",
                is_initiator,
                public_key
            );
            primary_feed
        };

        // Wrap it and add to the feed store.
        let primary_feed_wrapper = FeedWrapper::from(primary_feed);
        feedstore.add(primary_feed_wrapper);

        Engine {
            data: get_initial_data(),
            is_initiator,
            feedstore: Arc::new(feedstore),
        }
    }
}

impl Engine<RandomAccessMemory> {
    pub async fn new_memory(
        is_initiator: bool,
        public_key: Option<&str>,
    ) -> Engine<RandomAccessMemory> {
        let mut feedstore: FeedStore<RandomAccessMemory> = FeedStore::new();

        let storage = hypercore::Storage::new_memory().await.unwrap();
        let primary_feed = if let Some(public_key) = public_key {
            dbg!("Memory: Using given public key {}", &public_key);
            let public_key = get_public_key(&public_key);
            hypercore::Feed::builder(public_key, storage)
                .build()
                .await
                .unwrap()
        } else {
            let primary_feed = hypercore::Feed::with_storage(storage).await.unwrap();
            let public_key = hex::encode(primary_feed.public_key());
            dbg!(
                "Memory: Reading public key, init: {} value: {}",
                is_initiator,
                public_key
            );
            primary_feed
        };
        let primary_feed_wrapper = FeedWrapper::from(primary_feed);
        feedstore.add(primary_feed_wrapper);

        Engine {
            data: Arc::new(Mutex::new(None)),
            is_initiator,
            feedstore: Arc::new(feedstore),
        }
    }
}

impl<T: 'static> Engine<T>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    pub async fn set_data(&self, backend: automerge::Backend) {
        let mut state = self.data.lock().await;
        *state = Some(backend);
    }

    // TODO: Remove demo function for something more useful
    pub async fn get_data_heads_len(&self) -> usize {
        let data = &mut self.data.lock().await;
        match data.as_ref() {
            None => 0,
            Some(data) => data.get_heads().len(),
        }
    }

    // TODO: Start using this in actual communication
    pub fn demo_create_wire_protocol_message(&self) -> Vec<u8> {
        let mut message = capnp::message::TypedBuilder::<wire_protocol::Owned>::new_default();
        {
            let mut wire_protocol = message.init_root();
            wire_protocol.set_version(99);
            let wire_message = wire_protocol.init_message();
            let personal_access_key = wire_message.init_share_personal_access_key(2);
            personal_access_key.fill(5);
        }
        let mut packed_message = Vec::<u8>::new();
        capnp::serialize_packed::write_message(&mut packed_message, message.borrow_inner())
            .unwrap();
        packed_message
    }

    // TODO: Start using this in actual communication
    pub fn demo_read_wire_protocol_message(&self, message: &Vec<u8>) -> Vec<u8> {
        let reader = capnp::serialize_packed::read_message(
            message.as_slice(),
            capnp::message::ReaderOptions::new(),
        )
        .unwrap();
        let typed_reader = capnp::message::TypedReader::<_, wire_protocol::Owned>::new(reader);
        let reader_root = typed_reader.get().unwrap();
        let message = reader_root.get_message().which();
        match message {
            Ok(wire_protocol::message::SharePersonalAccessKey(key)) => key.unwrap().to_vec(),
            Ok(wire_protocol::message::ShareCollectiveAccessKeys(_)) => vec![],
            Err(_) => vec![],
        }
    }

    pub fn get_discovery_keys(&self) -> Vec<String> {
        self.feedstore.feeds.keys().cloned().collect()
    }

    pub async fn connect_passive(
        self,
        receiver: Receiver<Result<Bytes, io::Error>>,
        sender: ChannelWriter,
    ) -> Result<()> {
        let receiver: IntoAsyncRead<Receiver<Result<Bytes, io::Error>>> =
            receiver.into_async_read();
        let protocol = hypercore_protocol::ProtocolBuilder::new(false).connect_rw(receiver, sender);
        self.poll_protocol(protocol).await
    }

    pub async fn connect_active(
        self,
        sender: ChannelWriter,
        receiver: Receiver<Result<Bytes, io::Error>>,
    ) -> Result<()> {
        let receiver: IntoAsyncRead<Receiver<Result<Bytes, io::Error>>> =
            receiver.into_async_read();
        let protocol = hypercore_protocol::ProtocolBuilder::new(true).connect_rw(receiver, sender);
        self.poll_protocol(protocol).await
    }

    async fn poll_protocol<IO>(self, mut protocol: hypercore_protocol::Protocol<IO>) -> Result<()>
    where
        IO: AsyncWrite + AsyncRead + Send + Unpin + 'static,
    {
        dbg!("poll_protocol");
        let feedstore = self.feedstore.clone();
        dbg!("waiting for protocol event");
        while let Some(event) = protocol.next().await {
            dbg!("got protocol event {:?}", &event);
            let event = event?;
            debug!("protocol event {:?}", event);
            match event {
                hypercore_protocol::Event::Handshake(_) => {
                    if self.is_initiator {
                        for feed in feedstore.feeds.values() {
                            let feed_key = feed.key().clone();
                            dbg!("Opening feed with key length {}", &feed_key.len());
                            protocol.open(feed_key).await?;
                        }
                    }
                }
                hypercore_protocol::Event::DiscoveryKey(dkey) => {
                    if let Some(feed) = feedstore.get(&dkey) {
                        let feed_key = feed.key().clone();
                        protocol.open(feed_key).await?;
                    }
                }
                hypercore_protocol::Event::Channel(channel) => {
                    if let Some(feed) = feedstore.get(&channel.discovery_key()) {
                        communication::on_peer(feed, channel);
                    }
                }
                hypercore_protocol::Event::Close(_dkey) => {}
                _ => {}
            }
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[async_attributes::test]
    async fn test_demo_code() {
        let engine = Engine::new_memory(true, None).await;
        assert_eq!(0, engine.get_data_heads_len().await);
        let demo_message = engine.demo_create_wire_protocol_message();
        assert_eq!([16, 4, 80, 1, 1, 1, 99, 17, 1, 18, 3, 5, 5], &*demo_message);
        let wire_message = engine.demo_read_wire_protocol_message(&demo_message);
        assert_eq!([5, 5], &*wire_message);
    }

    #[async_attributes::test]
    async fn test_demo_wire_protocol_message() {
        let engine = Engine::new_memory(true, None).await;
        assert_eq!(0, engine.get_data_heads_len().await);
    }
}
