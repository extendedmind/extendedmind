use extendedmind_engine::Engine;
use futures::prelude::*;

use async_std::task;
use async_tungstenite::{async_std::connect_async, tungstenite::Message};
use std::time::Duration;

use clap::Clap;

#[derive(Clap)]
#[clap(version = "0.1.0", author = "Timo Tiuraniemi <timo.tiuraniemi@iki.fi>")]
struct Opts {
    hub: String,
}

async fn run(url: String) -> Result<(), Box<dyn std::error::Error>> {
    let (mut ws_stream, _) = connect_async(url).await?;
    println!("Sending: demo");
    ws_stream.send(Message::text("demo")).await?;

    for _ in 1..101 {
        println!("Sending: client_msg");
        ws_stream.send(Message::text("client_msg")).await?;
        let msg = ws_stream.next().await;

        println!("Received: {:?}", msg);
        task::sleep(Duration::from_millis(1000)).await;
    }

    ws_stream.close(None).await?;

    Ok(())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let data = Engine::new().get_data();
    println!("{}", data);
    let opts: Opts = Opts::parse();
    task::block_on(run(opts.hub))
}
