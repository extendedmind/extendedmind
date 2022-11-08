use anyhow::Result;
use clap::Parser;
use std::process;

mod admin;
mod common;
mod http;
mod logging;
mod metrics;
mod opts;
mod server;

use admin::execute_admin_command;
use common::DEFAULT_ADMIN_SOCKET_FILE;
use logging::{setup_logging, LogMethod};
use opts::Opts;
use server::start_server;

fn main() -> Result<()> {
    // Read in command line arguments and setup logging
    let opts: Opts = Opts::parse();
    let admin_socket_file: String = opts
        .admin_socket_file
        .clone()
        .unwrap_or(DEFAULT_ADMIN_SOCKET_FILE.to_string());
    if let Some(admin_command) = opts.admin_command {
        setup_logging(LogMethod::StdOut, opts.verbose.unwrap_or(false), None, None);
        log::debug!("enter: hub in client mode, command: {:?}", admin_command);
        let result =
            futures::executor::block_on(execute_admin_command(admin_socket_file, admin_command))?;
        process::exit(result.into());
    } else {
        let log_method = if opts.log_to_stderr {
            LogMethod::StdErr
        } else {
            LogMethod::AsyncStdOut
        };
        setup_logging(
            log_method,
            opts.verbose.unwrap_or(false),
            opts.log_dir.clone(),
            opts.log_precision,
        );
        log::info!("enter: hub in server mode");
        start_server(admin_socket_file, opts)?;
    }
    Ok(())
}
