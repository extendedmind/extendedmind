use ::serde_json;
use async_std::sync::{Receiver, Sender};
use extendedmind_schema_rust::models::Data;
use futures::io::AsyncWrite;
use futures::stream::{IntoAsyncRead, TryStreamExt};
use futures::task::{Context, Poll};
use std::io;
use std::pin::Pin;

pub use bytes::Bytes;
pub use hypercore_protocol::Protocol;
use hypercore_protocol::ProtocolBuilder;

pub struct Engine {
    data: Data,
}

pub struct AsyncSender {
    sender: Sender<Result<Bytes, io::Error>>,
}

impl AsyncSender {
    pub fn new(sender: Sender<Result<Bytes, io::Error>>) -> AsyncSender {
        AsyncSender { sender }
    }
}

//
// hypercore-protocol-rs has an example that uses piper:
//
// https://github.com/Jancd/piper
//
//
impl AsyncWrite for AsyncSender {
    fn poll_write(
        self: Pin<&mut Self>,
        _: &mut Context<'_>,
        buf: &[u8],
    ) -> Poll<io::Result<usize>> {
        let buf_size = buf.len();
        // TODO: This is not very efficient when we need to copy every buffer.
        let bytes_buf = Bytes::copy_from_slice(buf);
        let result: io::Result<usize> = Pin::new(&mut &*self)
            .sender
            .try_send(Ok(bytes_buf))
            .map(|_| buf_size)
            .map_err(|e| io::Error::new(io::ErrorKind::Other, e.to_string()));
        Poll::Ready(result)
    }

    fn poll_flush(self: Pin<&mut Self>, _: &mut Context<'_>) -> Poll<io::Result<()>> {
        Poll::Ready(Ok(()))
    }

    fn poll_close(self: Pin<&mut Self>, _: &mut Context<'_>) -> Poll<io::Result<()>> {
        Poll::Ready(Ok(()))
    }
}

impl Engine {
    pub fn new() -> Engine {
        Engine {
            data: Data::new(Vec::new(), Vec::new()),
        }
    }
    pub fn get_data(&self) -> String {
        serde_json::to_string(&self.data).unwrap()
    }

    pub fn connect_passive(
        self,
        receiver: Receiver<Result<Bytes, io::Error>>,
        sender: AsyncSender,
    ) -> Protocol<IntoAsyncRead<Receiver<Result<Bytes, io::Error>>>, AsyncSender> {
        let receiver: IntoAsyncRead<Receiver<Result<Bytes, io::Error>>> =
            receiver.into_async_read();
        ProtocolBuilder::new(false).connect_rw(receiver, sender)
    }

    pub fn connect_active(
        self,
        sender: AsyncSender,
        receiver: Receiver<Result<Bytes, io::Error>>,
    ) -> Protocol<IntoAsyncRead<Receiver<Result<Bytes, io::Error>>>, AsyncSender> {
        let receiver: IntoAsyncRead<Receiver<Result<Bytes, io::Error>>> =
            receiver.into_async_read();
        ProtocolBuilder::new(true).connect_rw(receiver, sender)
    }
}

impl Default for Engine {
    fn default() -> Self {
        Engine::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_data() {
        assert_eq!("{\"items\":[],\"reminders\":[]}", Engine::new().get_data());
    }
}
