use crate::common::State;
use crate::http::{http_main_server, http_redirect_server};
use anyhow::Result;
use extendedmind_engine::tcp;
use std::path::PathBuf;
use tide_acme::rustls_acme::caches::DirCache;
use tide_acme::{AcmeConfig, TideRustlsExt};

fn setup_logging(log_to_stderr: bool) {
    let base_config = fern::Dispatch::new()
        .format(|out, message, record| {
            out.finish(format_args!(
                "{}[{}][{}] {}",
                chrono::Local::now().format("[%Y-%m-%d %H:%M:%S]"),
                record.target(),
                record.level(),
                message
            ))
        })
        .level(log::LevelFilter::Debug);
    let std_config = if log_to_stderr {
        fern::Dispatch::new().chain(std::io::stderr())
    } else {
        fern::Dispatch::new().chain(std::io::stdout())
    };

    base_config.chain(std_config).apply().unwrap();
}

pub async fn start_server(
    initial_state: State,
    static_root_dir: Option<PathBuf>,
    http_port: Option<u16>,
    https_port: Option<u16>,
    domain: Option<String>,
    acme_email: Option<String>,
    acme_dir: Option<String>,
    tcp_port: Option<u16>,
    skip_compress_mime: Option<Vec<String>>,
    cache_ttl_sec: Option<u64>,
    cache_tti_sec: Option<u64>,
    inline_css_path: Option<Vec<String>>,
    immutable_path: Option<Vec<String>>,
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
            let redirect_server =
                http_redirect_server(format!("https://{}:{}", &domain, &https_port).as_str())
                    .unwrap();
            let redirect_listener = redirect_server.listen(format!("0.0.0.0:{}", &http_port));
            let main_listener = main_server.listen(
                tide_rustls::TlsListener::build()
                    .addrs(format!("0.0.0.0:{}", &https_port))
                    .acme(
                        AcmeConfig::new(vec![domain])
                            .contact_push(format!("mailto:{}", acme_email))
                            .cache(DirCache::new(acme_dir)),
                    ),
            );

            if let Some(tcp_port) = tcp_port {
                let tcp_listener = tcp::listen(format!("0.0.0.0:{}", tcp_port), engine);
                futures::try_join!(main_listener, redirect_listener, tcp_listener)?;
            } else {
                futures::try_join!(main_listener, redirect_listener)?;
            }

            // TODO
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
