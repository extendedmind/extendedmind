use anyhow::Result;
use clap::Parser;
use extendedmind_hub::admin::execute_admin_command;
use extendedmind_hub::common::AdminCommand;
use std::process;

mod common;
mod http;
mod logging;
mod metrics;
mod opts;
mod server;

use logging::{setup_logging, LogMethod};
use opts::{Command, Opts};
use server::start_server;

fn main() -> Result<()> {
    // Read in command line arguments and setup logging
    let opts: Opts = Opts::parse();
    let admin_socket_file = opts.global_opts.admin_socket_file;

    match opts.command {
        Command::Start {
            data_root_dir,
            log_opts,
            port_opts,
            http_opts,
            metrics_opts,
            performance_opts,
            backup_opts,
        } => {
            let log_method = if opts.global_opts.log_to_stderr {
                LogMethod::StdErr
            } else {
                LogMethod::AsyncStdOut
            };
            setup_logging(
                log_method,
                opts.global_opts.verbose.unwrap_or(false),
                log_opts.log_dir.clone(),
                log_opts.log_precision,
            );
            log::info!("enter: hub in server mode");
            start_server(
                admin_socket_file,
                data_root_dir,
                log_opts,
                backup_opts,
                metrics_opts,
                port_opts,
                http_opts,
                performance_opts,
            )?;
        }
        Command::Register { peermerge_doc_url } => {
            let result = futures::executor::block_on(execute_admin_command(
                admin_socket_file,
                AdminCommand::Register { peermerge_doc_url },
            ))?;
            process::exit(result.into());
        }
        Command::BustCache { .. } => {
            setup_logging(
                LogMethod::StdOut,
                opts.global_opts.verbose.unwrap_or(false),
                None,
                None,
            );
            log::debug!("enter: server in client mode, command BustCache");
            let result = futures::executor::block_on(execute_admin_command(
                admin_socket_file,
                AdminCommand::BustCache {},
            ))?;
            process::exit(result.into());
        }
    }
    Ok(())
}
