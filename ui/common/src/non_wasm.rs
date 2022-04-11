use crate::connect::poll_engine_event;
use async_std::channel::{Receiver, Sender};
use async_std::net::TcpStream;
use async_std::task;
use extendedmind_engine::{capnp, Engine, EngineEvent, Result};
use log::*;
use std::path::PathBuf;

pub async fn connect_to_hub(
    data_root_dir: PathBuf,
    hub_url: &str,
    public_key: &str,
    ui_protocol_sender: Sender<
        capnp::message::TypedBuilder<extendedmind_engine::ui_protocol::Owned>,
    >,
) -> Result<()> {
    debug!("connect_to_hub called");
    let engine = Engine::new_disk(&data_root_dir, true, Some(public_key)).await;
    let hub_stream = TcpStream::connect(&hub_url).await?;
    let (engine_event_sender, engine_event_receiver): (Sender<EngineEvent>, Receiver<EngineEvent>) =
        async_std::channel::bounded(1000);
    let engine_event_receiver_for_ui = engine_event_receiver.clone();
    task::spawn(async move {
        engine
            .connect_active_tcp(hub_stream, engine_event_sender, engine_event_receiver)
            .await
            .unwrap();
    });

    poll_engine_event(engine_event_receiver_for_ui, ui_protocol_sender).await;

    Ok(())
}
