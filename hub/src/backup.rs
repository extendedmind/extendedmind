use crate::common::{get_stem_from_path, TIMESTAMP_SECONDS_FORMAT};
use chrono::prelude::*;
use flate2::write::GzEncoder;
use flate2::Compression;
use std::fs::read_dir;
use std::path::PathBuf;
use std::thread;
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
                [(BACKUP_FILE_PREFIX.len())..]
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

pub fn create_backup(backup_dir: PathBuf, metrics_dir: PathBuf) {
    thread::spawn(move || {
        set_current_thread_priority(ThreadPriority::Min).unwrap();
        let metrics_dir = metrics_dir.canonicalize().unwrap();
        let timestamp_seconds = chrono::Utc::now().format(TIMESTAMP_SECONDS_FORMAT);
        let backup_file = std::fs::File::create(format!(
            "{}/{}{}.tar.gz",
            backup_dir.display(),
            BACKUP_FILE_PREFIX,
            timestamp_seconds
        ))
        .unwrap();
        let enc = GzEncoder::new(backup_file, Compression::default());
        let mut a = tar::Builder::new(enc);
        a.append_dir_all(
            metrics_dir.as_path().file_name().unwrap(),
            metrics_dir.as_path(),
        )
        .unwrap();
        a.finish().unwrap();
    });
}
