use crate::common::State;
use anyhow::Result;
use tide_websockets::WebSocket;

mod endpoints;
use endpoints::{handle_hypercore, handle_index};

pub fn http_server(initial_state: State) -> Result<tide::Server<State>> {
    let static_root_dir = initial_state.static_root_dir.clone();
    let mut app = tide::with_state(initial_state);

    if let Some(static_root_dir) = static_root_dir {
        app.at("").get(handle_index);
        app.at("/extendedmind").get(handle_index);
        app.at("/").serve_dir(static_root_dir.to_str().unwrap())?;
    }

    app.at("/extendedmind/hypercore")
        .get(WebSocket::new(handle_hypercore));

    return Ok(app);
}
