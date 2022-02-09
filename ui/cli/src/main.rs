use async_std::channel::{bounded, Receiver, Sender};
use async_std::task;
use async_tungstenite::{async_std::connect_async, tungstenite::Message};
use clap::Parser;
use extendedmind_engine::{
    get_discovery_key, get_public_key, Bytes, ChannelWriter, Engine, EngineEvent,
};
use futures::prelude::*;
use log::*;
use std::io;
use std::path::PathBuf;

#[derive(Parser)]
#[clap(version = "0.1.0", author = "Timo Tiuraniemi <timo.tiuraniemi@iki.fi>")]
struct Opts {
    hub: String,
    public_key: String,
}

async fn run(url: &str, public_key: &str) -> Result<(), Box<dyn std::error::Error>> {
    let engine = Engine::new_disk(&PathBuf::from("/tmp"), true, Some(public_key)).await;
    let (ws, _) = connect_async(format!(
        "{}/{}",
        url,
        get_discovery_key(get_public_key(&public_key))
    ))
    .await?;

    let (mut ws_writer, mut ws_reader) = ws.split();
    let (sender, mut receiver): (
        Sender<Result<Bytes, io::Error>>,
        Receiver<Result<Bytes, io::Error>>,
    ) = bounded(1000);
    let (engine_event_sender, engine_event_receiver): (Sender<EngineEvent>, Receiver<EngineEvent>) =
        async_std::channel::bounded(1000);

    let hypercore_receiver = receiver.clone();
    let state_hypercore_sender = ChannelWriter::new(sender.clone());
    task::spawn(async move {
        engine
            .connect_active(
                state_hypercore_sender,
                hypercore_receiver,
                engine_event_sender,
                engine_event_receiver,
            )
            .await
            .unwrap();
    });

    task::spawn(async move {
        loop {
            let outgoing_msg = receiver.next().await;
            debug!("GOT OUTGOING MESSAGE");
            let msg = outgoing_msg.unwrap().unwrap();
            debug!("Outputting msg {:?}", &msg);
            ws_writer.send(Message::Binary(msg.to_vec())).await.unwrap();
        }
    });

    loop {
        let incoming_msg = ws_reader.next().await;
        debug!("GOT INCOMING MESSAGE");
        let msg = incoming_msg.unwrap().unwrap();
        debug!("INCOMING msg {:?}", msg.len());
        let hypercore_sender = ChannelWriter::new(sender.clone());
        hypercore_sender
            .send(Bytes::from(msg.into_data()))
            .await
            .unwrap();
    }
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let opts: Opts = Opts::parse();
    task::block_on(run(opts.hub.as_str(), opts.public_key.as_str()))
}
