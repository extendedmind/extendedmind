use extendedmind_engine::Engine;
use futures::prelude::*;

use async_std::task;
use async_tungstenite::{async_std::connect_async, tungstenite::Message};

use clap::Clap;

#[derive(Clap)]
#[clap(version = "0.1.0", author = "Timo Tiuraniemi <timo.tiuraniemi@iki.fi>")]
struct Opts {
    hub: String,
}

async fn run(url: String) -> Result<(), Box<dyn std::error::Error>> {
    let (mut ws_stream, _) = connect_async(url).await?;

    let text = "Hello, World!";

    println!("Sending: \"{}\"", text);
    ws_stream.send(Message::text(text)).await?;

    let msg = ws_stream
        .next()
        .await
        .ok_or_else(|| "didn't receive anything")??;

    println!("Received: {:?}", msg);
    ws_stream.close(None).await?;

    Ok(())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let data = Engine::new().get_data();
    println!("{}", data);
    let opts: Opts = Opts::parse();
    task::block_on(run(opts.hub))
}
