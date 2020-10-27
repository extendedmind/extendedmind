use actix::prelude::*;
use async_pipe::{PipeReader, PipeWriter};
use bytes::Bytes;
use futures::io::AsyncReadExt;
use futures::io::AsyncWriteExt;
use futures::TryFutureExt;
use hypercore_protocol::{Protocol, ProtocolBuilder};
// TODO:
// use hypercore_protocol::Message as HypercoreMessage;

pub struct HubHypercore {
    incoming_writer: PipeWriter,
    outgoing_reader: PipeReader,
    protocol: Protocol<PipeReader, PipeWriter>,
}
impl HubHypercore {
    pub fn new() -> Self {
        let (mut incoming_writer, incoming_reader) = async_pipe::pipe();
        let (outgoing_writer, mut outgoing_reader) = async_pipe::pipe();
        Self {
            incoming_writer,
            outgoing_reader,
            protocol: ProtocolBuilder::new(true).connect_rw(incoming_reader, outgoing_writer),
        }
    }
}
impl Actor for HubHypercore {
    type Context = actix::Context<Self>;
    fn started(&mut self, _ctx: &mut Self::Context) {
        debug!("HubHypercore started");
    }
}

#[derive(Debug)]
pub struct HubHypercoreError {}
impl std::fmt::Display for HubHypercoreError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Error")
    }
}
impl std::error::Error for HubHypercoreError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        None
    }
}

pub struct HubHypercoreMessage {
    pub payload: Bytes,
}
impl Message for HubHypercoreMessage {
    type Result = Result<Bytes, std::io::Error>;
}
impl Handler<HubHypercoreMessage> for HubHypercore {
    type Result = ResponseActFuture<HubHypercore, Result<Bytes, std::io::Error>>;
    fn handle(&mut self, msg: HubHypercoreMessage, _ctx: &mut Context<Self>) -> Self::Result {
        debug!("Got hub hypercore message");
        // TODO: Somehow use slef.incoming_writer! instead of these
        // let (mut incoming_writer, incoming_reader) = async_pipe::pipe();
        // let (outgoing_writer, mut outgoing_reader) = async_pipe::pipe();

        // let mut protocol = ProtocolBuilder::new(true).connect_rw(incoming_reader, outgoing_writer);
        let mut v = Vec::new();
        let fut = Box::new(self.incoming_writer.write_all(&msg.payload)).and_then(|_| {
            self.outgoing_reader
                .read_to_end(&mut v)
                .map_ok(|_| Bytes::from(v))
        });
        // let fut = futures::future::ok(msg.payload);
        Box::pin(fut.into_actor(self))
    }
}
