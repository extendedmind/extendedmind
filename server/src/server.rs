use anyhow::Result;
use extendedmind_hub::common::{AdminCommand, BackupOpts};
use extendedmind_hub::extendedmind_core::{FeedDiskPersistence, Peermerge, RandomAccessDisk};
use extendedmind_hub::init::{get_peermerge, initialize};
use extendedmind_hub::listen::listen;
use futures::stream::StreamExt;
use rustls_acme::caches::DirCache;
use rustls_acme::futures_rustls::rustls::ServerConfig;
use rustls_acme::AcmeConfig;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::task;
use wildmatch::WildMatch;

// Internal
use crate::common::{MetricsState, ResponseCache, ServerState, WEBSOCKET_PATH};
use crate::http::cache::create_response_cache;
use crate::http::serve::{serve_main_http, serve_main_https, serve_redirect_http_to_https};
use crate::metrics::process_metrics;
use crate::opts::{HttpOpts, LogOpts, MetricsOpts, PerformanceOpts, PortOpts};

pub async fn start_server(
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

    let peermerge = get_peermerge(&data_root_dir).await?;
    let initialize_result = initialize(
        &peermerge,
        admin_socket_file,
        backup_opts,
        backup_source_dirs,
    )?;

    // Create cache
    let cache = create_response_cache(
        performance_opts.cache_ttl_sec,
        performance_opts.cache_tti_sec,
        performance_opts.cache_max_size,
    );

    // Listen to admin commands
    let mut admin_command_receiver = initialize_result.admin_command_receiver;
    let admin_result_sender = initialize_result.admin_result_sender;
    let mut peermerge_for_task = peermerge.clone();
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
    let server_state = init_server_state(
        peermerge.clone(),
        cache,
        &http_opts,
        &metrics_opts,
        &performance_opts,
    );

    // Block server
    if let Some(http_port) = port_opts.http_port {
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

            let mut acme_state = AcmeConfig::new(vec![domain])
                .contact_push(format!("mailto:{}", acme_email))
                .cache(DirCache::new(acme_dir))
                .directory_lets_encrypt(http_opts.acme_production.unwrap_or(false))
                .state();
            let rustls_config = ServerConfig::builder()
                .with_safe_defaults()
                .with_no_client_auth()
                .with_cert_resolver(acme_state.resolver());
            let acceptor = acme_state.axum_acceptor(Arc::new(rustls_config));
            tokio::spawn(async move {
                loop {
                    match acme_state.next().await.unwrap() {
                        Ok(ok) => log::debug!("ACME event: {:?}", ok),
                        Err(err) => log::error!("ACME error: {:?}", err),
                    }
                }
            });
            let main_listener = serve_main_https(server_state, https_port, acceptor);

            // let redirect_server = http_redirect_server(
            //     format!("https://{}:{}", &domain, &https_port).as_str(),
            //     http_opts.hsts_permanent_redirect.unwrap_or(false),
            // )
            // .unwrap();
            // let redirect_listener = redirect_server.listen(format!("0.0.0.0:{}", &http_port));
            // let main_listener = main_server.listen(
            //     tide_rustls::TlsListener::build()
            //         .addrs(format!("0.0.0.0:{}", &https_port))
            //         .tcp_nodelay(true)
            //         .tcp_ttl(60)
            //         .acme(
            //             AcmeConfig::new(vec![domain])
            //                 .contact_push(format!("mailto:{}", acme_email))
            //                 .cache(DirCache::new(acme_dir))
            //                 .directory_lets_encrypt(http_opts.acme_production.unwrap_or(false)),
            //         ),
            // );

            // if let Some(tcp_port) = port_opts.tcp_port {
            //     let tcp_listener = listen(peermerge, tcp_port);
            //     futures::try_join!(main_listener, redirect_listener, tcp_listener)?;
            // } else {
            //     futures::try_join!(main_listener, redirect_listener)?;
            // }
        } else {
            let main_listener = serve_main_http(server_state, http_port);
            if let Some(tcp_port) = port_opts.tcp_port {
                let tcp_listener = listen(peermerge, tcp_port);
                tokio::try_join!(main_listener, tcp_listener)?;
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

fn init_server_state(
    peermerge: Peermerge<RandomAccessDisk, FeedDiskPersistence>,
    cache: Option<ResponseCache>,
    http_opts: &HttpOpts,
    metrics_opts: &MetricsOpts,
    performance_opts: &PerformanceOpts,
) -> ServerState {
    let skip_compress_mime = performance_opts.skip_compress_mime.clone();
    let inline_css_wildmatch = match performance_opts.inline_css_path.as_ref() {
        Some(inline_css_path) => {
            log::info!("Inlining CSS for paths {:?}", &inline_css_path);
            Some(
                inline_css_path
                    .iter()
                    .map(|path| WildMatch::new(path))
                    .collect(),
            )
        }
        None => None,
    };
    let inline_css_skip_referer_wildmatch = match performance_opts.inline_css_skip_referer.as_ref()
    {
        Some(inline_css_skip_referer) => {
            log::info!(
                "Skip inlining CSS for Referer header url {:?}",
                &inline_css_skip_referer
            );
            Some(
                inline_css_skip_referer
                    .iter()
                    .map(|referer| WildMatch::new(referer))
                    .collect(),
            )
        }
        None => None,
    };

    let metrics_skip_compress: bool = metrics_opts.metrics_skip_compress.unwrap_or(false)
        || match &skip_compress_mime {
            Some(skip_compress_mime) => {
                skip_compress_mime.contains(&"application/json".to_string())
            }
            None => false,
        };

    let mut skip_cache_paths: Vec<String> = vec![WEBSOCKET_PATH.to_string()];
    let metrics_state: Option<MetricsState> =
        if let Some(metrics_endpoint) = metrics_opts.metrics_endpoint.as_ref() {
            if let Some(metrics_dir) = metrics_opts.metrics_dir.as_ref() {
                let metrics_state = MetricsState::new(
                    metrics_endpoint.clone(),
                    metrics_dir.clone(),
                    metrics_opts.metrics_secret.clone(),
                    metrics_skip_compress,
                );
                skip_cache_paths.push(metrics_endpoint.to_string());
                Some(metrics_state)
            } else {
                None
            }
        } else {
            None
        };
    ServerState::new(
        peermerge,
        http_opts.static_root_dir.clone(),
        skip_compress_mime,
        inline_css_wildmatch.clone(),
        inline_css_skip_referer_wildmatch.clone(),
        performance_opts.immutable_path.clone(),
        http_opts.hsts_max_age,
        http_opts.hsts_preload.unwrap_or(false),
        cache,
        Some(skip_cache_paths),
        metrics_state,
    )
}
