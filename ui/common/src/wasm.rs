mod wasm {
    use crate::connect::{connect_active, test, Message};
    use anyhow::Result;
    use extendedmind_engine::{get_discovery_key, get_public_key, Engine};
    use futures::channel::mpsc;
    use futures::stream::StreamExt;
    use log::*;
    use wasm_bindgen::prelude::*;
    use wasm_bindgen_futures::spawn_local;
    use ws_stream_wasm::WsMeta;

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
        let event = msg_receiver.next().await.unwrap();
        match event {
            Message::ContentUpdated(number_from_wasm) => {
                update_content(number_from_wasm).await;
            }
        }
        // }

        Ok(())
    }
}
