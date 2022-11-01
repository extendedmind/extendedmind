use crate::common::{EngineEvent, HypercoreWrapper, PeerState};
use anyhow::Result;
use async_std::channel::Sender;
use async_std::sync::{Arc, Mutex};
use automerge::Automerge;
use futures::stream::StreamExt;
use hypercore_protocol::hypercore::{self, RequestBlock, RequestUpgrade};
use hypercore_protocol::schema::{Data, Request, Synchronize};
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
pub struct HypercoreStore<T>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    pub hypercores: HashMap<String, Arc<HypercoreWrapper<T>>>,
}
impl<T> HypercoreStore<T>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    pub fn new() -> Self {
        let hypercores = HashMap::new();
        Self { hypercores }
    }

    pub fn add(&mut self, hypercore: HypercoreWrapper<T>) {
        let hdkey = hex::encode(&hypercore.discovery_key);
        self.hypercores.insert(hdkey, Arc::new(hypercore));
    }

    pub fn get(&self, discovery_key: &[u8; 32]) -> Option<&Arc<HypercoreWrapper<T>>> {
        let hdkey = hex::encode(discovery_key);
        self.hypercores.get(&hdkey)
    }
}

pub fn on_peer<T: 'static>(
    hypercore_wrapper: &Arc<HypercoreWrapper<T>>,
    mut channel: hypercore_protocol::Channel,
    mut engine_event_sender: Sender<EngineEvent>,
    active: bool,
) where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    let mut peer_state = PeerState::default();
    let mut hypercore = hypercore_wrapper.hypercore.clone();
    #[cfg(not(target_arch = "wasm32"))]
    task::spawn(async move {
        let info = {
            let hypercore = hypercore.lock().await;
            hypercore.info()
        };

        let remote_length = if info.fork == peer_state.remote_fork {
            peer_state.remote_length
        } else {
            0
        };
        let sync_msg = Synchronize {
            fork: info.fork,
            length: info.length,
            remote_length,
            can_upgrade: peer_state.can_upgrade,
            uploading: true,
            downloading: true,
        };

        debug!("Sending Synchronize from non-WASM");
        channel
            .send(hypercore_protocol::Message::Synchronize(sync_msg))
            .await
            .unwrap();

        while let Some(message) = channel.next().await {
            let result = on_message(
                &mut hypercore,
                &mut peer_state,
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
        let info = {
            let hypercore = hypercore.lock().await;
            hypercore.info()
        };

        debug!("Sending Synchronize from non-WASM");
        let remote_length = if info.fork == peer_state.remote_fork {
            peer_state.remote_length
        } else {
            0
        };
        let sync_msg = Synchronize {
            fork: info.fork,
            length: info.length,
            remote_length,
            can_upgrade: peer_state.can_upgrade,
            uploading: true,
            downloading: true,
        };
        debug!("Sending Synchronize from WASM");
        channel
            .send(hypercore_protocol::Message::Synchronize(sync_msg))
            .await
            .unwrap();
        while let Some(message) = channel.next().await {
            let result = on_message(
                &mut hypercore,
                &mut peer_state,
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
    hypercore: &mut Arc<Mutex<hypercore::Hypercore<T>>>,
    peer_state: &mut PeerState,
    channel: &mut hypercore_protocol::Channel,
    message: hypercore_protocol::Message,
    engine_event_sender: &mut Sender<EngineEvent>,
) -> Result<()>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    match message {
        hypercore_protocol::Message::Synchronize(message) => {
            debug!("Message::Synchronize");
            let length_changed = message.length != peer_state.remote_length;
            let first_sync = !peer_state.remote_synced;
            let info = {
                let hypercore = hypercore.lock().await;
                hypercore.info()
            };
            let same_fork = message.fork == info.fork;

            peer_state.remote_fork = message.fork;
            peer_state.remote_length = message.length;
            peer_state.remote_can_upgrade = message.can_upgrade;
            peer_state.remote_uploading = message.uploading;
            peer_state.remote_downloading = message.downloading;
            peer_state.remote_synced = true;

            peer_state.length_acked = if same_fork { message.remote_length } else { 0 };

            let mut messages = vec![];

            if first_sync {
                // Need to send another sync back that acknowledges the received sync
                let msg = Synchronize {
                    fork: info.fork,
                    length: info.length,
                    remote_length: peer_state.remote_length,
                    can_upgrade: peer_state.can_upgrade,
                    uploading: true,
                    downloading: true,
                };
                messages.push(hypercore_protocol::Message::Synchronize(msg));
            }

            if peer_state.remote_length > info.length
                && peer_state.length_acked == info.length
                && length_changed
            {
                let msg = Request {
                    id: 1, // There should be proper handling for in-flight request ids
                    fork: info.fork,
                    hash: None,
                    block: None,
                    seek: None,
                    upgrade: Some(RequestUpgrade {
                        start: info.length,
                        length: peer_state.remote_length - info.length,
                    }),
                };
                messages.push(hypercore_protocol::Message::Request(msg));
            }

            channel.send_batch(&messages).await?;
        }
        hypercore_protocol::Message::Request(message) => {
            debug!("Message::Request");
            let (info, proof) = {
                let mut hypercore = hypercore.lock().await;
                let proof = hypercore
                    .create_proof(message.block, message.hash, message.seek, message.upgrade)
                    .await?;
                (hypercore.info(), proof)
            };
            if let Some(proof) = proof {
                let msg = Data {
                    request: message.id,
                    fork: info.fork,
                    hash: proof.hash,
                    block: proof.block,
                    seek: proof.seek,
                    upgrade: proof.upgrade,
                };
                channel.send(hypercore_protocol::Message::Data(msg)).await?;
            }
        }
        hypercore_protocol::Message::Data(message) => {
            debug!("Message::Data");
            let (old_info, applied, new_info, synced) = {
                let mut hypercore = hypercore.lock().await;
                let old_info = hypercore.info();
                let proof = message.clone().into_proof();
                let applied = hypercore.verify_and_apply_proof(&proof).await?;
                let new_info = hypercore.info();
                let synced = new_info.contiguous_length == new_info.length;
                (old_info, applied, new_info, synced)
            };
            if let Some(upgrade) = &message.upgrade {
                let new_length = upgrade.length;
                let mut messages: Vec<hypercore_protocol::Message> = vec![];

                let remote_length = if new_info.fork == peer_state.remote_fork {
                    peer_state.remote_length
                } else {
                    0
                };

                messages.push(hypercore_protocol::Message::Synchronize(Synchronize {
                    fork: new_info.fork,
                    length: new_length,
                    remote_length,
                    can_upgrade: false,
                    uploading: true,
                    downloading: true,
                }));

                for i in old_info.length..new_length {
                    messages.push(hypercore_protocol::Message::Request(Request {
                        id: i + 1,
                        fork: new_info.fork,
                        hash: None,
                        block: Some(RequestBlock {
                            index: i,
                            nodes: 0, // TODO: here should be missingNodes() thingy
                        }),
                        seek: None,
                        upgrade: None,
                    }));
                }
                channel.send_batch(&messages).await.unwrap();
            }
            if synced {
                let mut hypercore = hypercore.lock().await;
                let value = hypercore.get(0).await?;
                let doc = Automerge::load(&value.unwrap().to_vec()).unwrap();
                engine_event_sender
                    .send(EngineEvent::DocumentLoaded(doc))
                    .await
                    .unwrap();
            }
        }
        _ => {}
    };
    Ok(())
}
