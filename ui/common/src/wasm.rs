mod wasm {
    use crate::connect::connect_active;
    use anyhow::Result;
    use extendedmind_engine::{get_discovery_key, get_public_key, Engine};
    use futures::stream::StreamExt;
    use log::*;
    use wasm_bindgen::prelude::*;
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

        spawn_local(async move {
            let engine = Engine::new_memory(true, Some(public_key.as_str())).await;
            debug!("...engine created, connecting...");
            connect_active(engine).await;
            debug!("...connected");
        });

        Ok(())
    }
}
