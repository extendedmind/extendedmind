use async_std::sync::{Arc, Mutex};
use random_access_storage::RandomAccess;
use std::fmt::Debug;

/// A PeerState stores the head seq of the remote.
/// This would have a bitfield to support sparse sync in the actual impl.
#[derive(Debug)]
pub struct PeerState {
    pub remote_head: Option<u64>,
}
impl Default for PeerState {
    fn default() -> Self {
        PeerState { remote_head: None }
    }
}

/// A Feed is a single unit of replication, an append-only log.
#[derive(Debug, Clone)]
pub struct FeedWrapper<T>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    pub discovery_key: [u8; 32],
    pub key: [u8; 32],
    pub feed: Arc<Mutex<hypercore::Feed<T>>>,
}

impl<T> FeedWrapper<T>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send + 'static,
{
    pub fn from(feed: hypercore::Feed<T>) -> Self {
        let key = feed.public_key().to_bytes();
        FeedWrapper {
            key,
            discovery_key: hypercore_protocol::discovery_key(&key),
            feed: Arc::new(Mutex::new(feed)),
        }
    }

    pub fn key(&self) -> &[u8; 32] {
        &self.key
    }
}
