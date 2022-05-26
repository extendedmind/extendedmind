use anyhow::Result;
use async_ctrlc::CtrlC;
use async_std::channel::bounded;
use async_std::sync::{Arc, Mutex};
use async_std::task;
use clap::Parser;
use extendedmind_engine::{tcp, Bytes, Engine};
use futures::stream::StreamExt;
use log::info;
use std::path::PathBuf;
use std::process;
use std::sync::atomic::AtomicBool;
use std::time::Duration;
use tide_acme::rustls_acme::caches::DirCache;
use tide_acme::{AcmeConfig, TideRustlsExt};
use tide_rustls::TlsListener;

mod common;
mod http;

use common::{ChannelSenderReceiver, State, SystemCommand};
use http::{http_main_server, http_redirect_server};

#[derive(Parser)]
#[clap(version = "0.1.0", author = "Timo Tiuraniemi <timo.tiuraniemi@iki.fi>")]
struct Opts {
    #[clap(short, long)]
    data_root_dir: PathBuf,
    #[clap(short, long)]
    static_root_dir: Option<PathBuf>,
    #[clap(short, long)]
    http_port: Option<u16>,
    #[clap(long)]
    https_port: Option<u16>,
    #[clap(long)]
    domain: Option<String>,
    #[clap(long)]
    acme_email: Option<String>,
    #[clap(long)]
    acme_dir: Option<String>,
    #[clap(short, long)]
    tcp_port: Option<u16>,
    #[clap(short, long)]
    log_to_stderr: bool,
    #[clap(long)]
    skip_compress_mime: Option<Vec<String>>,
    #[clap(long)]
    cache_ttl_sec: Option<u64>,
    #[clap(long)]
    cache_tti_sec: Option<u64>,
    #[clap(long)]
    inline_css_path: Option<Vec<String>>,
    #[clap(long)]
    immutable_path: Option<Vec<String>>,
}

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

async fn async_main(
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
                            .contact_push(acme_email)
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

fn main() -> Result<()> {
    // Read in command line arguments and setup logging
    let opts: Opts = Opts::parse();
    setup_logging(opts.log_to_stderr);
    info!("enter: hub");
    let data_root_dir = &opts.data_root_dir;

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
    let disconnect_sender = system_command_sender.clone();
    let abort: Arc<Mutex<AtomicBool>> = Arc::new(Mutex::new(AtomicBool::new(false)));
    let abort_writer = abort.clone();
    task::spawn(async move {
        ctrlc.await;
        disconnect_sender
            .send(Ok(Bytes::from_static(&[SystemCommand::Disconnect as u8])))
            .await
            .unwrap();
        *abort_writer.as_ref().lock().await = AtomicBool::new(true);
        // Wait 200ms before killing, to allow time for file saving and closing sockets
        task::sleep(Duration::from_millis(200)).await;
        process::exit(0);
    });

    // Need to start a system executor to send the WakeUp command, we send it once per second so
    // that the listener will send a WS Ping when it wants to in a 1s delay.
    task::spawn(async move {
        let mut interval = async_std::stream::interval(Duration::from_secs(1));
        while interval.next().await.is_some() && !*abort.as_ref().lock().await.get_mut() {
            task::sleep(Duration::from_millis(1000)).await;
            system_command_sender
                .send(Ok(Bytes::from_static(&[SystemCommand::WakeUp as u8])))
                .await
                .unwrap();
        }
    });

    // Block server with initial state
    futures::executor::block_on(async_main(
        initial_state,
        opts.static_root_dir,
        opts.http_port,
        opts.https_port,
        opts.domain,
        opts.acme_email,
        opts.acme_dir,
        opts.tcp_port,
        opts.skip_compress_mime,
        opts.cache_ttl_sec,
        opts.cache_tti_sec,
        opts.inline_css_path,
        opts.immutable_path,
    ))?;

    Ok(())
}
