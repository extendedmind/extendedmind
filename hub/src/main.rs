use anyhow::Result;
use async_ctrlc::CtrlC;
use async_std::channel::bounded;
use async_std::sync::{Arc, Mutex};
use async_std::task;
use clap::Parser;
use extendedmind_engine::{Bytes, Engine};
use futures::stream::StreamExt;
use log::info;
use std::path::PathBuf;
use std::process;
use std::sync::atomic::AtomicBool;
use std::time::Duration;

mod backup;
mod common;
mod http;
mod logging;
mod metrics;
mod server;

use backup::{
    create_backup, get_next_backup_timestamp, get_next_backup_timestamp_on_launch, is_now_after,
};
use common::{ChannelSenderReceiver, State, SystemCommand};
use logging::setup_logging;
use metrics::process_metrics;
use server::start_server;

#[derive(Parser)]
#[clap(version = "0.1.0", author = "Timo Tiuraniemi <timo.tiuraniemi@iki.fi>")]
struct Opts {
    #[clap(short, long)]
    verbose: Option<bool>,
    #[clap(short, long)]
    data_root_dir: PathBuf,
    #[clap(short, long)]
    static_root_dir: Option<PathBuf>,
    #[clap(short, long)]
    http_port: Option<u16>,
    #[clap(long)]
    https_port: Option<u16>,
    #[clap(long)]
    domain: Option<String>,
    #[clap(long)]
    acme_email: Option<String>,
    #[clap(long)]
    acme_dir: Option<String>,
    #[clap(long)]
    acme_production: Option<bool>,
    #[clap(long)]
    hsts_max_age: Option<u64>,
    #[clap(long)]
    hsts_permanent_redirect: Option<bool>,
    #[clap(long)]
    hsts_preload: Option<bool>,
    #[clap(short, long)]
    tcp_port: Option<u16>,
    #[clap(short, long)]
    log_to_stderr: bool,
    #[clap(long)]
    log_dir: Option<PathBuf>,
    #[clap(long)]
    log_precision: Option<u8>,
    #[clap(long)]
    metrics_dir: Option<PathBuf>,
    #[clap(long)]
    metrics_precision: Option<u8>,
    #[clap(long)]
    metrics_endpoint: Option<String>,
    #[clap(long)]
    backup_dir: Option<PathBuf>,
    #[clap(long)]
    backup_interval_min: Option<u32>,
    #[clap(long)]
    backup_ssh_recipients_file: Option<PathBuf>,
    #[clap(long)]
    skip_compress_mime: Option<Vec<String>>,
    #[clap(long)]
    cache_ttl_sec: Option<u64>,
    #[clap(long)]
    cache_tti_sec: Option<u64>,
    #[clap(long)]
    inline_css_path: Option<Vec<String>>,
    #[clap(long)]
    immutable_path: Option<Vec<String>>,
}

fn main() -> Result<()> {
    // Read in command line arguments and setup logging
    let opts: Opts = Opts::parse();
    setup_logging(
        opts.log_to_stderr,
        opts.verbose.unwrap_or(false),
        opts.log_dir.clone(),
        opts.log_precision,
    );
    info!("enter: hub");
    let data_root_dir = &opts.data_root_dir;

    // Initialize the engine blocking
    let engine =
        futures::executor::block_on(
            async move { Engine::new_disk(data_root_dir, false, None).await },
        );

    // Create channels
    let (system_command_sender, system_command_receiver): ChannelSenderReceiver = bounded(1000);

    // Create state for websocket
    let initial_state = State {
        engine,
        system_commands: system_command_receiver,
    };

    // Listen to ctrlc in a separate task
    let ctrlc = CtrlC::new().expect("cannot create Ctrl+C handler?");
    let disconnect_sender = system_command_sender.clone();
    let abort: Arc<Mutex<AtomicBool>> = Arc::new(Mutex::new(AtomicBool::new(false)));
    let abort_writer = abort.clone();
    task::spawn(async move {
        ctrlc.await;
        info!("Received termination signal, sending disconnect");
        disconnect_sender
            .send(Ok(Bytes::from_static(&[SystemCommand::Disconnect as u8])))
            .await
            .unwrap();
        *abort_writer.as_ref().lock().await = AtomicBool::new(true);
        // Wait 200ms before killing, to allow time for file saving and closing sockets
        task::sleep(Duration::from_millis(200)).await;
        info!("Exiting process with 0");
        process::exit(0);
    });

    // Need to start a system executor to send the WakeUp command, we send it once per second so
    // that the listener will send a WS Ping when it wants to in a 1s delay.
    let backup_dir = opts.backup_dir.clone();
    let metrics_dir = opts.metrics_dir.clone();
    let backup_interval_min = opts.backup_interval_min.clone();
    let backup_ssh_recipients_file = opts.backup_ssh_recipients_file;
    task::spawn(async move {
        let mut interval = async_std::stream::interval(Duration::from_secs(1));
        let mut next_backup_timestamp =
            get_next_backup_timestamp_on_launch(backup_dir.clone(), backup_interval_min);
        while interval.next().await.is_some() && !*abort.as_ref().lock().await.get_mut() {
            system_command_sender
                .send(Ok(Bytes::from_static(&[SystemCommand::WakeUp as u8])))
                .await
                .unwrap();
            if let Some(ref next_backup_timestamp_ref) = next_backup_timestamp {
                if let Some(ref backup_dir) = backup_dir {
                    if let Some(ref metrics_dir) = metrics_dir {
                        if is_now_after(*next_backup_timestamp_ref) {
                            log::debug!("creating backup");
                            create_backup(
                                backup_dir.to_path_buf(),
                                metrics_dir.to_path_buf(),
                                backup_ssh_recipients_file.clone(),
                            );
                            next_backup_timestamp =
                                Some(get_next_backup_timestamp(backup_interval_min));
                        }
                    }
                }
            }
        }
    });

    if let Some(ref metrics_dir) = opts.metrics_dir {
        if let Some(log_dir) = opts.log_dir {
            process_metrics(metrics_dir.to_path_buf(), opts.metrics_precision, log_dir);
        }
    }

    // Block server with initial state
    futures::executor::block_on(start_server(
        initial_state,
        opts.static_root_dir,
        opts.http_port,
        opts.https_port,
        opts.domain,
        opts.acme_email,
        opts.acme_dir,
        opts.acme_production.unwrap_or(false),
        opts.hsts_max_age,
        opts.hsts_permanent_redirect.unwrap_or(false),
        opts.hsts_preload.unwrap_or(false),
        opts.tcp_port,
        opts.skip_compress_mime,
        opts.cache_ttl_sec,
        opts.cache_tti_sec,
        opts.inline_css_path,
        opts.immutable_path,
        opts.metrics_endpoint,
        opts.metrics_dir,
    ))?;

    Ok(())
}
