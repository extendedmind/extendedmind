use crate::common::State;
use tide::{Body, Response, StatusCode};

pub async fn handle_index(req: tide::Request<State>) -> tide::Result<Response> {
    let static_root_dir = &req.state().static_root_dir;
    if let Some(static_root_dir) = static_root_dir {
        let mut res = Response::new(StatusCode::Ok);
        res.set_body(
            Body::from_file(
                static_root_dir
                    .join(req.url().path().get(1..).unwrap())
                    .join("index.html"),
            )
            .await
            .unwrap(),
        );

        Ok(res)
    } else {
        let res = Response::new(StatusCode::NotFound);
        Ok(res)
    }
}
