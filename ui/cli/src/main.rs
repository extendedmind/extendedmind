use extendedmind_engine::{AsyncSender, Bytes, Engine};
use futures::prelude::*;

use async_std::sync::{channel, Receiver, Sender};
use async_std::task;
use async_tungstenite::{async_std::connect_async, tungstenite::Message};
use std::io;

use clap::Clap;

#[derive(Clap)]
#[clap(version = "0.1.0", author = "Timo Tiuraniemi <timo.tiuraniemi@iki.fi>")]
struct Opts {
    hub: String,
    public_key: String,
}

async fn run(url: String, public_key: String) -> Result<(), Box<dyn std::error::Error>> {
    let engine = Engine::new_disk(true, Some(public_key)).await;
    let (ws, _) = connect_async(format!("{}/demo", url)).await?;

    let (mut ws_writer, mut ws_reader) = ws.split();
    let (sender, mut receiver): (
        Sender<Result<Bytes, io::Error>>,
        Receiver<Result<Bytes, io::Error>>,
    ) = channel(1000);

    let hypercore_sender = AsyncSender::new(sender);
    let hypercore_receiver = receiver.clone();
    let state_hypercore_sender = hypercore_sender.clone();
    task::spawn(async move {
        engine
            .connect_active(state_hypercore_sender, hypercore_receiver)
            .await
            .unwrap();
    });

    task::spawn(async move {
        loop {
            let outgoing_msg = receiver.next().await;
            dbg!("GOT OUTGOING MESSAGE");
            let msg = outgoing_msg.unwrap().unwrap();
            dbg!("Outputting msg {:?}", &msg);
            ws_writer.send(Message::Binary(msg.to_vec())).await.unwrap();
        }
    });

    loop {
        let incoming_msg = ws_reader.next().await;
        dbg!("GOT INCOMING MESSAGE");
        let msg = incoming_msg.unwrap().unwrap();
        dbg!("INCOMING msg {:?}", msg.len());
        hypercore_sender.clone().send(Bytes::from(msg.into_data())).await;
    }
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let data = Engine::new().get_data();
    println!("{}", data);
    let opts: Opts = Opts::parse();
    task::block_on(run(opts.hub, opts.public_key))
}
