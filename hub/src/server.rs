use anyhow::Result;
use async_ctrlc::CtrlC;
use async_std::channel::bounded;
use async_std::sync::{Arc, Mutex};
use async_std::task;
use extendedmind_engine::{tcp, Bytes, Engine};
use futures::stream::StreamExt;
use moka::future::Cache;
use std::path::PathBuf;
use std::process;
use std::sync::atomic::AtomicBool;
use std::time::Duration;
use tide::http::headers::{HeaderName, HeaderValues};
use tide::http::Mime;
use tide::StatusCode;
use tide_acme::rustls_acme::caches::DirCache;
use tide_acme::{AcmeConfig, TideRustlsExt};

use crate::admin::listen_to_admin_socket;
// Internal
use crate::backup::{
    create_backup, get_next_backup_timestamp, get_next_backup_timestamp_on_launch, is_now_after,
};
use crate::common::{ChannelSenderReceiver, State, SystemCommand};
use crate::http::{create_cache, http_main_server, http_redirect_server};
use crate::metrics::process_metrics;
use crate::opts::Opts;

pub fn start_server(admin_socket_file: String, opts: Opts) -> Result<()> {
    let data_root_dir = &opts
        .data_root_dir
        .expect("--data-root-dir is mandatory in server mode");

    // Initialize the engine blocking
    let engine =
        futures::executor::block_on(
            async move { Engine::new_disk(data_root_dir, false, None).await },
        );

    // Create channels
    let (system_command_sender, system_command_receiver): ChannelSenderReceiver = bounded(1000);

    // Create state for websocket
    let initial_state = State {
        engine,
        system_commands: system_command_receiver,
    };

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
                "Could not delete admin socket file {}",
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

    let cache = create_cache(opts.cache_ttl_sec, opts.cache_tti_sec);

    // Listen to admin unix socket
    let cache_for_admin = cache.clone();
    task::spawn(async move {
        listen_to_admin_socket(admin_socket_file, cache_for_admin)
            .await
            .unwrap();
    });

    let backup_dir = opts.backup_dir.clone();
    let metrics_dir = opts.metrics_dir.clone();
    let backup_interval_min = opts.backup_interval_min.clone();
    let backup_ssh_recipients_file = opts.backup_ssh_recipients_file;
    let backup_email_from = opts.backup_email_from;
    let backup_email_to = opts.backup_email_to;
    let backup_email_smtp_host = opts.backup_email_smtp_host;
    let backup_email_smtp_username = opts.backup_email_smtp_username;
    let backup_email_smtp_password = opts.backup_email_smtp_password;
    let backup_email_smtp_tls_port = opts.backup_email_smtp_tls_port;
    let backup_email_smtp_starttls_port = opts.backup_email_smtp_starttls_port;
    task::spawn(async move {
        let mut interval = async_std::stream::interval(Duration::from_secs(1));
        let mut next_backup_timestamp =
            get_next_backup_timestamp_on_launch(backup_dir.clone(), backup_interval_min);
        while interval.next().await.is_some() && !*abort.as_ref().lock().await.get_mut() {
            if let Some(ref next_backup_timestamp_ref) = next_backup_timestamp {
                if let Some(ref backup_dir) = backup_dir {
                    if let Some(ref metrics_dir) = metrics_dir {
                        if is_now_after(*next_backup_timestamp_ref) {
                            log::info!("Creating backup");
                            create_backup(
                                backup_dir.to_path_buf(),
                                metrics_dir.to_path_buf(),
                                backup_ssh_recipients_file.clone(),
                                backup_email_from.clone(),
                                backup_email_to.clone(),
                                backup_email_smtp_host.clone(),
                                backup_email_smtp_username.clone(),
                                backup_email_smtp_password.clone(),
                                backup_email_smtp_tls_port.clone(),
                                backup_email_smtp_starttls_port.clone(),
                            );
                            next_backup_timestamp =
                                Some(get_next_backup_timestamp(backup_interval_min));
                        }
                    }
                }
            }
        }
    });

    if let Some(ref metrics_dir) = opts.metrics_dir {
        if let Some(log_dir) = opts.log_dir {
            process_metrics(metrics_dir.to_path_buf(), opts.metrics_precision, log_dir);
        }
    }

    // Block server with initial state
    futures::executor::block_on(start_server_async(
        initial_state,
        cache,
        opts.static_root_dir,
        opts.http_port,
        opts.https_port,
        opts.domain,
        opts.acme_email,
        opts.acme_dir,
        opts.acme_production.unwrap_or(false),
        opts.hsts_max_age,
        opts.hsts_permanent_redirect.unwrap_or(false),
        opts.hsts_preload.unwrap_or(false),
        opts.tcp_port,
        opts.skip_compress_mime,
        opts.inline_css_path,
        opts.inline_css_skip_referer,
        opts.immutable_path,
        opts.metrics_endpoint,
        opts.metrics_dir,
        opts.metrics_secret,
        opts.metrics_skip_compress.unwrap_or(false),
    ))?;

    Ok(())
}

async fn start_server_async(
    initial_state: State,
    cache: Option<Cache<String, (StatusCode, Mime, Vec<u8>, Vec<(HeaderName, HeaderValues)>)>>,
    static_root_dir: Option<PathBuf>,
    http_port: Option<u16>,
    https_port: Option<u16>,
    domain: Option<String>,
    acme_email: Option<String>,
    acme_dir: Option<String>,
    acme_production: bool,
    hsts_max_age: Option<u64>,
    hsts_permanent_redirect: bool,
    hsts_preload: bool,
    tcp_port: Option<u16>,
    skip_compress_mime: Option<Vec<String>>,
    inline_css_path: Option<Vec<String>>,
    inline_css_skip_referer: Option<Vec<String>>,
    immutable_path: Option<Vec<String>>,
    metrics_endpoint: Option<String>,
    metrics_dir: Option<PathBuf>,
    metrics_secret: Option<String>,
    metrics_skip_compress: bool,
) -> Result<()> {
    let engine = initial_state.engine.clone();

    if let Some(http_port) = http_port {
        let main_server = http_main_server(
            initial_state,
            cache,
            static_root_dir,
            skip_compress_mime,
            inline_css_path,
            inline_css_skip_referer,
            immutable_path,
            hsts_max_age,
            hsts_preload,
            metrics_endpoint,
            metrics_dir,
            metrics_secret,
            metrics_skip_compress,
        )
        .unwrap();
        if let Some(https_port) = https_port {
            if domain.is_none() || acme_dir.is_none() || acme_email.is_none() {
                anyhow::bail!(
                    "With --https-port also --domain, --acme-email and --acme-dir are required"
                );
            }
            let domain = domain.unwrap();
            let acme_dir = acme_dir.unwrap();
            let acme_email = acme_email.unwrap();
            let redirect_server = http_redirect_server(
                format!("https://{}:{}", &domain, &https_port).as_str(),
                hsts_permanent_redirect,
            )
            .unwrap();
            let redirect_listener = redirect_server.listen(format!("0.0.0.0:{}", &http_port));
            let main_listener = main_server.listen(
                tide_rustls::TlsListener::build()
                    .addrs(format!("0.0.0.0:{}", &https_port))
                    .tcp_nodelay(true)
                    .tcp_ttl(60)
                    .acme(
                        AcmeConfig::new(vec![domain])
                            .contact_push(format!("mailto:{}", acme_email))
                            .cache(DirCache::new(acme_dir))
                            .directory_lets_encrypt(acme_production),
                    ),
            );

            if let Some(tcp_port) = tcp_port {
                let tcp_listener = tcp::listen(format!("0.0.0.0:{}", tcp_port), engine);
                futures::try_join!(main_listener, redirect_listener, tcp_listener)?;
            } else {
                futures::try_join!(main_listener, redirect_listener)?;
            }
        } else {
            let main_listener = main_server.listen(format!("0.0.0.0:{}", &http_port));
            if let Some(tcp_port) = tcp_port {
                let tcp_listener = tcp::listen(format!("0.0.0.0:{}", tcp_port), engine);
                futures::try_join!(main_listener, tcp_listener)?;
            } else {
                main_listener.await?;
            }
        }
    } else {
        if let Some(tcp_port) = tcp_port {
            tcp::listen(format!("0.0.0.0:{}", tcp_port), engine).await?;
        } else {
            anyhow::bail!("Either --tcp-port or --http-port is mandatory");
        };
    }

    Ok(())
}
