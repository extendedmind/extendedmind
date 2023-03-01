use anyhow::Result;
use async_std::task;
use extendedmind_hub::common::{AdminCommand, BackupOpts};
use extendedmind_hub::extendedmind_core::{FeedDiskPersistence, Peermerge, RandomAccessDisk};
use extendedmind_hub::init::initialize;
use extendedmind_hub::listen::listen;
use futures::stream::StreamExt;
use moka::future::Cache;
use std::path::PathBuf;
use tide::http::headers::{HeaderName, HeaderValues};
use tide::http::Mime;
use tide::StatusCode;
use tide_acme::rustls_acme::caches::DirCache;
use tide_acme::{AcmeConfig, TideRustlsExt};

// Internal
use crate::common::State;
use crate::http::{create_cache, http_main_server, http_redirect_server};
use crate::metrics::process_metrics;
use crate::opts::{HttpOpts, LogOpts, MetricsOpts, PerformanceOpts, PortOpts};

pub fn start_server(
    admin_socket_file: PathBuf,
    data_root_dir: PathBuf,
    log_opts: LogOpts,
    backup_opts: BackupOpts,
    metrics_opts: MetricsOpts,
    port_opts: PortOpts,
    http_opts: HttpOpts,
    performance_opts: PerformanceOpts,
) -> Result<()> {
    // Initialize hub
    let backup_source_dirs = if let Some(metrics_dir) = metrics_opts.metrics_dir.as_ref() {
        vec![metrics_dir.to_path_buf()]
    } else {
        vec![]
    };
    let initialize_result = initialize(
        &data_root_dir,
        admin_socket_file,
        backup_opts,
        backup_source_dirs,
    )?;

    // Create cache
    let cache = create_cache(
        performance_opts.cache_ttl_sec,
        performance_opts.cache_tti_sec,
    );

    // Listen to admin commands
    let mut admin_command_receiver = initialize_result.admin_command_receiver;
    let admin_result_sender = initialize_result.admin_result_sender;
    let mut peermerge_for_task = initialize_result.peermerge.clone();
    let mut cache_for_task = cache.clone();
    task::spawn(async move {
        while let Some(event) = admin_command_receiver.next().await {
            match event {
                AdminCommand::Register { peermerge_doc_url } => {
                    peermerge_for_task
                        .attach_proxy_document_disk(&peermerge_doc_url)
                        .await;
                    admin_result_sender.unbounded_send(Ok(())).unwrap();
                }
                AdminCommand::BustCache { .. } => {
                    if let Some(cache) = cache_for_task.as_mut() {
                        cache.invalidate_all();
                    }
                    admin_result_sender.unbounded_send(Ok(())).unwrap();
                }
            }
        }
    });

    // Log processing to metrics
    if let Some(metrics_dir) = metrics_opts.metrics_dir.as_ref() {
        if let Some(log_dir) = log_opts.log_dir {
            process_metrics(
                metrics_dir.to_path_buf(),
                metrics_opts.metrics_precision,
                log_dir,
            );
        }
    }

    // Block server
    futures::executor::block_on(start_server_async(
        initialize_result.peermerge,
        cache,
        port_opts,
        http_opts,
        metrics_opts,
        performance_opts,
    ))?;

    Ok(())
}

async fn start_server_async(
    peermerge: Peermerge<RandomAccessDisk, FeedDiskPersistence>,
    cache: Option<Cache<String, (StatusCode, Mime, Vec<u8>, Vec<(HeaderName, HeaderValues)>)>>,
    port_opts: PortOpts,
    http_opts: HttpOpts,
    metrics_opts: MetricsOpts,
    performance_opts: PerformanceOpts,
) -> Result<()> {
    if let Some(http_port) = port_opts.http_port {
        let initial_state = State::new(peermerge.clone());
        let main_server = http_main_server(
            initial_state,
            cache,
            http_opts.clone(),
            metrics_opts,
            performance_opts,
        )
        .unwrap();
        if let Some(https_port) = port_opts.https_port {
            if http_opts.domain.is_none()
                || http_opts.acme_dir.is_none()
                || http_opts.acme_email.is_none()
            {
                anyhow::bail!(
                    "With --https-port also --domain, --acme-email and --acme-dir are required"
                );
            }
            let domain = http_opts.domain.unwrap();
            let acme_dir = http_opts.acme_dir.unwrap();
            let acme_email = http_opts.acme_email.unwrap();
            let redirect_server = http_redirect_server(
                format!("https://{}:{}", &domain, &https_port).as_str(),
                http_opts.hsts_permanent_redirect.unwrap_or(false),
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
                            .directory_lets_encrypt(http_opts.acme_production.unwrap_or(false)),
                    ),
            );

            if let Some(tcp_port) = port_opts.tcp_port {
                let tcp_listener = listen(peermerge, tcp_port);
                futures::try_join!(main_listener, redirect_listener, tcp_listener)?;
            } else {
                futures::try_join!(main_listener, redirect_listener)?;
            }
        } else {
            let main_listener = main_server.listen(format!("0.0.0.0:{}", &http_port));
            if let Some(tcp_port) = port_opts.tcp_port {
                let tcp_listener = listen(peermerge, tcp_port);
                futures::try_join!(main_listener, tcp_listener)?;
            } else {
                main_listener.await?;
            }
        }
    } else {
        if let Some(tcp_port) = port_opts.tcp_port {
            listen(peermerge, tcp_port).await?;
        } else {
            anyhow::bail!("Either --tcp-port or --http-port is mandatory");
        };
    }

    Ok(())
}
