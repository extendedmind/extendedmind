mod channel_writer;

use ::serde_json;
use anyhow::Result;
use async_std::channel::Receiver;
use async_std::sync::{Arc, Mutex};
use derivative::Derivative;
use extendedmind_schema_rust::models::Data as ExtendedMindData;
use futures::io::{AsyncRead, AsyncWrite};
use futures::stream::{IntoAsyncRead, StreamExt, TryStreamExt};
use hypercore_protocol::{Event, ProtocolBuilder};
use log::*;
use random_access_memory::RandomAccessMemory;
use std::fmt::Debug;
use std::io;

pub use automerge::{
    Backend as AutomergeBackend, BackendError as AutomergeBackendError,
    Frontend as AutomergeFrontend, FrontendError as AutomergeFrontendError, LocalChange,
    Path as AutomergePath, Value as AutomergeValue,
};
pub use bytes::Bytes;
pub use channel_writer::ChannelWriter;
pub use hypercore::Store;
pub use hypercore_protocol::Protocol;
#[cfg(not(target_arch = "wasm32"))]
pub use random_access_disk::RandomAccessDisk;
pub use random_access_storage::RandomAccess;

mod communication;
pub use communication::FeedStore;
mod common;
pub use common::FeedWrapper;
mod persistence;

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

#[cfg(not(target_arch = "wasm32"))]
impl Engine<RandomAccessDisk> {
    pub async fn new_disk(
        is_initiator: bool,
        public_key: Option<String>,
    ) -> Engine<RandomAccessDisk> {
        let mut feedstore: FeedStore<RandomAccessDisk> = FeedStore::new();

        // Create a hypercore.
        let remote_feed = persistence::get_disk_feed(is_initiator, public_key).await;

        // let local_feed = Feed::open(format!("/tmp/testlocal_{}.db", is_initiator))
        //     .await
        //     .unwrap();

        // Wrap it and add to the feed store.
        let remote_feed_wrapper = FeedWrapper::from(remote_feed);
        // let local_feed_wrapper = FeedWrapper::from_disk_feed(local_feed);
        feedstore.add(remote_feed_wrapper);
        // feedstore.add(local_feed_wrapper);

        Engine {
            data: get_initial_data(),
            is_initiator,
            feedstore: Arc::new(feedstore),
        }
    }
}

impl Engine<RandomAccessMemory> {
    pub fn new_memory() -> Engine<RandomAccessMemory> {
        let feedstore: FeedStore<RandomAccessMemory> = FeedStore::new();
        Engine {
            data: get_initial_data(),
            is_initiator: true,
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
        data.as_ref().unwrap().get_heads().len()
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
        assert_eq!(1, Engine::new_memory().get_data_heads_len().await);
    }
}
