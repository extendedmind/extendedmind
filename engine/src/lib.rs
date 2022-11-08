mod channel_writer;

use async_std::channel::{Receiver, Sender};
use async_std::sync::{Arc, Mutex};
use automerge::{
    transaction::{CommitOptions, Transactable},
    Automerge, AutomergeError, ROOT,
};
use futures::io::{AsyncRead, AsyncWrite};
use futures::stream::{IntoAsyncRead, StreamExt, TryStreamExt};
use hypercore_protocol::hypercore::{self, PartialKeypair};
use log::*;
use random_access_memory::RandomAccessMemory;
use std::fmt::Debug;
#[cfg(not(target_arch = "wasm32"))]
use std::io::Write;
use std::io::{self, Read, Seek, SeekFrom};
use std::path::PathBuf;

pub use anyhow::Result;
#[cfg(not(target_arch = "wasm32"))]
use async_std::net::TcpStream;
pub use automerge;
pub use bytes::Bytes;
pub use channel_writer::ChannelWriter;
pub use extendedmind_schema_rust::capnp;
pub use extendedmind_schema_rust::model_capnp::model;
pub use extendedmind_schema_rust::ui_protocol_capnp::ui_protocol;
pub use extendedmind_schema_rust::wire_protocol_capnp::wire_protocol;
pub use hypercore_protocol;
#[cfg(not(target_arch = "wasm32"))]
pub use random_access_disk::RandomAccessDisk;
pub use random_access_storage::RandomAccess;

mod communication;
use communication::HypercoreStore;
mod common;
pub use common::EngineEvent;
use common::HypercoreWrapper;
#[cfg(not(target_arch = "wasm32"))]
pub mod tcp;

#[derive(derivative::Derivative)]
#[derivative(Clone(bound = ""))]
pub struct Engine<T>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    pub data: Arc<Mutex<Option<Automerge>>>,
    pub is_initiator: bool,
    pub hypercore_store: Arc<HypercoreStore<T>>,
}

fn get_initial_doc() -> Automerge {
    let mut doc = Automerge::new();
    doc.transact_with::<_, _, AutomergeError, _>(
        |_| CommitOptions::default().with_message("init".to_owned()),
        |tx| {
            tx.put(ROOT, "version", 2).unwrap();
            Ok(())
        },
    )
    .unwrap();
    doc
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
        let mut hypercore_store: HypercoreStore<RandomAccessDisk> = HypercoreStore::new();

        // Create a hypercore
        let mut doc = get_initial_doc();
        let hypercore_dir = data_root_dir.join(PathBuf::from(format!("{}.db", is_initiator)));
        let primary_hypercore = if let Some(public_key) = public_key {
            let storage = hypercore::Storage::new_disk(&hypercore_dir, false)
                .await
                .unwrap();
            debug!("Disk: Using given public key {}", &public_key);
            let public_key = get_public_key(&public_key);
            hypercore::Hypercore::new_with_key_pair(
                storage,
                PartialKeypair {
                    public: public_key,
                    secret: None,
                },
            )
            .await
            .unwrap()
        } else {
            let storage = hypercore::Storage::new_disk(&hypercore_dir, false)
                .await
                .unwrap();
            let mut primary_hypercore = hypercore::Hypercore::new(storage).await.unwrap();
            let public_key = hex::encode(primary_hypercore.key_pair().public);
            let mut hub_key_file = std::fs::OpenOptions::new()
                .create(true)
                .read(true)
                .write(true)
                .open(data_root_dir.join("KEY.txt"))
                .unwrap();
            let mut existing_hub_key = String::new();
            let bytes_read = hub_key_file.read_to_string(&mut existing_hub_key).unwrap();
            if bytes_read > 0 && existing_hub_key.eq(&public_key) {
                debug!("Already created hypercore opened");
            } else {
                debug!("New hypercore created, setting initial data");
                hub_key_file.set_len(0).unwrap();
                hub_key_file.seek(SeekFrom::Start(0)).unwrap();
                hub_key_file.write_all(&public_key.as_bytes()).unwrap();
                hub_key_file.flush().unwrap();
                let data = doc.save();
                primary_hypercore.append(data.as_slice()).await.unwrap();
            }

            debug!(
                "Disk: Reading public key, init: {} value: {}",
                is_initiator, public_key
            );
            primary_hypercore
        };

        // Wrap it and add to the hypercore store.
        let primary_hypercore_wrapper = HypercoreWrapper::from(primary_hypercore);
        hypercore_store.add(primary_hypercore_wrapper);

        Engine {
            data: Arc::new(Mutex::new(Some(doc))),
            is_initiator,
            hypercore_store: Arc::new(hypercore_store),
        }
    }
}

impl Engine<RandomAccessMemory> {
    pub async fn new_memory(
        is_initiator: bool,
        public_key: Option<&str>,
    ) -> Engine<RandomAccessMemory> {
        let mut hypercore_store: HypercoreStore<RandomAccessMemory> = HypercoreStore::new();

        let storage = hypercore::Storage::new_memory().await.unwrap();
        let primary_hypercore = if let Some(public_key) = public_key {
            debug!("Memory: Using given public key {}", &public_key);
            let public_key = get_public_key(&public_key);
            hypercore::Hypercore::new_with_key_pair(
                storage,
                PartialKeypair {
                    public: public_key,
                    secret: None,
                },
            )
            .await
            .unwrap()
        } else {
            let primary_hypercore = hypercore::Hypercore::new(storage).await.unwrap();
            let public_key = hex::encode(primary_hypercore.key_pair().public);
            debug!(
                "Memory: Reading public key, init: {} value: {}",
                is_initiator, public_key
            );
            primary_hypercore
        };
        let primary_hypercore_wrapper = HypercoreWrapper::from(primary_hypercore);
        hypercore_store.add(primary_hypercore_wrapper);

        Engine {
            data: Arc::new(Mutex::new(None)),
            is_initiator,
            hypercore_store: Arc::new(hypercore_store),
        }
    }
}

impl<T: 'static> Engine<T>
where
    T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send,
{
    pub async fn set_data(&self, doc: Automerge) {
        let mut state = self.data.lock().await;
        *state = Some(doc);
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
            let wire_payload = wire_protocol.init_payload();
            let personal_access_key = wire_payload.init_share_personal_access_key(2);
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
        let message = reader_root.get_payload().which();
        match message {
            Ok(wire_protocol::payload::SharePersonalAccessKey(key)) => key.unwrap().to_vec(),
            Ok(wire_protocol::payload::ShareCollectiveAccessKeys(_)) => vec![],
            Err(_) => vec![],
        }
    }

    pub fn get_discovery_keys(&self) -> Vec<String> {
        self.hypercore_store.hypercores.keys().cloned().collect()
    }

    pub async fn connect_passive(
        self,
        sender: ChannelWriter,
        receiver: Receiver<Result<Bytes, io::Error>>,
        engine_event_sender: Sender<EngineEvent>,
        engine_event_receiver: Receiver<EngineEvent>,
    ) -> Result<()> {
        let receiver: IntoAsyncRead<Receiver<Result<Bytes, io::Error>>> =
            receiver.into_async_read();
        let protocol = hypercore_protocol::ProtocolBuilder::new(false).connect_rw(receiver, sender);
        self.poll_protocol(protocol, engine_event_sender, engine_event_receiver, false)
            .await
    }

    #[cfg(not(target_arch = "wasm32"))]
    pub async fn connect_passive_tcp(
        self,
        tcp_stream: TcpStream,
        engine_event_sender: Sender<EngineEvent>,
        engine_event_receiver: Receiver<EngineEvent>,
    ) -> Result<()> {
        let protocol = hypercore_protocol::ProtocolBuilder::new(false).connect(tcp_stream);
        self.poll_protocol(protocol, engine_event_sender, engine_event_receiver, false)
            .await
    }

    pub async fn connect_active(
        self,
        sender: ChannelWriter,
        receiver: Receiver<Result<Bytes, io::Error>>,
        engine_event_sender: Sender<EngineEvent>,
        engine_event_receiver: Receiver<EngineEvent>,
    ) -> Result<()> {
        let receiver: IntoAsyncRead<Receiver<Result<Bytes, io::Error>>> =
            receiver.into_async_read();
        let protocol = hypercore_protocol::ProtocolBuilder::new(true).connect_rw(receiver, sender);
        self.poll_protocol(protocol, engine_event_sender, engine_event_receiver, true)
            .await
    }

    #[cfg(not(target_arch = "wasm32"))]
    pub async fn connect_active_tcp(
        self,
        tcp_stream: TcpStream,
        engine_event_sender: Sender<EngineEvent>,
        engine_event_receiver: Receiver<EngineEvent>,
    ) -> Result<()> {
        let protocol = hypercore_protocol::ProtocolBuilder::new(true).connect(tcp_stream);
        self.poll_protocol(protocol, engine_event_sender, engine_event_receiver, true)
            .await
    }

    async fn poll_protocol<IO>(
        self,
        mut protocol: hypercore_protocol::Protocol<IO>,
        engine_event_sender: Sender<EngineEvent>,
        _engine_event_receiver: Receiver<EngineEvent>, // TODO: Use receiver to initiate engine actions
        active: bool,
    ) -> Result<()>
    where
        IO: AsyncWrite + AsyncRead + Send + Unpin + 'static,
    {
        let hypercore_store = self.hypercore_store.clone();
        debug!(
            "is_initiator={}, waiting for protocol event",
            self.is_initiator
        );
        while let Some(event) = protocol.next().await {
            let event = event?;
            debug!(
                "is_initiator={}, protocol event {:?}",
                self.is_initiator, event
            );
            match event {
                hypercore_protocol::Event::Handshake(_) => {
                    if self.is_initiator {
                        for hypercore in hypercore_store.hypercores.values() {
                            let hypercore_key = hypercore.key().clone();
                            debug!("Opening hypercore with key length {}", &hypercore_key.len());
                            protocol.open(hypercore_key).await?;
                        }
                    }
                }
                hypercore_protocol::Event::DiscoveryKey(dkey) => {
                    if let Some(hypercore) = hypercore_store.get(&dkey) {
                        let hypercore_key = hypercore.key().clone();
                        protocol.open(hypercore_key).await?;
                    }
                }
                hypercore_protocol::Event::Channel(channel) => {
                    if let Some(hypercore) = hypercore_store.get(&channel.discovery_key()) {
                        communication::on_peer(
                            hypercore,
                            channel,
                            engine_event_sender.clone(),
                            active,
                        );
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
