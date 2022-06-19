use crate::common::{get_stem_from_path, TIMESTAMP_SECONDS_FORMAT, TIMESTAMP_SECONDS_FORMAT_LEN};
use age::cli_common::file_io;
use chrono::prelude::*;
use flate2::write::GzEncoder;
use flate2::Compression;
use std::fs::File;
use std::io::BufRead;
use std::path::PathBuf;
use std::thread;
use std::{fs::read_dir, io::BufReader};
use thread_priority::{set_current_thread_priority, ThreadPriority};

pub const BACKUP_FILE_PREFIX: &str = "hub_backup_";
pub const DEFAULT_BACKUP_INTERVAL_MIN: u32 = 1440;

pub fn get_next_backup_timestamp(backup_interval_min: Option<u32>) -> i64 {
    let backup_interval_min: i64 = backup_interval_min
        .unwrap_or(DEFAULT_BACKUP_INTERVAL_MIN)
        .into();
    let next_backup = Utc::now() + chrono::Duration::minutes(backup_interval_min);
    log::debug!("Next backup timestamp: {}", next_backup);
    next_backup.timestamp_millis()
}

pub fn get_next_backup_timestamp_on_launch(
    backup_dir: Option<PathBuf>,
    backup_interval_min: Option<u32>,
) -> Option<i64> {
    if let Some(backup_dir) = backup_dir {
        let backup_interval_min: i64 = backup_interval_min
            .unwrap_or(DEFAULT_BACKUP_INTERVAL_MIN)
            .into();
        let mut paths = read_dir(backup_dir.to_str().unwrap())
            .unwrap()
            .map(|res| res.map(|e| e.path()))
            .filter(|path| {
                if let Ok(path) = path {
                    return path.is_file()
                        && get_stem_from_path(&path).starts_with(BACKUP_FILE_PREFIX);
                }
                false
            })
            .collect::<Result<Vec<_>, std::io::Error>>()
            .unwrap();
        paths.sort();
        let next_backup = if paths.is_empty() {
            // There are no backups, the next one is interval from now
            Utc::now() + chrono::Duration::minutes(backup_interval_min)
        } else {
            let previous_backup_timestamp = get_stem_from_path(paths.get(paths.len() - 1).unwrap())
                [BACKUP_FILE_PREFIX.len()
                    ..(BACKUP_FILE_PREFIX.len() + TIMESTAMP_SECONDS_FORMAT_LEN)]
                .to_string();
            let previous_backup = Utc
                .datetime_from_str(
                    &previous_backup_timestamp.as_str(),
                    TIMESTAMP_SECONDS_FORMAT,
                )
                .unwrap();
            previous_backup + chrono::Duration::minutes(backup_interval_min)
        };
        log::debug!("Next backup timestamp is after: {}", next_backup);
        return Some(next_backup.timestamp_millis());
    }
    None
}

pub fn is_now_after(timestamp: i64) -> bool {
    let now = Utc::now();
    now.timestamp_millis() > timestamp
}

pub fn create_backup(
    backup_dir: PathBuf,
    metrics_dir: PathBuf,
    backup_ssh_recipients_file: Option<PathBuf>,
) {
    thread::spawn(move || {
        set_current_thread_priority(ThreadPriority::Min).unwrap();
        let metrics_dir = metrics_dir.canonicalize().unwrap();
        let timestamp_seconds = chrono::Utc::now().format(TIMESTAMP_SECONDS_FORMAT);
        let backup_file_str = format!(
            "{}/{}{}.tar.gz",
            backup_dir.display(),
            BACKUP_FILE_PREFIX,
            timestamp_seconds
        );
        {
            let backup_file = std::fs::File::create(&backup_file_str).unwrap();
            let enc = GzEncoder::new(backup_file, Compression::best());
            let mut a = tar::Builder::new(enc);
            a.append_dir_all(
                metrics_dir.as_path().file_name().unwrap(),
                metrics_dir.as_path(),
            )
            .unwrap();
            a.finish().unwrap();
        }

        if let Some(backup_ssh_recipients_file) = backup_ssh_recipients_file {
            // Encrypt backup with a file containing one or more SSH keys
            let backup_ssh_recipients_file_str = backup_ssh_recipients_file
                .clone()
                .to_str()
                .unwrap()
                .to_string();
            log::debug!(
                "Attempt to encrypt backup to SSH recipients listed in {}",
                backup_ssh_recipients_file_str.clone()
            );
            let mut recipients: Vec<Box<dyn age::Recipient>> = vec![];
            let buf = BufReader::new(File::open(&backup_ssh_recipients_file).unwrap());
            for (line_number, line) in buf.lines().enumerate() {
                let line = line.unwrap();
                if line.is_empty() || line.find('#') == Some(0) {
                    continue;
                }
                match line.parse::<age::ssh::Recipient>() {
                    Ok(recipient) => {
                        log::debug!("Adding SSH recipient {}", &recipient);
                        recipients.push(Box::new(recipient));
                    }
                    Err(_) => {
                        log::error!(
                            "Error reading line {} in backup SSH recipients file {}",
                            line_number,
                            backup_ssh_recipients_file_str
                        );
                    }
                }
            }
            if !recipients.is_empty() {
                log::debug!("Encrypting backup file {}", backup_file_str.clone());
                let encryptor = age::Encryptor::with_recipients(recipients);
                let mut input = File::open(&backup_file_str).unwrap();
                let encrypted_backup_file_str = backup_file_str + ".age";
                let output = file_io::OutputWriter::new(
                    Some(encrypted_backup_file_str.clone()),
                    file_io::OutputFormat::Binary,
                    0o666,
                    false,
                )
                .unwrap();
                let mut output = encryptor.wrap_output(output).unwrap();
                std::io::copy(&mut input, &mut output).unwrap();
                output.finish().unwrap();
                log::debug!("Encrypted backup to {}", encrypted_backup_file_str);
            } else {
                log::error!(
                    "Could not find any recipients from backup SSH recipients file {}",
                    backup_ssh_recipients_file_str.clone()
                );
            }
        };
    });
}
