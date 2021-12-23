mod wasm {

    use anyhow::{anyhow, Error, Result};
    use async_std::sync::{Arc, Mutex};
    use extendedmind_engine::{
        get_discovery_key, get_public_key, AutomergeBackend, Engine, Feed, FeedStore, FeedWrapper,
        RandomAccess, Storage, Store,
    };
    use futures::future::FutureExt;
    use futures::stream::StreamExt;
    use js_sys::Uint8Array;
    use log::*;
    use std::fmt::Debug;
    use wasm_bindgen::{prelude::*, JsCast};
    use wasm_bindgen_futures::spawn_local;
    use ws_stream_wasm::WsMeta;

    #[wasm_bindgen]
    pub fn double(i: i32) -> i32 {
        i * 2
    }

    #[wasm_bindgen]
    extern "C" {
        #[wasm_bindgen(catch)]
        fn triple(i: i32) -> Result<JsValue, JsValue>;
    }

    #[wasm_bindgen(js_name = "tripleFromJs")]
    pub fn triple_from_js(i: i32) -> i32 {
        unsafe { triple(i).unwrap().as_f64().unwrap().to_int_unchecked() }
    }

    /// Main constructor.
    #[derive(Debug)]
    pub struct RandomAccessProxy {
        id: String,
        length: u64,
    }

    impl RandomAccessProxy {
        pub fn new(id: String) -> Self {
            Self { id, length: 0 }
        }
    }

    #[async_trait::async_trait(?Send)]
    impl RandomAccess for RandomAccessProxy {
        type Error = Box<dyn std::error::Error + Sync + Send>;

        async fn write(&mut self, offset: u64, data: &[u8]) -> Result<(), Self::Error> {
            // TODO: Maybe use Alorel / rust-indexed-db to implement this directly?
            Ok(())
        }

        async fn read(&mut self, offset: u64, length: u64) -> Result<Vec<u8>, Self::Error> {
            if (offset + length) as u64 > self.length {
                return Err(anyhow!(
                    "Read bounds exceeded. {} < {}..{}",
                    self.length,
                    offset,
                    offset + length
                )
                .into());
            }
            Ok(vec![])
        }

        async fn read_to_writer(
            &mut self,
            _offset: u64,
            _length: u64,
            _buf: &mut (impl async_std::io::Write + Send),
        ) -> Result<(), Self::Error> {
            unimplemented!();
        }

        async fn del(&mut self, offset: u64, length: u64) -> Result<(), Self::Error> {
            Ok(())
        }

        async fn truncate(&mut self, length: u64) -> Result<(), Self::Error> {
            panic!("Not implemented yet");
        }

        async fn len(&self) -> Result<u64, Self::Error> {
            Ok(self.length)
        }

        async fn is_empty(&mut self) -> Result<bool, Self::Error> {
            Ok(self.length == 0)
        }

        async fn sync_all(&mut self) -> Result<(), Self::Error> {
            Ok(())
        }
    }

    pub struct WasmEngine<T>(Engine<T>)
    where
        T: RandomAccess<Error = Box<dyn std::error::Error + Send + Sync>> + Debug + Send;

    impl WasmEngine<RandomAccessProxy> {
        /// Create a new Engine backed by a `RandomAccessProxy` instance.
        pub async fn new_proxy(public_key: &str) -> Engine<RandomAccessProxy> {
            let create = |store: Store| {
                async move {
                    let name = match store {
                        Store::Tree => "tree",
                        Store::Data => "data",
                        Store::Bitfield => "bitfield",
                        Store::Signatures => "signatures",
                        Store::Keypair => "key",
                    };
                    Ok(RandomAccessProxy::new(name.to_string()))
                }
                .boxed()
            };
            let storage: Storage<RandomAccessProxy> = Storage::new(create, true).await.unwrap();
            let public_key = get_public_key(&public_key);
            let remote_feed = Feed::builder(public_key, storage).build().await.unwrap();
            let remote_feed_wrapper = FeedWrapper::from(remote_feed);
            let mut feedstore: FeedStore<RandomAccessProxy> = FeedStore::new();
            feedstore.add(remote_feed_wrapper);
            let engine = Engine {
                data: Arc::new(Mutex::new(None)),
                is_initiator: true,
                feedstore: Arc::new(feedstore),
            };

            engine
        }
    }

    #[wasm_bindgen(js_name = "connectToHub")]
    pub async fn connect_to_hub(address: String, public_key: String) -> Result<(), JsValue> {
        console_error_panic_hook::set_once();
        console_log::init_with_level(log::Level::Debug).unwrap();
        info!(
            "call: connect_to_hub, address: {}, public_key: {}",
            &address, &public_key
        );
        debug!("attempting to make websocket connection...");
        let (_ws_meta, ws_stream) = WsMeta::connect(
            format!(
                "ws://{}/extendedmind/hypercore/{}",
                address,
                get_discovery_key(get_public_key(public_key.as_str())),
            ),
            None,
        )
        .await
        .unwrap();
        debug!("...connection success");
        let (reader, writer) = ws_stream.split();
        let engine = WasmEngine::new_proxy(public_key.as_str()).await;
        // engine.connect_to_hub();
        Ok(())
    }
}
