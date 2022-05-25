use crate::common::State;
use anyhow::Result;
use tide_compress::CompressMiddleware;
use tide_websockets::WebSocket;

mod websocket;
use websocket::handle_hypercore;
mod html;
use html::ServeStaticFiles;

pub fn http_server(
    initial_state: State,
    skip_compress_mime: Option<Vec<String>>,
) -> Result<tide::Server<State>> {
    let static_root_dir = initial_state.static_root_dir.clone();
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
        ));
    }

    app.at("/extendedmind/hypercore")
        .get(WebSocket::new(handle_hypercore));

    app.with(CompressMiddleware::new());

    return Ok(app);
}
