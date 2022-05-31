use crate::common::ACCESS_LOG_IDENTIFIER;
use std::fs::{File, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::mpsc::channel;
use std::sync::mpsc::{Receiver, Sender};
use std::thread;
use thread_priority::{set_current_thread_priority, ThreadPriority};

// This is the number of characters taken from timestamp to create new access log file. E.g.
// from "2022-05-30_17.06.03", 13 means "2022-05-30_17.log".
const DEFAULT_ACCESS_LOG_FILE_PRECISION: u8 = 13;

pub fn setup_logging(
    log_to_stderr: bool,
    verbose: bool,
    log_dir: Option<PathBuf>,
    log_precision: Option<u8>,
) {
    let log_precision = log_precision.unwrap_or(DEFAULT_ACCESS_LOG_FILE_PRECISION);
    let log_level = if verbose {
        log::LevelFilter::Debug
    } else {
        log::LevelFilter::Info
    };
    let third_party_log_level = if verbose {
        log::LevelFilter::Debug
    } else {
        log::LevelFilter::Warn
    };

    let base_config = fern::Dispatch::new()
        .format(|out, message, record| {
            out.finish(format_args!(
                "{}[{}][{}] {}",
                chrono::Local::now().format("[%Y-%m-%d_%H.%M.%S]"),
                record.target(),
                record.level(),
                message
            ))
        })
        .level(log_level)
        .level_for("tide::log::middleware", third_party_log_level)
        .level_for("tide_rustls", third_party_log_level)
        .level_for("rustls", third_party_log_level);
    let std_config = if log_to_stderr {
        fern::Dispatch::new().chain(std::io::stderr())
    } else {
        let (tx, rx): (Sender<String>, Receiver<String>) = channel();
        thread::spawn(move || {
            set_current_thread_priority(ThreadPriority::Min).unwrap();
            let mut access_log_file_name: String = "".to_string();
            if let Some(log_dir) = log_dir {
                let mut access_log_file: File = OpenOptions::new()
                    .create(true)
                    .write(true)
                    .open(log_dir.join(".lock"))
                    .unwrap();
                while let Ok(msg) = rx.recv() {
                    let access_log_index = msg.find(ACCESS_LOG_IDENTIFIER);
                    if let Some(index) = access_log_index {
                        let timestamp = &msg[1..20];
                        let file_name =
                            format!("{}.log", timestamp[0..log_precision.into()].to_string());
                        if !file_name.eq(&access_log_file_name) {
                            access_log_file_name = file_name.clone();
                            access_log_file = OpenOptions::new()
                                .create(true)
                                .append(true)
                                .open(log_dir.join(file_name))
                                .unwrap();
                        }
                        let access_log = format!(
                            "{} {}",
                            &timestamp,
                            &msg[index + ACCESS_LOG_IDENTIFIER.len() + 1..]
                        );
                        access_log_file.write_all(access_log.as_bytes()).unwrap();
                    }
                    print!("{}", msg);
                }
            } else {
                while let Ok(msg) = rx.recv() {
                    print!("{}", msg);
                }
            }
        });
        fern::Dispatch::new().chain(tx)
    };

    base_config.chain(std_config).apply().unwrap();
}
