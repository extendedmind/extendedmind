use anyhow::Result;
use axum::{
    extract::Host,
    handler::HandlerWithoutStateExt,
    http::{StatusCode, Uri},
    response::Redirect,
    routing::get,
    BoxError, Router,
};
use rustls_acme::axum::AxumAcceptor;
use std::{net::SocketAddr, sync::Arc};
use tower_http::compression::CompressionLayer;

use crate::{common::ServerState, metrics::handle_metrics};
use crate::{
    common::WEBSOCKET_PATH,
    opts::{HttpOpts, MetricsOpts, PerformanceOpts},
};

use super::html::handle_static_files;
use super::{cache::cache_middleware, websocket::handle_websocket};

#[derive(Clone, Copy)]
pub struct Ports {
    http: u16,
    https: u16,
}

pub async fn serve_main_https(
    server_state: ServerState,
    https_port: u16,
    axum_acceptor: AxumAcceptor,
) -> std::io::Result<()> {
    Ok(())
}

pub async fn serve_main_http(server_state: ServerState, http_port: u16) -> std::io::Result<()> {
    let addr = SocketAddr::from(([0, 0, 0, 0], http_port));
    if let Some(static_root_dir) = server_state.static_root_dir.as_ref() {
        if !static_root_dir.is_dir() {
            panic!(
                "Given --static-root-dir {:?} is not a directory",
                static_root_dir,
            );
        }
        let has_cache = server_state.cache.is_some();
        let server_state = Arc::new(server_state);

        // Websocket routing
        let app = Router::new().route(WEBSOCKET_PATH, get(handle_websocket));

        // Metrics routing
        let app = if let Some(metrics_state) = server_state.metrics_state.as_ref() {
            app.route(&metrics_state.metrics_endpoint, get(handle_metrics))
        } else {
            app
        };

        // Basic routing
        let app = app
            .route("/*path", get(handle_static_files))
            .route("/", get(handle_static_files));

        // Compression
        let app = app.layer(CompressionLayer::new().br(true).deflate(true).gzip(true));

        // Caching
        let app = if has_cache {
            app.route_layer(axum::middleware::from_fn_with_state(
                server_state.clone(),
                cache_middleware,
            ))
        } else {
            app
        };

        // State
        let app = app.with_state(server_state);

        axum::Server::bind(&addr)
            .serve(app.into_make_service_with_connect_info::<SocketAddr>())
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
