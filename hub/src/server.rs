use crate::common::State;
use crate::http::{http_main_server, http_redirect_server};
use anyhow::Result;
use extendedmind_engine::tcp;
use std::path::PathBuf;
use tide_acme::rustls_acme::caches::DirCache;
use tide_acme::{AcmeConfig, TideRustlsExt};

pub async fn start_server(
    initial_state: State,
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
    cache_ttl_sec: Option<u64>,
    cache_tti_sec: Option<u64>,
    inline_css_path: Option<Vec<String>>,
    immutable_path: Option<Vec<String>>,
    metrics_endpoint: Option<String>,
    metrics_dir: Option<PathBuf>,
    metrics_secret: Option<String>,
) -> Result<()> {
    let engine = initial_state.engine.clone();

    if let Some(http_port) = http_port {
        let main_server = http_main_server(
            initial_state,
            static_root_dir,
            skip_compress_mime,
            cache_ttl_sec,
            cache_tti_sec,
            inline_css_path,
            immutable_path,
            hsts_max_age,
            hsts_preload,
            metrics_endpoint,
            metrics_dir,
            metrics_secret,
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
