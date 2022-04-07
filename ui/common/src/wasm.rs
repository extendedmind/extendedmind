mod wasm {
    // use crate::connect::connect_active;
    use crate::connect::poll_engine_event;
    use anyhow::Result;
    use async_std::channel::{Receiver, Sender};
    use extendedmind_engine::{capnp, ui_protocol, Bytes, ChannelWriter, Engine, EngineEvent};
    use futures::SinkExt;
    use futures::StreamExt;
    use log::*;
    use wasm_bindgen::prelude::*;
    use wasm_bindgen_futures::spawn_local;
    use ws_stream_wasm::{WsMessage, WsMeta};

    #[wasm_bindgen]
    extern "C" {
        #[wasm_bindgen(catch, js_name = "jsUiProtocol")]
        async fn js_ui_protocol(data: &[u8]) -> Result<(), JsValue>;
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
        let (_ws_meta, mut ws_stream) =
            WsMeta::connect(format!("ws://{}/extendedmind/hypercore", address), None)
                .await
                .unwrap();
        debug!("...connection success, splitting stream...");
        let (mut ws_writer, mut ws_reader) = ws_stream.split();
        debug!("...split ready, creating engine...");
        let engine = Engine::new_memory(true, Some(public_key.as_str())).await;
        debug!("...engine created, connecting...");

        let (ui_protocol_sender, mut ui_protocol_receiver): (
            Sender<capnp::message::TypedBuilder<extendedmind_engine::ui_protocol::Owned>>,
            Receiver<capnp::message::TypedBuilder<extendedmind_engine::ui_protocol::Owned>>,
        ) = async_std::channel::bounded(1000);

        let (outgoing_sender, mut to_wire_receiver): (
            Sender<Result<Bytes, std::io::Error>>,
            Receiver<Result<Bytes, std::io::Error>>,
        ) = async_std::channel::bounded(1000);

        let (from_wire_sender, mut incoming_receiver): (
            Sender<Result<Bytes, std::io::Error>>,
            Receiver<Result<Bytes, std::io::Error>>,
        ) = async_std::channel::bounded(1000);

        spawn_local(async move {
            debug!("Start loop on outgoing WS messages");
            loop {
                let outgoing_msg = to_wire_receiver.next().await;
                let msg = outgoing_msg.unwrap().unwrap();
                debug!("Outgoing WS message {:?}", &msg);
                ws_writer.send(WsMessage::Binary(msg.to_vec())).await;
            }
        });

        spawn_local(async move {
            debug!("Start loop on incoming WS messages");
            loop {
                let incoming_msg = ws_reader.next().await;
                let msg = incoming_msg.unwrap();
                debug!("Incoming WS message {:?}", &msg);
                match msg {
                    WsMessage::Binary(msg_bytes) => {
                        from_wire_sender.send(Ok(Bytes::from(msg_bytes))).await;
                    }
                    WsMessage::Text(msg_text) => {}
                };
            }
        });

        let outgoing_sender = ChannelWriter::new(outgoing_sender);
        let (engine_event_sender, engine_event_receiver): (
            Sender<EngineEvent>,
            Receiver<EngineEvent>,
        ) = async_std::channel::bounded(1000);
        let engine_event_receiver_for_ui = engine_event_receiver.clone();
        spawn_local(async move {
            debug!("Connecting engine streams");
            engine
                .connect_active(
                    outgoing_sender,
                    incoming_receiver,
                    engine_event_sender.clone(),
                    engine_event_receiver.clone(),
                )
                .await;
            debug!("...connect active ended");
        });

        spawn_local(async move {
            poll_engine_event(engine_event_receiver_for_ui, ui_protocol_sender).await;
        });

        // TODO: Eventually this would be a loop
        // loop {
        let message = ui_protocol_receiver.next().await.unwrap();
        let mut packed_message = Vec::<u8>::new();
        capnp::serialize_packed::write_message(&mut packed_message, message.borrow_inner())
            .unwrap();
        js_ui_protocol(packed_message.as_slice()).await;
        // }

        Ok(())
    }
}
