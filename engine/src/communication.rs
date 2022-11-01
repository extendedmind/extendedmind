use crate::common::{EngineEvent, FeedWrapper, PeerState};
use anyhow::Result;
use async_std::channel::Sender;
use async_std::sync::{Arc, Mutex};
use automerge::Automerge;
use futures::stream::StreamExt;
use log::*;
use random_access_storage::RandomAccess;
use std::collections::HashMap;
use std::convert::TryFrom;
use std::fmt::Debug;

#[cfg(target_arch = "wasm32")]
use wasm_bindgen_futures::spawn_local;

#[cfg(not(target_arch = "wasm32"))]
use async_std::task;

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
    mut engine_event_sender: Sender<EngineEvent>,
    active: bool,
) where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    let mut state = PeerState::default();
    let mut feed = feed_wrapper.feed.clone();
    let msg = hypercore_protocol::schema::Want {
        start: 0,
        length: None,
    };
    #[cfg(not(target_arch = "wasm32"))]
    task::spawn(async move {
        if active {
            debug!("Sending Want from non-WASM");
            channel
                .send(hypercore_protocol::Message::Want(msg))
                .await
                .unwrap();
        }

        while let Some(message) = channel.next().await {
            let result = on_message(
                &mut feed,
                &mut state,
                &mut channel,
                message,
                &mut engine_event_sender,
            )
            .await;
            if let Err(e) = result {
                error!("protocol error: {}", e);
                break;
            }
        }
    });

    #[cfg(target_arch = "wasm32")]
    spawn_local(async move {
        if active {
            debug!("Sending Want from WASM");
            channel
                .send(hypercore_protocol::Message::Want(msg))
                .await
                .unwrap();
        }
        while let Some(message) = channel.next().await {
            let result = on_message(
                &mut feed,
                &mut state,
                &mut channel,
                message,
                &mut engine_event_sender,
            )
            .await;
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
    engine_event_sender: &mut Sender<EngineEvent>,
) -> Result<()>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    match message {
        hypercore_protocol::Message::Open(_) => {
            debug!("Message::Open");
            let msg = hypercore_protocol::schema::Want {
                start: 0,
                length: None,
            };
            channel.send(hypercore_protocol::Message::Want(msg)).await?;
        }
        hypercore_protocol::Message::Want(msg) => {
            debug!("Message::Want");
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
            debug!("Message::Have");
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
            debug!("Message::Request");
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
            debug!("Message::Data");
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

            // TODO: This only works if the backend is the message, read all of the feed first
            // and then find out how to construct the backend!
            let doc = Automerge::load(&value.unwrap().to_vec()).unwrap();
            engine_event_sender
                .send(EngineEvent::DocumentLoaded(doc))
                .await
                .unwrap();
        }
        _ => {}
    };
    Ok(())
}
