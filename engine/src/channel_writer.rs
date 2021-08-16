use std::io;
use std::pin::Pin;
use std::task::{Context, Poll};
use anyhow::Result;
use bytes::Bytes;
use async_std::channel::{Sender, SendError};
use futures::io::AsyncWrite;
use reusable_box_future::ReusableBoxFuture;

#[derive(Debug)]
pub struct ChannelWriter {
    channel: Sender<Result<Bytes, io::Error>>,
    send_future: Option<ReusableBoxFuture<Result<(), SendError<Result<Bytes, io::Error>>>>>,
    sending: Option<Bytes>,
}

impl ChannelWriter {
    pub fn new(channel: Sender<Result<Bytes, io::Error>>) -> Self {
        Self {
            channel,
            send_future: None,
            sending: None,
        }
    }
    pub async fn send(self: Self, msg: Bytes) -> Result<(), SendError<Result<Bytes, io::Error>>> {
        self.channel.send(Ok(msg)).await
    }
}

impl AsyncWrite for ChannelWriter {
    fn poll_write(
        mut self: Pin<&mut Self>,
        cx: &mut Context<'_>,
        buf: &[u8],
    ) -> Poll<io::Result<usize>> {
        if self.sending.as_deref() != Some(buf) {
            let buf = Bytes::copy_from_slice(buf);

            let send_future = {
                let channel = self.channel.clone();
                let buf = buf.clone();
                async move { channel.send(Ok(buf)).await }
            };

            if let Some(old_send_future) = self.send_future.as_mut() {
                old_send_future.set(send_future);
            } else {
                self.send_future = Some(ReusableBoxFuture::new(send_future));
            }
            self.sending = Some(buf);
        }

        self.send_future.as_mut().unwrap().poll(cx).map(|res| {
            self.sending = None;
            Ok(res.map_or(0, |()| buf.len()))
        })
    }
    fn poll_flush(self: Pin<&mut Self>, _cx: &mut Context<'_>) -> Poll<io::Result<()>> {
        Poll::Ready(Ok(()))
    }
    fn poll_close(self: Pin<&mut Self>, _cx: &mut Context<'_>) -> Poll<io::Result<()>> {
        Poll::Ready(Ok(()))
    }
}

