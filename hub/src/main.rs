use anyhow::Result;
use async_ctrlc::CtrlC;
use async_std::channel::{bounded, Receiver};
use async_std::sync::{Arc, Mutex};
use async_std::task;
use clap::Parser;
use extendedmind_engine::{tcp, Bytes, Engine, RandomAccessDisk};
use std::path::PathBuf;
use std::process;
use std::sync::atomic::AtomicBool;
use std::time::Duration;

mod backup;
mod common;

use backup::start_backup_poll;
use common::{ChannelSenderReceiver, SystemCommand};

#[derive(Parser)]
#[clap(version = "0.0.1", author = "Timo Tiuraniemi <timo.tiuraniemi@iki.fi>")]
struct Opts {
    #[clap(short, long)]
    data_root_dir: PathBuf,
    #[clap(short, long)]
    tcp_port: u16,
    #[clap(short, long)]
    verbose: Option<bool>,
    #[clap(short, long)]
    log_to_stderr: bool,
    #[clap(long)]
    backup_dir: Option<PathBuf>,
    #[clap(long)]
    backup_interval_min: Option<u32>,
    #[clap(long)]
    backup_ssh_recipients_file: Option<PathBuf>,
    #[clap(long)]
    backup_email_from: Option<String>,
    #[clap(long)]
    backup_email_to: Option<String>,
    #[clap(long)]
    backup_email_smtp_host: Option<String>,
    #[clap(long)]
    backup_email_smtp_username: Option<String>,
    #[clap(long)]
    backup_email_smtp_password: Option<String>,
    #[clap(long)]
    backup_email_smtp_tls_port: Option<u16>,
    #[clap(long)]
    backup_email_smtp_starttls_port: Option<u16>,
}

fn setup_logging(verbose: bool) {
    let log_level = if verbose {
        log::LevelFilter::Debug
    } else {
        log::LevelFilter::Info
    };

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
        .level(log_level);
    let std_config = fern::Dispatch::new().chain(std::io::stdout());
    base_config.chain(std_config).apply().unwrap();
}

fn main() -> Result<()> {
    let opts: Opts = Opts::parse();
    setup_logging(opts.verbose.unwrap_or(false));

    // Initialize the engine blocking
    let data_root_dir = opts.data_root_dir.clone();
    let engine =
        futures::executor::block_on(
            async move { Engine::new_disk(&data_root_dir, false, None).await },
        );

    // Create channels
    let (system_command_sender, system_command_receiver): ChannelSenderReceiver = bounded(1000);

    // Listen to ctrlc in a separate task
    let ctrlc = CtrlC::new().expect("cannot create Ctrl+C handler?");
    let abort: Arc<Mutex<AtomicBool>> = Arc::new(Mutex::new(AtomicBool::new(false)));
    let abort_writer = abort.clone();

    task::spawn(async move {
        ctrlc.await;
        log::info!("(1/4) Received termination signal, sending disconnect");
        system_command_sender
            .send(Ok(Bytes::from_static(&[SystemCommand::Disconnect as u8])))
            .await
            .unwrap();
        log::info!("(2/4) Writing to abort lock");
        *abort_writer.as_ref().lock().await = AtomicBool::new(true);
        // Wait 200ms before killing, to allow time for file saving and closing sockets
        log::info!("(3/4) Sleeping for 200ms");
        task::sleep(Duration::from_millis(200)).await;
        log::info!("(4/4) Exiting process with 0");
        process::exit(0);
    });

    // Backup polling
    if let Some(backup_dir) = opts.backup_dir.as_ref() {
        start_backup_poll(
            vec![opts.data_root_dir.clone()],
            backup_dir.to_path_buf(),
            opts.backup_interval_min.clone(),
            opts.backup_ssh_recipients_file.clone(),
            opts.backup_email_from.clone(),
            opts.backup_email_to.clone(),
            opts.backup_email_smtp_host.clone(),
            opts.backup_email_smtp_username.clone(),
            opts.backup_email_smtp_password.clone(),
            opts.backup_email_smtp_tls_port.clone(),
            opts.backup_email_smtp_starttls_port.clone(),
            abort,
        );
    }

    // Block server
    futures::executor::block_on(start_server(engine, system_command_receiver, opts.tcp_port))?;
    Ok(())
}

async fn start_server(
    engine: Engine<RandomAccessDisk>,
    _system_command_receiver: Receiver<Result<Bytes, std::io::Error>>,
    tcp_port: u16,
) -> Result<()> {
    tcp::listen(format!("0.0.0.0:{}", tcp_port), engine).await?;
    Ok(())
}
