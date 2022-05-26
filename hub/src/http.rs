use crate::common::State;
use anyhow::Result;
use std::path::PathBuf;
use tide_compress::CompressMiddleware;
use tide_websockets::WebSocket;

mod websocket;
use websocket::handle_hypercore;
mod html;
use html::ServeStaticFiles;

pub fn http_server(
    initial_state: State,
    static_root_dir: Option<PathBuf>,
    skip_compress_mime: Option<Vec<String>>,
    cache_ttl_sec: Option<u64>,
    cache_tti_sec: Option<u64>,
    inline_css_path: Option<Vec<String>>,
    immutable_path: Option<Vec<String>>,
) -> Result<tide::Server<State>> {
    let skip_compress_mime = skip_compress_mime.clone();
    let mut app = tide::with_state(initial_state);

    if let Some(static_root_dir) = static_root_dir {
        let index_path = static_root_dir.join("index.html");
        if index_path.exists() {
            app.at("").serve_file(index_path)?;
        }
        app.at("*").get(ServeStaticFiles::new(
            "*".to_string(),
            static_root_dir,
            skip_compress_mime,
            cache_ttl_sec,
            cache_tti_sec,
            inline_css_path,
            immutable_path,
        ));
    }

    app.at("/extendedmind/hypercore")
        .get(WebSocket::new(handle_hypercore));

    app.with(CompressMiddleware::new());

    return Ok(app);
}
