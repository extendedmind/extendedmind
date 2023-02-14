use anyhow::Result;
use clap::{Parser, Subcommand};
use peermerge_tcp::connect_tcp_server_disk;
use std::{path::PathBuf, process};

use crate::{
    admin::execute_admin_command,
    common::{BackupOpts, GlobalOpts},
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
            let initialize_result = initialize(admin_socket_file, backup_opts, vec![data_root_dir]);

            // Block on server
            futures::executor::block_on(start_server(initialize_result, tcp_port))?;
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

async fn start_server(initialize_result: InitializeResult, tcp_port: u16) -> Result<()> {
    async_std::task::sleep(std::time::Duration::from_secs(100)).await;
    // tcp::listen(format!("0.0.0.0:{}", tcp_port), engine).await?;
    Ok(())
}
