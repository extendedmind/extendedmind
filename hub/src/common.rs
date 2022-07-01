use async_std::channel::{Receiver, Sender};
use extendedmind_engine::{Bytes, Engine, RandomAccessDisk};
use std::{io, path::PathBuf};

// Identifies that the log entry belongs in the access log. Needs to be separate from actual paths,
// hence the space.
pub const ACCESS_LOG_IDENTIFIER: &str = "GET _";

// Use UTC time, and format that is simple to use as a file name
pub const TIMESTAMP_SECONDS_FORMAT: &str = "%Y-%m-%d_%H.%M.%S";
pub const TIMESTAMP_SECONDS_FORMAT_LEN: usize = 19;
pub const TIMESTAMP_MINUTES_FORMAT: &str = "%Y-%m-%d_%H.%M";
pub const TIMESTAMP_DAYS_FORMAT: &str = "%Y-%m-%d";

#[derive(Clone, Copy)]
#[repr(u8)]
pub enum SystemCommand {
    WakeUp = 1,
    Disconnect = 2,
}

#[derive(derivative::Derivative)]
#[derivative(Clone(bound = ""))]
pub struct State {
    // Engine
    pub engine: Engine<RandomAccessDisk>,
    // System command receiver
    pub system_commands: Receiver<Result<Bytes, io::Error>>,
}

pub type ChannelSenderReceiver = (
    Sender<Result<Bytes, io::Error>>,
    Receiver<Result<Bytes, io::Error>>,
);

pub fn get_stem_from_path(path: &PathBuf) -> String {
    path.file_stem()
        .unwrap()
        .to_os_string()
        .into_string()
        .unwrap()
}

pub fn log_access(url_path: &str, code: &str, extra: Option<&str>) {
    // This value should be
    log::info!(
        "{} {} {} {}",
        crate::common::ACCESS_LOG_IDENTIFIER,
        code,
        &url_path,
        extra.unwrap_or("")
    );
}
