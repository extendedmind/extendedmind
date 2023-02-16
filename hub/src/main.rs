use anyhow::Result;
use async_std::task;
use clap::{Parser, Subcommand};
use futures::stream::StreamExt;
use std::{path::PathBuf, process};

use crate::{
    admin::execute_admin_command,
    common::{AdminCommand, BackupOpts, GlobalOpts},
    init::initialize,
    listen::listen,
};

mod admin;
mod backup;
mod common;
mod init;
mod listen;

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
                initialize(&data_root_dir, admin_socket_file, backup_opts, vec![])?;

            // Listen to admin commands
            let mut admin_command_receiver = initialize_result.admin_command_receiver;
            let admin_result_sender = initialize_result.admin_result_sender;
            let mut peermerge_for_task = initialize_result.peermerge.clone();
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

            // Block on server
            futures::executor::block_on(listen(initialize_result.peermerge, tcp_port))?;
        }
        Command::Register { peermerge_doc_url } => {
            let result = futures::executor::block_on(execute_admin_command(
                admin_socket_file,
                AdminCommand::Register { peermerge_doc_url },
            ))?;
            process::exit(result.into());
        }
    }
    Ok(())
}
