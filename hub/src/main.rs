use anyhow::Result;
use async_ctrlc::CtrlC;
use async_std::channel::bounded;
use async_std::sync::{Arc, Mutex};
use async_std::task;
use clap::Parser;
use extendedmind_engine::{Bytes, Engine};
use futures::stream::StreamExt;
use log::info;
use std::fs::{File, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::process;
use std::sync::atomic::AtomicBool;
use std::sync::mpsc::channel;
use std::sync::mpsc::{Receiver, Sender};
use std::thread;
use std::time::Duration;
use thread_priority::{set_current_thread_priority, ThreadPriority};

mod common;
mod http;
mod server;

use common::{ChannelSenderReceiver, State, SystemCommand, ACCESS_LOG_IDENTIFIER};
use server::start_server;

// This is the number of characters taken from timestamp to create new access log file. E.g.
// from "2022-05-30_17.06.03", 13 means "2022-05-30_17.log".
const DEFAULT_ACCESS_LOG_FILE_PRECISION: u8 = 13;

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

fn setup_logging(log_to_stderr: bool, verbose: bool, log_dir: Option<PathBuf>, log_precision: u8) {
    let log_level = if verbose {
        log::LevelFilter::Debug
    } else {
        log::LevelFilter::Info
    };
    let third_party_log_level = if verbose {
        log::LevelFilter::Debug
    } else {
        log::LevelFilter::Warn
    };

    let base_config = fern::Dispatch::new()
        .format(|out, message, record| {
            out.finish(format_args!(
                "{}[{}][{}] {}",
                chrono::Local::now().format("[%Y-%m-%d_%H.%M.%S]"),
                record.target(),
                record.level(),
                message
            ))
        })
        .level(log_level)
        .level_for("tide::log::middleware", third_party_log_level)
        .level_for("tide_rustls", third_party_log_level)
        .level_for("rustls", third_party_log_level);
    let std_config = if log_to_stderr {
        fern::Dispatch::new().chain(std::io::stderr())
    } else {
        let (tx, rx): (Sender<String>, Receiver<String>) = channel();
        thread::spawn(move || {
            set_current_thread_priority(ThreadPriority::Min).unwrap();
            let mut access_log_file_name: String = "".to_string();
            if let Some(log_dir) = log_dir {
                let mut access_log_file: File = OpenOptions::new()
                    .create(true)
                    .write(true)
                    .open(log_dir.join(".lock"))
                    .unwrap();
                while let Ok(msg) = rx.recv() {
                    let access_log_index = msg.find(ACCESS_LOG_IDENTIFIER);
                    if let Some(index) = access_log_index {
                        let timestamp = &msg[1..20];
                        let file_name =
                            format!("{}.log", timestamp[0..log_precision.into()].to_string());
                        if !file_name.eq(&access_log_file_name) {
                            access_log_file_name = file_name.clone();
                            access_log_file = OpenOptions::new()
                                .create(true)
                                .append(true)
                                .open(log_dir.join(file_name))
                                .unwrap();
                        }
                        let access_log = format!(
                            "{} {}",
                            &timestamp,
                            &msg[index + ACCESS_LOG_IDENTIFIER.len() + 1..]
                        );
                        access_log_file.write_all(access_log.as_bytes()).unwrap();
                    }
                    print!("{}", msg);
                }
            } else {
                while let Ok(msg) = rx.recv() {
                    print!("{}", msg);
                }
            }
        });
        fern::Dispatch::new().chain(tx)
    };

    base_config.chain(std_config).apply().unwrap();
}

fn main() -> Result<()> {
    // Read in command line arguments and setup logging
    let opts: Opts = Opts::parse();
    setup_logging(
        opts.log_to_stderr,
        opts.verbose.unwrap_or(false),
        opts.log_dir,
        opts.log_precision
            .unwrap_or(DEFAULT_ACCESS_LOG_FILE_PRECISION),
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
        disconnect_sender
            .send(Ok(Bytes::from_static(&[SystemCommand::Disconnect as u8])))
            .await
            .unwrap();
        *abort_writer.as_ref().lock().await = AtomicBool::new(true);
        // Wait 200ms before killing, to allow time for file saving and closing sockets
        task::sleep(Duration::from_millis(200)).await;
        process::exit(0);
    });

    // Need to start a system executor to send the WakeUp command, we send it once per second so
    // that the listener will send a WS Ping when it wants to in a 1s delay.
    task::spawn(async move {
        let mut interval = async_std::stream::interval(Duration::from_secs(1));
        while interval.next().await.is_some() && !*abort.as_ref().lock().await.get_mut() {
            task::sleep(Duration::from_millis(1000)).await;
            system_command_sender
                .send(Ok(Bytes::from_static(&[SystemCommand::WakeUp as u8])))
                .await
                .unwrap();
        }
    });

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
    ))?;

    Ok(())
}
