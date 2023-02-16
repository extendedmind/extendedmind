use clap::{Args, Parser, Subcommand};
use extendedmind_hub::common::{BackupOpts, GlobalOpts};
use std::path::PathBuf;

#[derive(Debug, Args)]
pub struct PortOpts {
    #[clap(long)]
    pub http_port: Option<u16>,
    #[clap(long)]
    pub https_port: Option<u16>,
    #[clap(short, long)]
    pub tcp_port: Option<u16>,
}

#[derive(Debug, Clone, Args)]
pub struct HttpOpts {
    #[clap(short, long)]
    pub static_root_dir: Option<PathBuf>,
    #[clap(long)]
    pub domain: Option<String>,
    #[clap(long)]
    pub acme_email: Option<String>,
    #[clap(long)]
    pub acme_dir: Option<String>,
    #[clap(long)]
    pub acme_production: Option<bool>,
    #[clap(long)]
    pub hsts_max_age: Option<u64>,
    #[clap(long)]
    pub hsts_permanent_redirect: Option<bool>,
    #[clap(long)]
    pub hsts_preload: Option<bool>,
}

#[derive(Debug, Args)]
pub struct MetricsOpts {
    #[clap(long)]
    pub metrics_dir: Option<PathBuf>,
    #[clap(long)]
    pub metrics_precision: Option<u8>,
    #[clap(long)]
    pub metrics_endpoint: Option<String>,
    #[clap(long)]
    pub metrics_secret: Option<String>,
    #[clap(long)]
    pub metrics_skip_compress: Option<bool>,
}

#[derive(Debug, Args)]
pub struct LogOpts {
    #[clap(short, long)]
    pub log_to_stderr: bool,
    #[clap(long)]
    pub log_dir: Option<PathBuf>,
    #[clap(long)]
    pub log_precision: Option<u8>,
}

#[derive(Debug, Args)]
pub struct PerformanceOpts {
    #[clap(long)]
    pub skip_compress_mime: Option<Vec<String>>,
    #[clap(long)]
    pub cache_ttl_sec: Option<u64>,
    #[clap(long)]
    pub cache_tti_sec: Option<u64>,
    #[clap(long)]
    pub inline_css_path: Option<Vec<String>>,
    #[clap(long)]
    pub inline_css_skip_referer: Option<Vec<String>>,
    #[clap(long)]
    pub immutable_path: Option<Vec<String>>,
}

#[derive(Debug, Subcommand)]
pub enum Command {
    /// Start the server to given TCP/IP port.
    Start {
        #[clap(short, long)]
        data_root_dir: PathBuf,
        #[clap(flatten)]
        log_opts: LogOpts,
        #[clap(flatten)]
        port_opts: PortOpts,
        #[clap(flatten)]
        http_opts: HttpOpts,
        #[clap(flatten)]
        metrics_opts: MetricsOpts,
        #[clap(flatten)]
        performance_opts: PerformanceOpts,
        #[clap(flatten)]
        backup_opts: BackupOpts,
    },
    /// Register a proxy for a peermerge's document URL
    Register {
        #[clap(short, long)]
        peermerge_doc_url: String,
    },
    /// Bust cache
    BustCache {},
}

#[derive(Parser)]
#[clap(version = "0.0.1", author = "Timo Tiuraniemi <timo.tiuraniemi@iki.fi>")]
pub struct Opts {
    #[clap(subcommand)]
    pub command: Command,
    #[clap(flatten)]
    pub global_opts: GlobalOpts,
}
