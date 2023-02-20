use anyhow::Result;
use async_std::{
    channel::{Receiver, Sender},
    io::{ReadExt, WriteExt},
    os::unix::net::{UnixListener, UnixStream},
};
use futures::stream::StreamExt;
use std::path::PathBuf;

use crate::common::AdminCommand;

const ADMIN_COMMAND_REGISTER: u8 = 1;
const ADMIN_COMMAND_BUST_CACHE: u8 = 2;

pub async fn execute_admin_command(
    admin_socket_file: PathBuf,
    admin_command: AdminCommand,
) -> Result<u8> {
    log::debug!(
        "Executing admin command {:?} to socket at {:?}",
        &admin_command,
        &admin_socket_file,
    );
    let payload: Vec<u8> = match admin_command {
        AdminCommand::Register { peermerge_doc_url } => {
            let mut payload = vec![ADMIN_COMMAND_REGISTER];
            payload.extend(peermerge_doc_url.as_bytes());
            payload
        }
        AdminCommand::BustCache { .. } => vec![ADMIN_COMMAND_BUST_CACHE],
    };
    log::debug!("Connecting to socket {:?}", &admin_socket_file);
    let mut stream = UnixStream::connect(admin_socket_file).await?;
    log::debug!("Sending payload {:02X?}", &payload);
    stream.write_all(&payload).await?;
    let mut response = vec![0; 1];
    stream.read_exact(&mut response).await?;
    log::debug!("Received admin command response: {:?}", response[0]);
    Ok(response[0])
}

pub async fn listen_to_admin_socket(
    admin_socket_file: PathBuf,
    admin_command_sender: Sender<AdminCommand>,
    mut admin_response_receiver: Receiver<Result<()>>,
) -> Result<()> {
    let listener = UnixListener::bind(&admin_socket_file)
        .await
        .expect(format!("Could not create socket to {:?}", admin_socket_file).as_str());
    loop {
        match listener.accept().await {
            Ok((mut socket, addr)) => {
                log::debug!("Got an admin client: {:?} - {:?}", socket, addr);
                let mut buffer = vec![0; 2048 + 1];
                let len = socket.read(&mut buffer).await.unwrap();
                let payload = buffer[0..len].to_vec();
                log::debug!("Read payload, len {}", payload.len());
                let admin_command: AdminCommand = match payload[0] {
                    ADMIN_COMMAND_REGISTER => {
                        let peermerge_doc_url: String =
                            match String::from_utf8(payload[1..].to_vec()) {
                                Ok(value) => value,
                                Err(err) => {
                                    log::warn!(
                                    "Received invalid register command payload, returning 1, {}",
                                    err
                                );
                                    socket.write_all(&[1 as u8]).await.unwrap();
                                    continue;
                                }
                            };
                        AdminCommand::Register { peermerge_doc_url }
                    }
                    ADMIN_COMMAND_BUST_CACHE => AdminCommand::BustCache,
                    _ => {
                        log::warn!("Received invalid admin command, returning 1");
                        socket.write_all(&[1 as u8]).await.unwrap();
                        continue;
                    }
                };
                log::info!("Received admin command {:?}", &admin_command);
                admin_command_sender.try_send(admin_command).unwrap();
                match admin_response_receiver.next().await {
                    Some(Ok(..)) => {
                        socket.write_all(&[0 as u8]).await.unwrap();
                    }
                    Some(Err(err)) => {
                        log::warn!(
                            "Received invalid response to admin command, returing 2, {}",
                            err
                        );
                        socket.write_all(&[2 as u8]).await.unwrap();
                    }
                    None => {
                        log::warn!("Received invalid response to admin command, returing 3",);
                        socket.write_all(&[3 as u8]).await.unwrap();
                    }
                }
                socket.write_all(&[0 as u8]).await.unwrap();
            }
            Err(e) => println!(
                "admin socket {:?}, accept function failed: {:?}",
                admin_socket_file, e
            ),
        };
    }
}
