use async_std::channel::{Receiver, Sender};
use extendedmind_engine::{Bytes, Engine, RandomAccessDisk};
use std::io;
use std::path::PathBuf;

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
    // Directory for data files
    pub data_root_dir: PathBuf,
    // Directory for static files
    pub static_root_dir: Option<PathBuf>,
    // Port to listen for HTTP traffic
    pub http_port: Option<u16>,
    // Port to listen for TCP hypercore protocol traffic
    pub tcp_port: Option<u16>,
}

pub type ChannelSenderReceiver = (
    Sender<Result<Bytes, io::Error>>,
    Receiver<Result<Bytes, io::Error>>,
);
