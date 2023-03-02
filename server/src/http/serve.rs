use anyhow::Result;
use axum::{
    extract::Host,
    handler::HandlerWithoutStateExt,
    http::{StatusCode, Uri},
    response::Redirect,
    routing::get,
    BoxError, Router,
};
use std::{net::SocketAddr, sync::Arc};
use wildmatch::WildMatch;

use crate::{
    common::State,
    opts::{HttpOpts, MetricsOpts, PerformanceOpts},
};

use super::html::{handle_static_files, StaticFilesState};

#[derive(Clone, Copy)]
pub struct Ports {
    http: u16,
    https: u16,
}

pub async fn serve_main_https(
    https_port: u16,
    domain: String,
    acme_dir: String,
    acme_email: String,
    http_opts: HttpOpts,
    metrics_opts: MetricsOpts,
    performance_opts: PerformanceOpts,
) -> std::io::Result<()> {
    Ok(())
}

pub async fn serve_main_http(
    initial_state: State,
    http_port: u16,
    http_opts: HttpOpts,
    metrics_opts: MetricsOpts,
    performance_opts: PerformanceOpts,
) -> std::io::Result<()> {
    let skip_compress_mime = performance_opts.skip_compress_mime.clone();
    let inline_css_wildmatch = match performance_opts.inline_css_path {
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
    let inline_css_skip_referer_wildmatch = match performance_opts.inline_css_skip_referer {
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

    let addr = SocketAddr::from(([0, 0, 0, 0], http_port));
    if let Some(static_root_dir) = http_opts.static_root_dir {
        if !static_root_dir.is_dir() {
            panic!(
                "Given --static-root-dir {:?} is not a directory",
                static_root_dir,
            );
        }
        let static_file_state = Arc::new(StaticFilesState::new(
            "*".to_string(),
            static_root_dir,
            skip_compress_mime,
            inline_css_wildmatch.clone(),
            inline_css_skip_referer_wildmatch.clone(),
            performance_opts.immutable_path.clone(),
            http_opts.hsts_max_age,
            http_opts.hsts_preload.unwrap_or(false),
        ));
        let app = Router::new()
            .route("/*path", get(handle_static_files))
            .route("/", get(handle_static_files))
            .with_state(static_file_state);

        axum::Server::bind(&addr)
            .serve(app.into_make_service())
            .await
            .unwrap();
    }

    Ok(())
}

pub async fn serve_redirect_http_to_https(ports: Ports) -> Result<()> {
    fn make_https(host: String, uri: Uri, ports: Ports) -> Result<Uri, BoxError> {
        let mut parts = uri.into_parts();

        parts.scheme = Some(axum::http::uri::Scheme::HTTPS);

        if parts.path_and_query.is_none() {
            parts.path_and_query = Some("/".parse().unwrap());
        }

        let https_host = host.replace(&ports.http.to_string(), &ports.https.to_string());
        parts.authority = Some(https_host.parse()?);

        Ok(Uri::from_parts(parts)?)
    }

    let redirect = move |Host(host): Host, uri: Uri| async move {
        match make_https(host, uri, ports) {
            Ok(uri) => Ok(Redirect::permanent(&uri.to_string())),
            Err(error) => {
                log::warn!("failed to convert URI to HTTPS {}", error);
                Err(StatusCode::BAD_REQUEST)
            }
        }
    };

    let addr = SocketAddr::from(([0, 0, 0, 0], ports.http));
    log::debug!("http redirect listening on {}", addr);

    axum::Server::bind(&addr)
        .serve(redirect.into_make_service())
        .await
        .unwrap();
    Ok(())
}
