use anyhow::Result;

use clap::Parser;

mod backup;
mod common;
mod http;
mod logging;
mod metrics;
mod opts;
mod server;

use logging::setup_logging;
use opts::Opts;
use server::start_server;

use crate::logging::LogMethod;

fn main() -> Result<()> {
    // Read in command line arguments and setup logging
    let opts: Opts = Opts::parse();
    if let Some(admin_command) = opts.admin_command {
        setup_logging(LogMethod::StdOut, opts.verbose.unwrap_or(false), None, None);
        log::debug!("enter: hub in client mode, command: {:?}", admin_command);
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
        start_server(opts)?;
    }
    Ok(())
}
