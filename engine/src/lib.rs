use ::serde_json;
use anyhow::Result;
use async_std::sync::{Arc, Mutex, Receiver, Sender};
use async_std::task;
use extendedmind_schema_rust::models::Data;
use futures::io::AsyncWrite;
use futures::stream::{IntoAsyncRead, StreamExt, TryStreamExt};
use futures::task::{Context, Poll};
use hypercore::{Feed, Node, Proof, PublicKey, Signature, Storage};
use log::*;
use random_access_disk::RandomAccessDisk;
use random_access_storage::RandomAccess;
use std::collections::HashMap;
use std::fmt::Debug;
use std::io;
use std::path::PathBuf;
use std::pin::Pin;

pub use bytes::Bytes;
use hypercore_protocol::schema::*;
pub use hypercore_protocol::Protocol;
use hypercore_protocol::{discovery_key, Channel, Event, Message, ProtocolBuilder};

#[derive(Clone)]
pub struct Engine {
    data: Data,
    is_initiator: bool,
    feedstore: Option<Arc<FeedStore<RandomAccessDisk>>>,
}

#[derive(Clone, Debug)]
pub struct AsyncSender {
    sender: Sender<Result<Bytes, io::Error>>,
}

impl AsyncSender {
    pub fn new(sender: Sender<Result<Bytes, io::Error>>) -> AsyncSender {
        AsyncSender { sender }
    }

    pub async fn send(self: Self, msg: Bytes) {
        self.sender.send(Ok(msg)).await
    }
}

//
// hypercore-protocol-rs has an example that uses piper:
//
// https://github.com/Jancd/piper
//
//
impl AsyncWrite for AsyncSender {
    fn poll_write(
        self: Pin<&mut Self>,
        _: &mut Context<'_>,
        buf: &[u8],
    ) -> Poll<io::Result<usize>> {
        let buf_size = buf.len();
        // TODO: This is not very efficient when we need to copy every buffer.
        let bytes_buf = Bytes::copy_from_slice(buf);
        dbg!("BYTES BUF SIZE {}", buf_size);
        let result: io::Result<usize> = Pin::new(&mut &*self)
            .sender
            .try_send(Ok(bytes_buf))
            .map(|_| buf_size)
            .map_err(|e| io::Error::new(io::ErrorKind::Other, e.to_string()));
        Poll::Ready(result)
    }

    fn poll_flush(self: Pin<&mut Self>, _: &mut Context<'_>) -> Poll<io::Result<()>> {
        Poll::Ready(Ok(()))
    }

    fn poll_close(self: Pin<&mut Self>, _: &mut Context<'_>) -> Poll<io::Result<()>> {
        Poll::Ready(Ok(()))
    }
}

impl Engine {
    pub async fn new_disk(is_initiator: bool, public_key: Option<String>) -> Engine {
        let mut feedstore: FeedStore<RandomAccessDisk> = FeedStore::new();

        // Create a hypercore.
        let remote_feed = if let Some(public_key) = public_key {
            let storage = Storage::new_disk(
                &PathBuf::from(format!("/tmp/testremote_{}.db", is_initiator)),
                false,
            )
            .await
            .unwrap();
            let key = hex::decode(public_key).unwrap();
            dbg!("USING GIVEN PUBLIC KEY {}", &key);
            let public_key = PublicKey::from_bytes(key.as_ref()).unwrap();
            Feed::builder(public_key, storage).build().await.unwrap()
        } else {
            dbg!("USING EXISTING");
            let remote_feed = Feed::open(format!("/tmp/testremote_{}.db", is_initiator))
                .await
                .unwrap();
            let public_key = hex::encode(remote_feed.public_key());
            dbg!("PUBLIC KEY {} {}", is_initiator, public_key);
            remote_feed
        };

        // let local_feed = Feed::open(format!("/tmp/testlocal_{}.db", is_initiator))
        //     .await
        //     .unwrap();

        // Wrap it and add to the feed store.
        let remote_feed_wrapper = FeedWrapper::from_disk_feed(remote_feed);
        // let local_feed_wrapper = FeedWrapper::from_disk_feed(local_feed);
        feedstore.add(remote_feed_wrapper);
        // feedstore.add(local_feed_wrapper);
        let feedstore = Arc::new(feedstore);
        Engine {
            data: Data::new(Vec::new(), Vec::new()),
            is_initiator,
            feedstore: Some(feedstore),
        }
    }

    // TEMPORARY....
    pub fn new() -> Engine {
        Engine {
            data: Data::new(Vec::new(), Vec::new()),
            is_initiator: true,
            feedstore: None,
        }
    }
    pub fn get_data(&self) -> String {
        serde_json::to_string(&self.data).unwrap()
    }
    // ...TEMPORARY

    pub async fn connect_passive(
        self,
        receiver: Receiver<Result<Bytes, io::Error>>,
        sender: AsyncSender,
    ) -> Result<()> {
        let receiver: IntoAsyncRead<Receiver<Result<Bytes, io::Error>>> =
            receiver.into_async_read();
        let protocol = ProtocolBuilder::new(false).connect_rw(receiver, sender);
        self.poll_protocol(protocol).await
    }

    pub async fn connect_active(
        self,
        sender: AsyncSender,
        receiver: Receiver<Result<Bytes, io::Error>>,
    ) -> Result<()> {
        let receiver: IntoAsyncRead<Receiver<Result<Bytes, io::Error>>> =
            receiver.into_async_read();
        let protocol = ProtocolBuilder::new(true).connect_rw(receiver, sender);
        self.poll_protocol(protocol).await
    }

    async fn poll_protocol(
        self,
        protocol: Protocol<IntoAsyncRead<Receiver<Result<Bytes, io::Error>>>, AsyncSender>,
    ) -> Result<()> {
        dbg!("poll_protocol");
        let mut protocol = protocol.into_stream();
        let feedstore = self.feedstore.unwrap().clone();
        dbg!("waiting for protocol event");
        while let Some(event) = protocol.next().await {
            dbg!("got protocol event {:?}", &event);
            let event = event?;
            debug!("protocol event {:?}", event);
            match event {
                Event::Handshake(_) => {
                    if self.is_initiator {
                        for feed in feedstore.feeds.values() {
                            let feed_key = feed.key().to_vec();
                            dbg!("Opening feed {}", &feed_key);
                            protocol.open(feed_key).await?;
                        }
                    }
                }
                Event::DiscoveryKey(dkey) => {
                    if let Some(feed) = feedstore.get(&dkey) {
                        protocol.open(feed.key().to_vec()).await?;
                    }
                }
                Event::Channel(channel) => {
                    if let Some(feed) = feedstore.get(&channel.discovery_key()) {
                        feed.onpeer(channel);
                    }
                }
                Event::Close(_dkey) => {}
            }
        }
        Ok(())
    }
}

impl Default for Engine {
    fn default() -> Self {
        Engine::new()
    }
}

// From the hypercore.rs example:

/// A container for hypercores.
struct FeedStore<T>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    feeds: HashMap<String, Arc<FeedWrapper<T>>>,
}
impl<T> FeedStore<T>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    pub fn new() -> Self {
        let feeds = HashMap::new();
        Self { feeds }
    }

    pub fn add(&mut self, feed: FeedWrapper<T>) {
        let hdkey = hex::encode(&feed.discovery_key);
        self.feeds.insert(hdkey, Arc::new(feed));
    }

    pub fn get(&self, discovery_key: &[u8]) -> Option<&Arc<FeedWrapper<T>>> {
        let hdkey = hex::encode(discovery_key);
        self.feeds.get(&hdkey)
    }
}

/// A Feed is a single unit of replication, an append-only log.
#[derive(Debug, Clone)]
struct FeedWrapper<T>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    discovery_key: Vec<u8>,
    key: Vec<u8>,
    feed: Arc<Mutex<Feed<T>>>,
}

impl FeedWrapper<RandomAccessDisk> {
    pub fn from_disk_feed(feed: Feed<RandomAccessDisk>) -> Self {
        let key = feed.public_key().to_bytes();
        FeedWrapper {
            key: key.to_vec(),
            discovery_key: discovery_key(&key),
            feed: Arc::new(Mutex::new(feed)),
        }
    }
}

impl<T> FeedWrapper<T>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send + 'static,
{
    pub fn key(&self) -> &[u8] {
        &self.key
    }

    pub fn onpeer(&self, mut channel: Channel) {
        let mut state = PeerState::default();
        let mut feed = self.feed.clone();
        task::spawn(async move {
            while let Some(message) = channel.next().await {
                let result = onmessage(&mut feed, &mut state, &mut channel, message).await;
                if let Err(e) = result {
                    error!("protocol error: {}", e);
                    break;
                }
            }
        });
    }
}

/// A PeerState stores the head seq of the remote.
/// This would have a bitfield to support sparse sync in the actual impl.
#[derive(Debug)]
struct PeerState {
    remote_head: Option<u64>,
}
impl Default for PeerState {
    fn default() -> Self {
        PeerState { remote_head: None }
    }
}

async fn onmessage<T>(
    feed: &mut Arc<Mutex<Feed<T>>>,
    state: &mut PeerState,
    channel: &mut Channel,
    message: Message,
) -> Result<()>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    match message {
        Message::Open(_) => {
            let msg = Want {
                start: 0,
                length: None,
            };
            channel.send(Message::Want(msg)).await?;
        }
        Message::Have(msg) => {
            if state.remote_head == None {
                state.remote_head = Some(msg.start);
                let msg = Request {
                    index: 0,
                    bytes: None,
                    hash: None,
                    nodes: None,
                };
                channel.send(Message::Request(msg)).await?;
            } else if let Some(remote_head) = state.remote_head {
                if remote_head < msg.start {
                    state.remote_head = Some(msg.start)
                }
            }
        }
        Message::Data(msg) => {
            let mut feed = feed.lock().await;
            let value: Option<&[u8]> = match msg.value.as_ref() {
                None => None,
                Some(value) => {
                    eprintln!(
                        "recv idx {}: {:?}",
                        msg.index,
                        String::from_utf8(value.clone()).unwrap()
                    );
                    Some(value)
                }
            };

            let signature = match msg.signature {
                Some(bytes) => Some(Signature::from_bytes(&bytes)?),
                None => None,
            };
            let nodes = msg
                .nodes
                .iter()
                .map(|n| Node::new(n.index, n.hash.clone(), n.size))
                .collect();
            let proof = Proof {
                index: msg.index,
                nodes,
                signature,
            };

            feed.put(msg.index, value, proof.clone()).await?;

            let i = msg.index;
            let node = feed.get(i).await?;
            if let Some(value) = node {
                println!("feed idx {}: {:?}", i, String::from_utf8(value).unwrap());
            } else {
                println!("feed idx {}: {:?}", i, "NONE");
            }

            let next = msg.index + 1;
            if let Some(remote_head) = state.remote_head {
                if remote_head >= next {
                    // Request next data block.
                    let msg = Request {
                        index: next,
                        bytes: None,
                        hash: None,
                        nodes: None,
                    };
                    channel.send(Message::Request(msg)).await?;
                }
            };
        }
        _ => {}
    };
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_data() {
        assert_eq!("{\"items\":[],\"reminders\":[]}", Engine::new().get_data());
    }
}
