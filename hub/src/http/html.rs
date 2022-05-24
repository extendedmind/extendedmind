use async_std::path::PathBuf as AsyncPathBuf;
use std::path::{Path, PathBuf};
use std::{ffi::OsStr, io};
use tide::{Body, Endpoint, Request, Response, Result, StatusCode};

pub struct ServeStaticFiles {
    prefix: String,
    dir: PathBuf,
}

impl ServeStaticFiles {
    pub fn new(prefix: String, dir: PathBuf) -> Self {
        Self { prefix, dir }
    }
}

#[async_trait::async_trait]
impl<State> Endpoint<State> for ServeStaticFiles
where
    State: Clone + Send + Sync + 'static,
{
    async fn call(&self, req: Request<State>) -> Result {
        let path = req.url().path();
        let path = path
            .strip_prefix(&self.prefix.trim_end_matches('*'))
            .unwrap();
        let path = path.trim_start_matches('/');
        let mut file_path = self.dir.clone();
        for p in Path::new(path) {
            if p == OsStr::new(".") {
                continue;
            } else if p == OsStr::new("..") {
                file_path.pop();
            } else {
                file_path.push(&p);
            }
        }
        let file_path = AsyncPathBuf::from(file_path);

        // Search for .html suffix and/or directory with index.html
        let mut file_path_to_search = file_path.clone();
        let mut file_path_with_extension = file_path.clone();
        file_path_with_extension.set_extension("html");
        if file_path.is_dir().await {
            if file_path_with_extension.exists().await {
                file_path_to_search = file_path_with_extension;
            } else {
                file_path_to_search.push("index.html");
            }
        } else if !file_path.exists().await {
            file_path_to_search = file_path_with_extension;
        }

        if !file_path_to_search.starts_with(&self.dir) {
            log::warn!("Unauthorized attempt to read: {:?}", file_path_to_search);
            Ok(Response::new(StatusCode::Forbidden))
        } else {
            match Body::from_file(&file_path_to_search).await {
                Ok(body) => Ok(Response::builder(StatusCode::Ok).body(body).build()),
                Err(e) if e.kind() == io::ErrorKind::NotFound => {
                    log::warn!("File not found: {:?}", &file_path_to_search);
                    Ok(Response::new(StatusCode::NotFound))
                }
                Err(e) => Err(e.into()),
            }
        }
    }
}
