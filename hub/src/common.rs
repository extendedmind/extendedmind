use clap::{self, Args};
use std::path::PathBuf;

// Use UTC time, and format that is simple to use as a file name
pub const TIMESTAMP_SECONDS_FORMAT: &str = "%Y-%m-%d_%H.%M.%S";
pub const TIMESTAMP_SECONDS_FORMAT_LEN: usize = 19;
pub const TIMESTAMP_MINUTES_FORMAT: &str = "%Y-%m-%d_%H.%M";
pub const TIMESTAMP_DAYS_FORMAT: &str = "%Y-%m-%d";

#[derive(Debug, Clone)]
pub enum AdminCommand {
    Register { peermerge_doc_url: String },
    BustCache,
}

#[derive(Debug, Args)]
pub struct GlobalOpts {
    #[clap(short, long)]
    pub admin_socket_file: PathBuf,
    #[clap(short, long)]
    pub verbose: Option<bool>,
    #[clap(short, long)]
    pub log_to_stderr: bool,
}

#[derive(Debug, Clone, Args)]
pub struct BackupOpts {
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
}

pub fn get_stem_from_path(path: &PathBuf) -> String {
    path.file_stem()
        .unwrap()
        .to_os_string()
        .into_string()
        .unwrap()
}
