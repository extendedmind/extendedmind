use async_std::channel::{Receiver, Sender};
use extendedmind_engine::{Bytes, Engine, RandomAccessDisk};
use std::io;

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
