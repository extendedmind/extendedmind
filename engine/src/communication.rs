use crate::common::PeerState;
use anyhow::Result;
use async_std::sync::{Arc, Mutex};
use async_std::task;
use futures::stream::StreamExt;
use hypercore::{Feed, Node, NodeTrait, Proof, Signature};
use hypercore_protocol::schema::*;
use hypercore_protocol::{Channel, Message};
use log::*;
use random_access_storage::RandomAccess;
use std::collections::HashMap;
use std::convert::TryFrom;
use std::fmt::Debug;

use crate::common::FeedWrapper;

/// A container for hypercores.
#[derive(Debug)]
pub struct FeedStore<T>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    pub feeds: HashMap<String, Arc<FeedWrapper<T>>>,
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

    pub fn get(&self, discovery_key: &[u8; 32]) -> Option<&Arc<FeedWrapper<T>>> {
        let hdkey = hex::encode(discovery_key);
        self.feeds.get(&hdkey)
    }
}

pub fn on_peer<T: 'static>(feed_wrapper: &Arc<FeedWrapper<T>>, mut channel: Channel)
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    let mut state = PeerState::default();
    let mut feed = feed_wrapper.feed.clone();

    #[cfg(not(target_arch = "wasm32"))]
    task::spawn(async move {
        let msg = Want {
            start: 0,
            length: None,
        };
        channel.send(Message::Want(msg)).await.unwrap();
        while let Some(message) = channel.next().await {
            let result = on_message(&mut feed, &mut state, &mut channel, message).await;
            if let Err(e) = result {
                error!("protocol error: {}", e);
                break;
            }
        }
    });
}

async fn on_message<T>(
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
        Message::Want(msg) => {
            let mut feed = feed.lock().await;
            if feed.has(msg.start) {
                channel
                    .have(Have {
                        start: msg.start,
                        ack: None,
                        bitfield: None,
                        length: None,
                    })
                    .await?;
            }
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
        Message::Request(request) => {
            let mut feed = feed.lock().await;
            let index = request.index;
            let value = feed.get(index).await?;
            let proof = feed.proof(index, false).await?;
            let nodes = proof
                .nodes
                .iter()
                .map(|node| data::Node {
                    index: NodeTrait::index(node),
                    hash: NodeTrait::hash(node).to_vec(),
                    size: NodeTrait::len(node),
                })
                .collect();
            let message = Data {
                index,
                value: value.clone(),
                nodes,
                signature: proof.signature.map(|s| s.to_bytes().to_vec()),
            };
            channel.data(message).await?;
        }
        Message::Data(msg) => {
            let mut feed = feed.lock().await;
            let value: Option<&[u8]> = match msg.value.as_ref() {
                None => None,
                Some(value) => {
                    // eprintln!(
                    //     "recv idx {}: {:?}",
                    //     msg.index,
                    //     String::from_utf8(value.clone()).unwrap()
                    // );
                    Some(value)
                }
            };

            let signature = match msg.signature {
                Some(bytes) => Some(Signature::try_from(&bytes[..])?),
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
