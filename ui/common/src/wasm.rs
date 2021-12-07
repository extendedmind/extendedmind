mod wasm {

    use anyhow::{anyhow, Error, Result};
    use async_std::sync::{Arc, Mutex};
    use extendedmind_engine::{AutomergeBackend, Engine, FeedStore, RandomAccess, Store};
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

        /// Write bytes at an offset to the backend.
        #[wasm_bindgen(catch)]
        pub async fn storage_write(id: &str, offset: u64, data: &[u8]) -> Result<(), JsValue>;

        /// Read a sequence of bytes at an offset from the backend.
        #[wasm_bindgen(catch)]
        async fn storage_read(id: &str, offset: u64, length: u64) -> Result<JsValue, JsValue>;

        /// Delete a sequence of bytes at an offset from the backend.
        #[wasm_bindgen(catch)]
        async fn storage_del(id: &str, offset: u64, length: u64) -> Result<(), JsValue>;

        /// Resize the sequence of bytes, possibly discarding or zero-padding bytes
        /// from the end.
        #[wasm_bindgen(catch)]
        async fn storage_truncate(id: &str, length: u64) -> Result<(), JsValue>;

        /// Get the size of the storage in bytes.
        #[wasm_bindgen(catch)]
        async fn storage_len(id: &str) -> Result<JsValue, JsValue>;

        /// Whether the storage is empty.
        /// For some storage backends it may be cheaper to calculate whether the
        /// storage is empty than to calculate the length.
        #[wasm_bindgen(catch)]
        async fn storage_is_empty(id: &str) -> Result<JsValue, JsValue>;

        /// Flush buffered data on the underlying storage resource.
        #[wasm_bindgen(catch)]
        async fn storage_sync_all(id: &str) -> Result<(), JsValue>;
    }

    #[wasm_bindgen]
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
            let data = data.to_vec();
            info!("writing to offset {}, id {}", &offset, &self.id);
            match storage_write(&self.id, offset, &data).await {
                Ok(_) => {
                    // We've changed the length of our file.
                    let new_len = offset + (data.len() as u64);
                    if new_len > self.length {
                        self.length = new_len;
                    }
                    Ok(())
                }
                Err(err) => Err(err.as_string().unwrap().into()),
            }
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
            match storage_read(&self.id, offset, length).await {
                Ok(value) => {
                    let value: Uint8Array = value.unchecked_into();
                    Ok(value.to_vec())
                }
                Err(err) => Err(err.as_string().unwrap().into()),
            }
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
            match storage_del(&self.id, offset, length).await {
                Ok(()) => Ok(()),
                Err(err) => Err(err.as_string().unwrap().into()),
            }
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
        pub async fn new_proxy() -> Engine<RandomAccessProxy> {
            let create = |store: Store| {
                async move {
                    let name = match store {
                        Store::Tree => "tree",
                        Store::Data => "data",
                        Store::Bitfield => "bitfield",
                        Store::Signatures => "signatures",
                        Store::Keypair => "key",
                    };
                    RandomAccessProxy::new(name.to_string())
                }
                .boxed()
            };
            let feedstore: FeedStore<RandomAccessProxy> = FeedStore::new();
            let engine = Engine {
                data: Arc::new(Mutex::new(None)),
                is_initiator: true,
                feedstore: Arc::new(feedstore),
            };

            engine
        }
    }

    #[wasm_bindgen]
    pub async fn connect_to_hub(address: String, public_key: String) -> Result<(), JsValue> {
        let (_ws_meta, ws_stream) = WsMeta::connect(address, None).await.unwrap();
        let (reader, writer) = ws_stream.split();
        let engine = WasmEngine::new_proxy();
        Ok(())
    }
}
