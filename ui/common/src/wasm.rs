mod wasm {
    use crate::connect::connect_active;
    use anyhow::Result;
    use extendedmind_engine::{get_discovery_key, get_public_key, Engine};
    use futures::channel::mpsc;
    use futures::stream::StreamExt;
    use log::*;
    use wasm_bindgen::prelude::*;
    use wasm_bindgen_futures::spawn_local;
    use ws_stream_wasm::WsMeta;

    // An no-copy struct to pass data from WASM to JS and back
    // wasm-bindgen issue #2456, comment-781984748
    // or domoritz/arrow-wasm => src/table.rs
    #[wasm_bindgen]
    pub struct WasmUint8Array(Vec<u8>);

    #[wasm_bindgen]
    impl WasmUint8Array {
        #[wasm_bindgen(constructor)]
        pub fn new(size: usize) -> Self {
            let buffer = vec![0; size];
            Self { 0: buffer }
        }

        #[wasm_bindgen(getter)]
        pub fn view(&mut self) -> js_sys::Uint8Array {
            unsafe { js_sys::Uint8Array::view_mut_raw(self.0.as_mut_ptr(), self.0.len()) }
        }
    }

    #[wasm_bindgen]
    extern "C" {
        #[wasm_bindgen(catch, js_name = "updateContent")]
        async fn update_content(number_from_wasm: u64) -> Result<(), JsValue>;
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
        debug!("...connection success, splitting stream...");
        let (reader, writer) = ws_stream.split();
        debug!("...split ready, creating engine...");
        let engine = Engine::new_memory(true, Some(public_key.as_str())).await;
        debug!("...engine created, connecting...");

        let (msg_sender, mut msg_receiver) = mpsc::unbounded();
        spawn_local(async move {
            connect_active(engine, msg_sender).await;
            debug!("...connected");
        });

        // TODO: Eventually this would be a loop
        // loop {
        let data = msg_receiver.next().await.unwrap();
        update_content(data[0].into()).await;
        // }

        Ok(())
    }
}
