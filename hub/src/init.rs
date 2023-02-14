use anyhow::Result;
use async_ctrlc::CtrlC;
use async_std::channel::{unbounded, Receiver, Sender};
use async_std::sync::{Arc, Mutex};
use async_std::task;
use extendedmind_engine::Bytes;
use std::path::PathBuf;
use std::process;
use std::sync::atomic::AtomicBool;
use std::time::Duration;

use crate::admin::listen_to_admin_socket;
use crate::backup::start_backup_poll;
use crate::common::{AdminCommand, BackupOpts, ChannelSenderReceiver, SystemCommand};

pub struct InitializeResult {
    pub system_command_receiver: Receiver<Result<Bytes, std::io::Error>>,
    pub admin_command_receiver: Receiver<AdminCommand>,
    pub admin_result_sender: Sender<Result<()>>,
}

pub fn initialize(
    admin_socket_file: PathBuf,
    backup_opts: BackupOpts,
    backup_source_dirs: Vec<PathBuf>,
) -> InitializeResult {
    // Create channels
    let (system_command_sender, system_command_receiver): ChannelSenderReceiver = unbounded();
    let (admin_command_sender, admin_command_receiver): (
        Sender<AdminCommand>,
        Receiver<AdminCommand>,
    ) = unbounded();
    let (admin_result_sender, admin_result_receiver): (Sender<Result<()>>, Receiver<Result<()>>) =
        unbounded();

    // Listen to ctrlc in a separate task
    let ctrlc = CtrlC::new().expect("cannot create Ctrl+C handler?");
    let abort: Arc<Mutex<AtomicBool>> = Arc::new(Mutex::new(AtomicBool::new(false)));
    let abort_writer = abort.clone();
    let admin_socket_file_to_shutdown = admin_socket_file.clone();
    task::spawn(async move {
        ctrlc.await;
        log::info!("(1/5) Received termination signal, deleting admin socket");
        std::fs::remove_file(&admin_socket_file_to_shutdown).unwrap_or_else(|_| {
            log::warn!(
                "Could not delete admin socket file {:?}",
                admin_socket_file_to_shutdown,
            );
        });
        log::info!("(2/5) Sending disconnect");
        system_command_sender
            .send(Ok(Bytes::from_static(&[SystemCommand::Disconnect as u8])))
            .await
            .unwrap();
        log::info!("(3/5) Writing to abort lock");
        *abort_writer.as_ref().lock().await = AtomicBool::new(true);
        // Wait 200ms before killing, to allow time for file saving and closing sockets
        log::info!("(4/5) Sleeping for 200ms");
        task::sleep(Duration::from_millis(200)).await;
        log::info!("(5/5) Exiting process with 0");
        process::exit(0);
    });

    // Listen to admin unix socket
    task::spawn(async move {
        listen_to_admin_socket(
            admin_socket_file,
            admin_command_sender,
            admin_result_receiver,
        )
        .await
        .unwrap();
    });

    // Backup polling
    if let Some(backup_dir) = backup_opts.backup_dir.as_ref() {
        start_backup_poll(
            backup_source_dirs,
            backup_dir.to_path_buf(),
            backup_opts.clone(),
            abort,
        );
    }

    InitializeResult {
        system_command_receiver,
        admin_command_receiver,
        admin_result_sender,
    }
}
