use crate::common::State;
use anyhow::Result;
use std::path::PathBuf;
use tide::{Redirect, Request};
use tide_compress::CompressMiddleware;
use tide_websockets::WebSocket;

mod websocket;
use websocket::handle_hypercore;
mod html;
use html::ServeStaticFiles;

pub fn http_main_server(
    initial_state: State,
    static_root_dir: Option<PathBuf>,
    skip_compress_mime: Option<Vec<String>>,
    cache_ttl_sec: Option<u64>,
    cache_tti_sec: Option<u64>,
    inline_css_path: Option<Vec<String>>,
    immutable_path: Option<Vec<String>>,
    hsts_max_age: Option<u64>,
    hsts_preload: bool,
) -> Result<tide::Server<State>> {
    let skip_compress_mime = skip_compress_mime.clone();
    let mut app = tide::with_state(initial_state);

    if let Some(static_root_dir) = static_root_dir {
        let index_path = static_root_dir.join("index.html");
        let serve_static_files = ServeStaticFiles::new(
            "*".to_string(),
            static_root_dir,
            skip_compress_mime,
            cache_ttl_sec,
            cache_tti_sec,
            inline_css_path,
            immutable_path,
            hsts_max_age,
            hsts_preload,
        );
        if index_path.exists() {
            app.at("").get(serve_static_files.clone());
        }
        app.at("*").get(serve_static_files);
    }

    app.at("/extendedmind/hypercore")
        .get(WebSocket::new(handle_hypercore));

    app.with(CompressMiddleware::new());

    return Ok(app);
}

/// The shared application state.
#[derive(Clone)]
pub struct RedirectState {
    redirect_to_url: String,
    permanent: bool,
}

pub fn http_redirect_server(
    redirect_to_url: &str,
    permanent: bool,
) -> Result<tide::Server<RedirectState>> {
    let mut app = tide::with_state(RedirectState {
        redirect_to_url: redirect_to_url.to_string(),
        permanent,
    });

    app.at("").get(if permanent {
        Redirect::permanent(redirect_to_url.to_string())
    } else {
        Redirect::temporary(redirect_to_url.to_string())
    });

    app.at("*").get(|req: Request<RedirectState>| async move {
        let path = req.url().path();
        let redirect_to = format!("{}{}", req.state().redirect_to_url, path);
        Ok(if req.state().permanent {
            Redirect::permanent(redirect_to)
        } else {
            Redirect::temporary(redirect_to)
        })
    });
    return Ok(app);
}
