use anyhow::Result;
use async_std::task;
use clap::{Parser, Subcommand};
use extendedmind_engine::{NameDescription, Peermerge, StateEvent};
use futures::channel::mpsc::{unbounded, UnboundedReceiver, UnboundedSender};
use futures::stream::StreamExt;
use peermerge_tcp::connect_tcp_server_disk;
use std::{path::PathBuf, process};

use crate::{
    admin::execute_admin_command,
    common::{AdminCommand, BackupOpts, GlobalOpts},
    init::{initialize, InitializeResult},
};

mod admin;
mod backup;
mod common;
mod init;

#[derive(Parser)]
#[clap(version = "0.0.1", author = "Timo Tiuraniemi <timo.tiuraniemi@iki.fi>")]
pub(crate) struct Opts {
    #[clap(subcommand)]
    pub(crate) command: Command,
    #[clap(flatten)]
    pub(crate) global_opts: GlobalOpts,
}

#[derive(Debug, Subcommand)]
pub(crate) enum Command {
    /// Start listening to given TCP/IP port.
    Listen {
        #[clap(short, long)]
        data_root_dir: PathBuf,
        #[clap(short, long)]
        tcp_port: u16,
        #[clap(flatten)]
        backup_opts: BackupOpts,
    },
    /// Register a proxy for a peermerge's document URL
    Register {
        #[clap(short, long)]
        peermerge_doc_url: String,
    },
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
    setup_logging(opts.global_opts.verbose.unwrap_or(false));
    let admin_socket_file = opts.global_opts.admin_socket_file;

    match opts.command {
        Command::Listen {
            data_root_dir,
            tcp_port,
            backup_opts,
        } => {
            // Initialize
            let initialize_result =
                initialize(admin_socket_file, backup_opts, vec![data_root_dir.clone()]);

            // Block on server
            futures::executor::block_on(start_server(initialize_result, tcp_port, data_root_dir))?;
        }
        Command::Register { peermerge_doc_url } => {
            let result = futures::executor::block_on(execute_admin_command(
                admin_socket_file,
                common::AdminCommand::Register { peermerge_doc_url },
            ))?;
            process::exit(result.into());
        }
    }
    Ok(())
}

async fn start_server(
    initialize_result: InitializeResult,
    tcp_port: u16,
    data_root_dir: PathBuf,
) -> Result<()> {
    // Create channels
    let (mut peermerge_state_event_sender, mut peermerge_state_event_receiver): (
        UnboundedSender<StateEvent>,
        UnboundedReceiver<StateEvent>,
    ) = unbounded();

    // Create a peermerge
    let peermerge = Peermerge::create_new_disk(NameDescription::new("hub"), &data_root_dir).await;

    // Listen to admin commands
    let mut admin_command_receiver = initialize_result.admin_command_receiver;
    let admin_result_sender = initialize_result.admin_result_sender;
    let mut peermerge_for_task = peermerge.clone();
    task::spawn(async move {
        while let Some(event) = admin_command_receiver.next().await {
            match event {
                AdminCommand::Register { peermerge_doc_url } => {
                    peermerge_for_task
                        .attach_proxy_document_disk(&peermerge_doc_url)
                        .await;
                    admin_result_sender.try_send(Ok(())).unwrap();
                }
                AdminCommand::BustCache { .. } => {
                    // Nothing to do, just exit
                    admin_result_sender.try_send(Ok(())).unwrap();
                }
            }
        }
    });

    // Listen to peermerge state events, even if just to log them
    task::spawn(async move {
        while let Some(event) = peermerge_state_event_receiver.next().await {
            log::debug!("Received peermerge event {:?}", event);
        }
    });

    // Start server
    connect_tcp_server_disk(
        peermerge,
        "0.0.0.0",
        tcp_port,
        &mut peermerge_state_event_sender,
    )
    .await
    .unwrap();
    Ok(())
}
