use crate::common::FeedWrapper;
use crate::common::PeerState;
use anyhow::Result;
use async_std::sync::{Arc, Mutex};
use async_std::task;
use futures::stream::StreamExt;
use log::*;
use random_access_storage::RandomAccess;
use std::collections::HashMap;
use std::convert::TryFrom;
use std::fmt::Debug;

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

pub fn on_peer<T: 'static>(
    feed_wrapper: &Arc<FeedWrapper<T>>,
    mut channel: hypercore_protocol::Channel,
) where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    let mut state = PeerState::default();
    let mut feed = feed_wrapper.feed.clone();

    #[cfg(not(target_arch = "wasm32"))]
    task::spawn(async move {
        let msg = hypercore_protocol::schema::Want {
            start: 0,
            length: None,
        };
        channel
            .send(hypercore_protocol::Message::Want(msg))
            .await
            .unwrap();
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
    feed: &mut Arc<Mutex<hypercore::Feed<T>>>,
    state: &mut PeerState,
    channel: &mut hypercore_protocol::Channel,
    message: hypercore_protocol::Message,
) -> Result<()>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    match message {
        hypercore_protocol::Message::Open(_) => {
            let msg = hypercore_protocol::schema::Want {
                start: 0,
                length: None,
            };
            channel.send(hypercore_protocol::Message::Want(msg)).await?;
        }
        hypercore_protocol::Message::Want(msg) => {
            let mut feed = feed.lock().await;
            if feed.has(msg.start) {
                channel
                    .have(hypercore_protocol::schema::Have {
                        start: msg.start,
                        ack: None,
                        bitfield: None,
                        length: None,
                    })
                    .await?;
            }
        }
        hypercore_protocol::Message::Have(msg) => {
            if state.remote_head == None {
                state.remote_head = Some(msg.start);
                let msg = hypercore_protocol::schema::Request {
                    index: 0,
                    bytes: None,
                    hash: None,
                    nodes: None,
                };
                channel
                    .send(hypercore_protocol::Message::Request(msg))
                    .await?;
            } else if let Some(remote_head) = state.remote_head {
                if remote_head < msg.start {
                    state.remote_head = Some(msg.start)
                }
            }
        }
        hypercore_protocol::Message::Request(request) => {
            let mut feed = feed.lock().await;
            let index = request.index;
            let value = feed.get(index).await?;
            let proof = feed.proof(index, false).await?;
            let nodes = proof
                .nodes
                .iter()
                .map(|node| hypercore_protocol::schema::data::Node {
                    index: hypercore::NodeTrait::index(node),
                    hash: hypercore::NodeTrait::hash(node).to_vec(),
                    size: hypercore::NodeTrait::len(node),
                })
                .collect();
            let message = hypercore_protocol::schema::Data {
                index,
                value: value.clone(),
                nodes,
                signature: proof.signature.map(|s| s.to_bytes().to_vec()),
            };
            channel.data(message).await?;
        }
        hypercore_protocol::Message::Data(msg) => {
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
                Some(bytes) => Some(hypercore::Signature::try_from(&bytes[..])?),
                None => None,
            };
            let nodes = msg
                .nodes
                .iter()
                .map(|n| hypercore::Node::new(n.index, n.hash.clone(), n.size))
                .collect();
            let proof = hypercore::Proof {
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
                    let msg = hypercore_protocol::schema::Request {
                        index: next,
                        bytes: None,
                        hash: None,
                        nodes: None,
                    };
                    channel
                        .send(hypercore_protocol::Message::Request(msg))
                        .await?;
                }
            };
        }
        _ => {}
    };
    Ok(())
}
