use actix::prelude::*;
use async_pipe;
use bytes::Bytes;
use futures::io::AsyncReadExt;
use futures::io::AsyncWriteExt;
use hypercore_protocol::ProtocolBuilder;
// TODO:
// use hypercore_protocol::Message as HypercoreMessage;

pub struct HubHypercore {
    incoming_writer: async_pipe::PipeWriter,
    incoming_reader: async_pipe::PipeReader,
    outgoing_writer: async_pipe::PipeWriter,
    outgoing_reader: async_pipe::PipeReader,
}
impl HubHypercore {
    pub fn new() -> Self {
        let (mut incoming_writer, incoming_reader) = async_pipe::pipe();
        let (outgoing_writer, mut outgoing_reader) = async_pipe::pipe();
        Self {
            incoming_writer,
            incoming_reader,
            outgoing_writer,
            outgoing_reader,
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
    type Result = Result<Bytes, HubHypercoreError>;
}
impl Handler<HubHypercoreMessage> for HubHypercore {
    type Result = ResponseActFuture<HubHypercore, Result<Bytes, HubHypercoreError>>;
    fn handle(&mut self, msg: HubHypercoreMessage, _ctx: &mut Context<Self>) -> Self::Result {
        debug!("Got hub hypercore message");
        // TODO: Somehow use slef.incoming_writer! instead of these
        let (mut incoming_writer, incoming_reader) = async_pipe::pipe();
        let (outgoing_writer, mut outgoing_reader) = async_pipe::pipe();

        let mut protocol = ProtocolBuilder::new(true).connect_rw(incoming_reader, outgoing_writer);

        let fut = futures::future::ok(msg.payload);
        Box::pin(fut.into_actor(self))
    }
}
