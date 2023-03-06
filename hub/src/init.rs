use anyhow::Result;
use async_ctrlc::CtrlC;
use extendedmind_core::{FeedDiskPersistence, NameDescription, Peermerge, RandomAccessDisk};
use futures::channel::mpsc::{unbounded, UnboundedReceiver, UnboundedSender};
use std::collections::HashMap;
use std::path::PathBuf;
use std::process;
use std::sync::atomic::AtomicBool;
use std::sync::Arc;
use std::time::Duration;
use tokio::{sync::Mutex, task, time::sleep};

use crate::admin::listen_to_admin_socket;
use crate::backup::start_backup_poll;
use crate::common::{AdminCommand, BackupOpts};

pub struct InitializeResult {
    pub admin_command_receiver: UnboundedReceiver<AdminCommand>,
    pub admin_result_sender: UnboundedSender<Result<()>>,
}

pub fn initialize(
    peermerge: &Peermerge<RandomAccessDisk, FeedDiskPersistence>,
    admin_socket_file: PathBuf,
    backup_opts: BackupOpts,
    backup_source_dirs: Vec<PathBuf>,
) -> Result<InitializeResult> {
    // Create channels for admin signals
    let (admin_command_sender, admin_command_receiver): (
        UnboundedSender<AdminCommand>,
        UnboundedReceiver<AdminCommand>,
    ) = unbounded();
    let (admin_result_sender, admin_result_receiver): (
        UnboundedSender<Result<()>>,
        UnboundedReceiver<Result<()>>,
    ) = unbounded();

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
        log::info!("(2/5) Sending close signal");
        // TODO: Here would be something like peermerge.close().await;
        log::info!("(3/5) Writing to abort lock");
        // TODO: This is unneeded when peermerge itself can notify it is closed
        *abort_writer.as_ref().lock().await = AtomicBool::new(true);
        // Wait 200ms before killing, to allow time for file saving and closing sockets
        log::info!("(4/5) Sleeping for 200ms");
        sleep(Duration::from_millis(200)).await;
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
    let peermerge_for_task = peermerge.clone();
    if let Some(backup_dir) = backup_opts.backup_dir.as_ref() {
        start_backup_poll(
            peermerge_for_task,
            backup_source_dirs,
            backup_dir.to_path_buf(),
            backup_opts.clone(),
            abort,
        );
    }

    Ok(InitializeResult {
        admin_command_receiver,
        admin_result_sender,
    })
}

pub async fn get_peermerge(
    data_root_dir: &PathBuf,
) -> Result<Peermerge<RandomAccessDisk, FeedDiskPersistence>> {
    let peermerge = if Peermerge::document_infos_disk(data_root_dir)
        .await
        .is_some()
    {
        Peermerge::open_disk(HashMap::new(), data_root_dir).await
    } else {
        Peermerge::create_new_disk(NameDescription::new("extendedmind_proxy"), data_root_dir).await
    };
    Ok(peermerge)
}
