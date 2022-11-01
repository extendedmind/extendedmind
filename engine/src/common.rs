use async_std::sync::{Arc, Mutex};
use automerge::Automerge;
use hypercore::Hypercore;
use hypercore_protocol::hypercore;
use random_access_storage::RandomAccess;
use std::fmt::Debug;

#[derive(Clone, Debug)]
pub enum EngineEvent {
    DocumentLoaded(Automerge),
}

/// A PeerState stores the head seq of the remote.
#[derive(Debug)]
pub struct PeerState {
    pub can_upgrade: bool,
    pub remote_fork: u64,
    pub remote_length: u64,
    pub remote_can_upgrade: bool,
    pub remote_uploading: bool,
    pub remote_downloading: bool,
    pub remote_synced: bool,
    pub length_acked: u64,
}
impl Default for PeerState {
    fn default() -> Self {
        PeerState {
            can_upgrade: true,
            remote_fork: 0,
            remote_length: 0,
            remote_can_upgrade: false,
            remote_uploading: true,
            remote_downloading: true,
            remote_synced: false,
            length_acked: 0,
        }
    }
}

/// A Hypercore is a single unit of replication, an append-only log.
#[derive(Debug, Clone)]
pub struct HypercoreWrapper<T>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    pub discovery_key: [u8; 32],
    pub key: [u8; 32],
    pub hypercore: Arc<Mutex<Hypercore<T>>>,
}

impl<T> HypercoreWrapper<T>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send + 'static,
{
    pub fn from(hypercore: Hypercore<T>) -> Self {
        let key = hypercore.key_pair().public.to_bytes();
        HypercoreWrapper {
            key,
            discovery_key: hypercore_protocol::discovery_key(&key),
            hypercore: Arc::new(Mutex::new(hypercore)),
        }
    }

    pub fn key(&self) -> &[u8; 32] {
        &self.key
    }
}
