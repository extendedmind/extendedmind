use async_std::task;
use clap::{Parser, Subcommand};
use extendedmind_ui_disk::{back_up, create_document};
use log::*;
use std::{io::Write, path::PathBuf};

#[derive(Debug, Subcommand)]
pub enum Command {
    /// Create a new extendedmind document.
    Create {
        #[clap(long)]
        description: Option<String>,
        #[clap(short, long)]
        encrypted: bool,
        #[clap(short, long)]
        output: Option<PathBuf>,
    },
    /// Back up to remote
    BackUp {
        #[clap(long)]
        encryption_key: Option<String>,
        #[clap(long)]
        hub_domain: String,
        #[clap(long)]
        hub_port: u16,
    },
}

#[derive(Parser)]
#[clap(version = "0.0.1", author = "Timo Tiuraniemi <timo.tiuraniemi@iki.fi>")]
struct Opts {
    #[clap(subcommand)]
    command: Command,
    #[clap(short, long)]
    data_root_dir: PathBuf,
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

async fn run_create_document(
    data_root_dir: PathBuf,
    description: Option<String>,
    encrypted: bool,
    output: Option<PathBuf>,
) -> Result<(), Box<dyn std::error::Error>> {
    let (_peermerge, _document_id, doc_url, proxy_doc_url, encryption_key) =
        create_document(data_root_dir, description, encrypted).await?;
    let mut lines: Vec<String> = vec![];
    lines.push(format!("DOC_URL={}", doc_url));
    lines.push(format!("PROXY_DOC_URL={}", proxy_doc_url));
    if let Some(encryption_key) = encryption_key {
        lines.push(format!("ENCRYPTION_KEY={}", encryption_key));
    }
    if let Some(output) = output {
        let output_file = std::fs::OpenOptions::new()
            .create(true)
            .write(true)
            .truncate(true)
            .open(output)
            .unwrap();
        let mut output_writer = std::io::LineWriter::new(output_file);

        for line in lines {
            output_writer.write_all(line.as_bytes())?;
            output_writer.write_all(b"\n")?;
        }
    } else {
        for line in lines {
            println!("{}", line);
        }
    }
    Ok(())
}

async fn run_back_up(
    data_root_dir: PathBuf,
    encryption_key: Option<String>,
    hub_domain: String,
    hub_port: u16,
) -> Result<(), Box<dyn std::error::Error>> {
    debug!("cli: back-up");
    back_up(data_root_dir, encryption_key, hub_domain, hub_port).await?;
    Ok(())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    setup_logging();
    let opts: Opts = Opts::parse();
    match opts.command {
        Command::Create {
            description,
            encrypted,
            output,
        } => task::block_on(run_create_document(
            opts.data_root_dir,
            description,
            encrypted,
            output,
        )),
        Command::BackUp {
            hub_domain,
            hub_port,
            encryption_key,
        } => task::block_on(run_back_up(
            opts.data_root_dir,
            encryption_key,
            hub_domain,
            hub_port,
        )),
    }
}
