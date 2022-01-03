mod channel_writer;

use ::serde_json;
use anyhow::Result;
use async_std::channel::Receiver;
use async_std::sync::{Arc, Mutex};
use derivative::Derivative;
use extendedmind_schema_rust::models::Data as ExtendedMindData;
use futures::io::{AsyncRead, AsyncWrite};
use futures::stream::{IntoAsyncRead, StreamExt, TryStreamExt};
use hypercore_protocol::{discovery_key, Event, ProtocolBuilder};
use log::*;
use random_access_memory::RandomAccessMemory;
use std::fmt::Debug;
use std::io;
#[cfg(not(target_arch = "wasm32"))]
use std::io::Write;
use std::path::PathBuf;

pub use automerge::{
    Backend as AutomergeBackend, BackendError as AutomergeBackendError,
    Frontend as AutomergeFrontend, FrontendError as AutomergeFrontendError, LocalChange,
    Path as AutomergePath, Value as AutomergeValue,
};
pub use bytes::Bytes;
pub use channel_writer::ChannelWriter;
pub use hypercore::{Feed, PublicKey, Storage, Store};
pub use hypercore_protocol::Protocol;
#[cfg(not(target_arch = "wasm32"))]
pub use random_access_disk::RandomAccessDisk;
pub use random_access_storage::RandomAccess;

mod communication;
pub use communication::FeedStore;
mod common;
pub use common::FeedWrapper;

#[derive(Derivative)]
#[derivative(Clone(bound = ""))]
pub struct Engine<T>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    pub data: Arc<Mutex<Option<AutomergeBackend>>>,
    pub is_initiator: bool,
    pub feedstore: Arc<FeedStore<T>>,
}

fn get_initial_data() -> Arc<Mutex<Option<AutomergeBackend>>> {
    let mut backend = AutomergeBackend::new();
    let mut frontend = AutomergeFrontend::new();
    let (_output, change) = frontend
        .change(Some("init".into()), |doc| {
            doc.add_change(LocalChange::set(
                AutomergePath::root(),
                AutomergeValue::from_json(&serde_json::json!(ExtendedMindData::new(
                    Vec::new(),
                    Vec::new(),
                    Vec::new()
                ))),
            ))
        })
        .unwrap();
    backend.apply_local_change(change.unwrap()).unwrap();
    Arc::new(Mutex::new(Some(backend)))
}

pub fn get_public_key(public_key: &str) -> PublicKey {
    let key = hex::decode(public_key).unwrap();
    PublicKey::from_bytes(key.as_ref()).unwrap()
}

pub fn get_discovery_key(public_key: PublicKey) -> String {
    let public_key = public_key.to_bytes();
    hex::encode(discovery_key(&public_key))
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
            let storage = Storage::new_disk(&feed_dir, false).await.unwrap();
            dbg!("Disk: Using given public key {}", &public_key);
            let public_key = get_public_key(&public_key);
            Feed::builder(public_key, storage).build().await.unwrap()
        } else {
            let primary_feed = Feed::open(&feed_dir).await.unwrap();
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

        let storage = Storage::new_memory().await.unwrap();
        let primary_feed = if let Some(public_key) = public_key {
            dbg!("Memory: Using given public key {}", &public_key);
            let public_key = get_public_key(&public_key);
            Feed::builder(public_key, storage).build().await.unwrap()
        } else {
            let primary_feed = Feed::with_storage(storage).await.unwrap();
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
    pub async fn set_data(&self, backend: AutomergeBackend) {
        let mut state = self.data.lock().await;
        *state = Some(backend);
    }

    pub async fn get_data_heads_len(&self) -> usize {
        let data = &mut self.data.lock().await;
        match data.as_ref() {
            None => 0,
            Some(data) => data.get_heads().len(),
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
        let protocol = ProtocolBuilder::new(false).connect_rw(receiver, sender);
        self.poll_protocol(protocol).await
    }

    pub async fn connect_active(
        self,
        sender: ChannelWriter,
        receiver: Receiver<Result<Bytes, io::Error>>,
    ) -> Result<()> {
        let receiver: IntoAsyncRead<Receiver<Result<Bytes, io::Error>>> =
            receiver.into_async_read();
        let protocol = ProtocolBuilder::new(true).connect_rw(receiver, sender);
        self.poll_protocol(protocol).await
    }

    async fn poll_protocol<IO>(self, mut protocol: Protocol<IO>) -> Result<()>
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
                Event::Handshake(_) => {
                    if self.is_initiator {
                        for feed in feedstore.feeds.values() {
                            let feed_key = feed.key().clone();
                            dbg!("Opening feed with key length {}", &feed_key.len());
                            protocol.open(feed_key).await?;
                        }
                    }
                }
                Event::DiscoveryKey(dkey) => {
                    if let Some(feed) = feedstore.get(&dkey) {
                        let feed_key = feed.key().clone();
                        protocol.open(feed_key).await?;
                    }
                }
                Event::Channel(channel) => {
                    if let Some(feed) = feedstore.get(&channel.discovery_key()) {
                        communication::on_peer(feed, channel);
                    }
                }
                Event::Close(_dkey) => {}
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
    async fn test_get_data_heads_len() {
        let engine = Engine::new_memory(true, None).await;
        assert_eq!(0, engine.get_data_heads_len().await);
    }
}
