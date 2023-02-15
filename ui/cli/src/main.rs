use async_std::task;
use clap::Parser;
use extendedmind_core::capnp;
use extendedmind_ui_common::non_wasm::connect_to_hub;
use futures::{
    channel::mpsc::{unbounded, UnboundedReceiver, UnboundedSender},
    prelude::*,
};
use log::*;
use std::path::PathBuf;

#[derive(Parser)]
#[clap(version = "0.0.1", author = "Timo Tiuraniemi <timo.tiuraniemi@iki.fi>")]
struct Opts {
    data_root_dir: PathBuf,
    hub_host: String,
    hub_port: u16,
    doc_url: String,
}

fn setup_logging() {
    let base_config = fern::Dispatch::new()
        .format(|out, message, record| {
            out.finish(format_args!(
                "{}[{}][{}] {}",
                chrono::Local::now().format("[%Y-%m-%d %H:%M:%S]"),
                record.target(),
                record.level(),
                message
            ))
        })
        .level(log::LevelFilter::Debug);
    let std_config = fern::Dispatch::new().chain(std::io::stdout());
    base_config.chain(std_config).apply().unwrap();
}

async fn run(
    data_root_dir: PathBuf,
    hub_host: String,
    hub_port: u16,
    doc_url: String,
) -> Result<(), Box<dyn std::error::Error>> {
    debug!("Cli run");
    let (ui_protocol_sender, mut ui_protocol_receiver): (
        UnboundedSender<capnp::message::TypedBuilder<extendedmind_core::ui_protocol::Owned>>,
        UnboundedReceiver<capnp::message::TypedBuilder<extendedmind_core::ui_protocol::Owned>>,
    ) = unbounded();

    task::spawn_local(async move {
        debug!("Connecting to hub");
        connect_to_hub(
            data_root_dir,
            &hub_host,
            hub_port,
            &doc_url,
            ui_protocol_sender,
        )
        .await
        .unwrap();
    });

    // TODO: Eventually this would be a loop
    // loop {
    debug!("Begin listening to ui protocol messages");
    let message = ui_protocol_receiver.next().await.unwrap();
    let mut packed_message = Vec::<u8>::new();
    capnp::serialize_packed::write_message(&mut packed_message, message.borrow_inner()).unwrap();
    debug!("Got message {:?}", packed_message);
    // }

    Ok(())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    setup_logging();
    let opts: Opts = Opts::parse();
    task::block_on(run(
        opts.data_root_dir,
        opts.hub_host,
        opts.hub_port,
        opts.doc_url,
    ))
}
