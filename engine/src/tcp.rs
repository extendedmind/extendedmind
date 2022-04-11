use crate::{Engine, EngineEvent};
use async_std::channel::{Receiver, Sender};
use async_std::net::TcpListener;
use async_std::prelude::*;
use async_std::task;
use log::*;
use random_access_disk::RandomAccessDisk;

pub async fn listen(address: String, engine: Engine<RandomAccessDisk>) -> std::io::Result<()> {
    // TODO: Use Socket2 to be able to use better confs
    // async-std/issues/718
    // async-std/issues/673

    let listener = TcpListener::bind(address).await?;
    info!("TCP server listening on {}", listener.local_addr()?);

    let mut incoming = listener.incoming();
    while let Some(Ok(stream)) = incoming.next().await {
        // Create the engine event channel
        let (engine_event_sender, engine_event_receiver): (
            Sender<EngineEvent>,
            Receiver<EngineEvent>,
        ) = async_std::channel::bounded(1000);

        // Get passable handle on engine
        let engine = engine.clone();

        // Launch a task for the protocol
        task::spawn(async move {
            engine
                .connect_passive_tcp(stream, engine_event_sender, engine_event_receiver)
                .await
                .ok();
        });
    }
    Ok(())
}
