use anyhow::Result;
use async_std::{
    io::{ReadExt, WriteExt},
    os::unix::net::{UnixListener, UnixStream},
};
use moka::future::Cache;
use std::convert::TryInto;
use tide::{
    http::{
        headers::{HeaderName, HeaderValues},
        Mime,
    },
    StatusCode,
};

use crate::opts::AdminCommand;

pub async fn execute_admin_command(admin_socket_file: String, command: AdminCommand) -> Result<u8> {
    log::debug!(
        "Executing admin command {:?} to socket {}",
        &command,
        &admin_socket_file,
    );
    let mut stream = UnixStream::connect(admin_socket_file).await?;
    let command_code: u8 = command as u8;
    stream.write_all(&[command_code]).await?;
    let mut response = vec![0; 1];
    stream.read_exact(&mut response).await?;
    log::debug!("Received admin command response: {:?}", response[0]);
    Ok(response[0])
}

pub async fn listen_to_admin_socket(
    admin_socket_file: String,
    cache: Option<Cache<String, (StatusCode, Mime, Vec<u8>, Vec<(HeaderName, HeaderValues)>)>>,
) -> Result<()> {
    let listener = UnixListener::bind(&admin_socket_file).await.unwrap();
    loop {
        match listener.accept().await {
            Ok((mut socket, addr)) => {
                log::debug!("Got an admin client: {:?} - {:?}", socket, addr);
                let mut command = vec![0; 1];
                socket.read_exact(&mut command).await.unwrap();
                let admin_command: Option<AdminCommand> = match command[0].try_into() {
                    Ok(admin_command) => Some(admin_command),
                    _ => None,
                };
                match admin_command {
                    Some(admin_command) => {
                        log::info!("Received admin command {:?}", &admin_command);
                        let result = process_admin_command(admin_command, cache.clone()).await;
                        socket.write_all(&[result]).await.unwrap();
                    }
                    None => {
                        log::warn!("Received invalid admin command, returing 1");
                        socket.write_all(&[1 as u8]).await.unwrap()
                    }
                };
                socket.write_all(&[0 as u8]).await.unwrap();
            }
            Err(e) => println!(
                "admin socket {}, accept function failed: {:?}",
                admin_socket_file, e
            ),
        };
    }
}

async fn process_admin_command(
    admin_command: AdminCommand,
    cache: Option<Cache<String, (StatusCode, Mime, Vec<u8>, Vec<(HeaderName, HeaderValues)>)>>,
) -> u8 {
    match admin_command {
        AdminCommand::BustCache => {
            if let Some(cache) = cache {
                cache.invalidate_all();
            }
        }
    }
    0u8
}
