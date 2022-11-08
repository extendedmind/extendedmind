use async_std::channel::{Receiver, Sender};
use extendedmind_engine::Bytes;
use std::io;
use std::path::PathBuf;

// Use UTC time, and format that is simple to use as a file name
pub const TIMESTAMP_SECONDS_FORMAT: &str = "%Y-%m-%d_%H.%M.%S";
pub const TIMESTAMP_SECONDS_FORMAT_LEN: usize = 19;
pub const TIMESTAMP_MINUTES_FORMAT: &str = "%Y-%m-%d_%H.%M";
pub const TIMESTAMP_DAYS_FORMAT: &str = "%Y-%m-%d";

#[derive(Clone, Copy)]
#[repr(u8)]
pub enum SystemCommand {
    Disconnect = 1,
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
