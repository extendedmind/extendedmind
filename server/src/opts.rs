use clap::{ArgEnum, Parser};
use std::{convert::TryFrom, path::PathBuf};

#[derive(Debug, Copy, Clone, PartialEq, Eq, PartialOrd, Ord, ArgEnum)]
#[repr(u8)]
pub enum AdminCommand {
    BustCache = 1,
}

impl TryFrom<u8> for AdminCommand {
    type Error = ();
    fn try_from(input: u8) -> Result<Self, <Self as TryFrom<u8>>::Error> {
        match input {
            1u8 => Ok(Self::BustCache),
            _ => Err(()),
        }
    }
}

#[derive(Parser)]
#[clap(version = "0.0.1", author = "Timo Tiuraniemi <timo.tiuraniemi@iki.fi>")]
pub struct Opts {
    #[clap(arg_enum)]
    pub admin_command: Option<AdminCommand>,
    #[clap(long)]
    pub admin_socket_file: Option<String>,
    #[clap(short, long)]
    pub verbose: Option<bool>,
    #[clap(short, long)]
    pub data_root_dir: Option<PathBuf>,
    #[clap(short, long)]
    pub static_root_dir: Option<PathBuf>,
    #[clap(short, long)]
    pub http_port: Option<u16>,
    #[clap(long)]
    pub https_port: Option<u16>,
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
    #[clap(short, long)]
    pub tcp_port: Option<u16>,
    #[clap(short, long)]
    pub log_to_stderr: bool,
    #[clap(long)]
    pub log_dir: Option<PathBuf>,
    #[clap(long)]
    pub log_precision: Option<u8>,
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
    #[clap(long)]
    pub backup_dir: Option<PathBuf>,
    #[clap(long)]
    pub backup_interval_min: Option<u32>,
    #[clap(long)]
    pub backup_ssh_recipients_file: Option<PathBuf>,
    #[clap(long)]
    pub backup_email_from: Option<String>,
    #[clap(long)]
    pub backup_email_to: Option<String>,
    #[clap(long)]
    pub backup_email_smtp_host: Option<String>,
    #[clap(long)]
    pub backup_email_smtp_username: Option<String>,
    #[clap(long)]
    pub backup_email_smtp_password: Option<String>,
    #[clap(long)]
    pub backup_email_smtp_tls_port: Option<u16>,
    #[clap(long)]
    pub backup_email_smtp_starttls_port: Option<u16>,
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
