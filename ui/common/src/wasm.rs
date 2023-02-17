mod wasm {
    // use crate::connect::connect_active;
    use crate::connect::poll_state_event;
    use extendedmind_core::{
        capnp, Bytes, ChannelWriter, NameDescription, Peermerge, ProtocolBuilder, Result,
        StateEvent,
    };
    use futures::channel::mpsc::{unbounded, UnboundedReceiver, UnboundedSender};
    use futures::stream::IntoAsyncRead;
    use futures::SinkExt;
    use futures::{StreamExt, TryStreamExt};
    use log::*;
    use wasm_bindgen::prelude::*;
    use wasm_bindgen_futures::spawn_local;
    use ws_stream_wasm::{WsMessage, WsMeta};

    #[wasm_bindgen]
    extern "C" {
        #[wasm_bindgen(catch, js_name = "jsUiProtocol")]
        async fn js_ui_protocol(data: &[u8]) -> Result<(), JsValue>;
    }

    #[wasm_bindgen(js_name = "connectToServer")]
    pub async fn connect_to_server(
        address: String,
        doc_url: String,
        encryption_key: String,
    ) -> Result<(), JsValue> {
        console_error_panic_hook::set_once();
        console_log::init_with_level(log::Level::Debug).unwrap();
        info!(
            "call: connect_to_server, address: {}, doc_url: {}",
            &address, &doc_url
        );

        debug!("attempting to make websocket connection...");
        let (_ws_meta, ws_stream) =
            WsMeta::connect(format!("ws://{}/extendedmind/peermerge", address), None)
                .await
                .unwrap();
        debug!("...connection success, splitting stream...");
        let (mut ws_writer, mut ws_reader) = ws_stream.split();
        debug!("...split ready, creating engine...");
        let mut peermerge = Peermerge::new_memory(NameDescription::new("web")).await;
        let main_document_id = peermerge
            .attach_writer_document_memory(&doc_url, &Some(encryption_key))
            .await;

        // let engine = Engine::new_memory(true, Some(public_key.as_str())).await;
        debug!("...engine created, connecting...");

        let (ui_protocol_sender, mut ui_protocol_receiver): (
            UnboundedSender<capnp::message::TypedBuilder<extendedmind_core::ui_protocol::Owned>>,
            UnboundedReceiver<capnp::message::TypedBuilder<extendedmind_core::ui_protocol::Owned>>,
        ) = unbounded();

        let (outgoing_sender, mut to_wire_receiver): (
            UnboundedSender<Result<Bytes, std::io::Error>>,
            UnboundedReceiver<Result<Bytes, std::io::Error>>,
        ) = unbounded();

        let (from_wire_sender, incoming_receiver): (
            UnboundedSender<Result<Bytes, std::io::Error>>,
            UnboundedReceiver<Result<Bytes, std::io::Error>>,
        ) = unbounded();

        spawn_local(async move {
            debug!("Start loop on outgoing WS messages");
            while let Some(Ok(msg)) = to_wire_receiver.next().await {
                debug!("Outgoing WS message {:?}", &msg);
                ws_writer
                    .send(WsMessage::Binary(msg.to_vec()))
                    .await
                    .unwrap();
            }
        });

        spawn_local(async move {
            debug!("Start loop on incoming WS messages");
            while let Some(msg) = ws_reader.next().await {
                debug!("Incoming WS message {:?}", &msg);
                match msg {
                    WsMessage::Binary(msg_bytes) => {
                        from_wire_sender
                            .unbounded_send(Ok(Bytes::from(msg_bytes)))
                            .unwrap();
                    }
                    WsMessage::Text(_msg_text) => {}
                };
            }
        });

        let (mut state_event_sender, state_event_receiver): (
            UnboundedSender<StateEvent>,
            UnboundedReceiver<StateEvent>,
        ) = unbounded();
        let mut peermerge_for_task = peermerge.clone();
        spawn_local(async move {
            debug!("Connecting memory protocol");
            let receiver: IntoAsyncRead<UnboundedReceiver<Result<Bytes, std::io::Error>>> =
                incoming_receiver.into_async_read();
            let sender = ChannelWriter::new(outgoing_sender);
            let mut protocol = ProtocolBuilder::new(false).connect_rw(receiver, sender);
            peermerge_for_task
                .connect_protocol_memory(&mut protocol, &mut state_event_sender)
                .await
                .expect("Should not error when exiting");

            debug!("...connect protocol memory ended");
        });

        spawn_local(async move {
            poll_state_event(
                peermerge,
                &main_document_id,
                state_event_receiver,
                ui_protocol_sender,
                false,
            )
            .await;
        });

        // TODO: Eventually this would be a loop
        // loop {
        let message = ui_protocol_receiver.next().await.unwrap();
        let mut packed_message = Vec::<u8>::new();
        capnp::serialize_packed::write_message(&mut packed_message, message.borrow_inner())
            .unwrap();
        js_ui_protocol(packed_message.as_slice()).await.unwrap();
        // }

        Ok(())
    }
}
