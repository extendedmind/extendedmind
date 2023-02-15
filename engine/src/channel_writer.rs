use anyhow::Result;
use bytes::Bytes;
use futures::channel::mpsc::UnboundedSender;
use futures::io::{AsyncWrite, Error, ErrorKind};
use std::io;
use std::pin::Pin;
use std::task::{Context, Poll};

#[derive(Debug)]
pub struct ChannelWriter {
    channel: UnboundedSender<Result<Bytes, io::Error>>,
}

impl ChannelWriter {
    pub fn new(channel: UnboundedSender<Result<Bytes, io::Error>>) -> Self {
        Self { channel }
    }
}

impl AsyncWrite for ChannelWriter {
    fn poll_write(
        mut self: Pin<&mut Self>,
        context: &mut Context,
        buffer: &[u8],
    ) -> Poll<io::Result<usize>> {
        let len = buffer.len();

        match self.channel.poll_ready(context) {
            Poll::Ready(Ok(())) => {
                if let Err(e) = self.channel.start_send(Ok(Bytes::copy_from_slice(buffer))) {
                    if e.is_disconnected() {
                        return Poll::Ready(Err(Error::new(ErrorKind::BrokenPipe, e)));
                    }

                    // Unbounded channels should only ever have "Disconnected" errors
                    unreachable!();
                }
            }
            Poll::Ready(Err(e)) => {
                if e.is_disconnected() {
                    return Poll::Ready(Err(Error::new(ErrorKind::BrokenPipe, e)));
                }

                // Unbounded channels should only ever have "Disconnected" errors
                unreachable!();
            }
            Poll::Pending => return Poll::Pending,
        }

        Poll::Ready(Ok(len))
    }

    fn poll_flush(self: Pin<&mut Self>, _context: &mut Context) -> Poll<io::Result<()>> {
        Poll::Ready(Ok(()))
    }

    fn poll_close(self: Pin<&mut Self>, _context: &mut Context) -> Poll<io::Result<()>> {
        self.channel.close_channel();
        Poll::Ready(Ok(()))
    }
}
