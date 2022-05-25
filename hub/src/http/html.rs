use async_std::path::PathBuf as AsyncPathBuf;
use moka::future::Cache;
use std::path::{Path, PathBuf};
use std::time::Duration;
use std::{ffi::OsStr, io};
use tide::http::mime::Mime;
use tide::{Body, Endpoint, Request, Response, Result, StatusCode};

pub struct ServeStaticFiles {
    prefix: String,
    dir: PathBuf,
    skip_compress_mime: Option<Vec<String>>,
    cache: Option<Cache<String, (Vec<u8>, Mime)>>,
}

impl ServeStaticFiles {
    pub fn new(prefix: String, dir: PathBuf, skip_compress_mime: Option<Vec<String>>) -> Self {
        Self {
            prefix,
            dir,
            skip_compress_mime,
            cache: Some(
                Cache::builder()
                    // TTL: 5 minutes
                    .time_to_live(Duration::from_secs(5 * 60))
                    // TTI: 1 minute
                    .time_to_idle(Duration::from_secs(60))
                    .build(),
            ),
        }
    }

    pub fn get_body_from_cache(&self, url: &str) -> Option<(Vec<u8>, Mime)> {
        match &self.cache {
            Some(cache) => cache.get(&url.to_string()),
            None => None,
        }
    }

    pub async fn insert_body_to_cache(&self, url: String, body_as_bytes: Vec<u8>, mime: Mime) {
        match &self.cache {
            Some(cache) => {
                cache
                    .insert(url.clone(), (body_as_bytes.clone(), mime))
                    .await
            }
            None => (),
        }
    }

    pub fn get_ok_response_from_body(&self, body_as_bytes: Vec<u8>, mime: Mime) -> Response {
        let mut body = Body::from_bytes(body_as_bytes);
        body.set_mime(mime.clone());
        let skip_compression: bool = match &self.skip_compress_mime {
            Some(skip_compress_mime) => skip_compress_mime.contains(&mime.essence().to_string()),
            None => false,
        };
        let response = Response::builder(StatusCode::Ok)
            .body(body)
            .header("Permissions-Policy", "browsing-topics=()");
        if skip_compression {
            response.header("Cache-Control", "no-transform").build()
        } else {
            response.build()
        }
    }

    pub fn get_path_with_extension(path: &AsyncPathBuf, extension: &str) -> AsyncPathBuf {
        let mut path_with_extension = path.clone();
        path_with_extension.set_extension(extension);
        return path_with_extension;
    }
}

#[async_trait::async_trait]
impl<State> Endpoint<State> for ServeStaticFiles
where
    State: Clone + Send + Sync + 'static,
{
    async fn call(&self, req: Request<State>) -> Result {
        let url = &req.url().to_string();
        let cached_body = self.get_body_from_cache(&url);
        return if cached_body.is_some() {
            // The body for the URL was found from the cache, return it without any file IO
            log::debug!("Cache hit: {}", &url);
            let cached_body = cached_body.unwrap();
            Ok(self.get_ok_response_from_body(cached_body.0, cached_body.1))
        } else {
            // Read the file from the file system
            log::debug!("Cache miss: {}", &url);
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

            let mut file_path_to_search = file_path;
            if file_path_to_search.extension().is_none() {
                // When a call comes without an extension, search for .html suffix and/or directory with
                // index.html
                if file_path_to_search.is_dir().await {
                    let file_path_with_extension =
                        ServeStaticFiles::get_path_with_extension(&file_path_to_search, "html");
                    if file_path_with_extension.exists().await {
                        file_path_to_search = file_path_with_extension;
                    } else {
                        file_path_to_search.push("index.html");
                    }
                } else if !file_path_to_search.exists().await {
                    let file_path_with_extension =
                        ServeStaticFiles::get_path_with_extension(&file_path_to_search, "html");
                    file_path_to_search = file_path_with_extension;
                }
            }
            if !file_path_to_search.starts_with(&self.dir) {
                log::warn!("Unauthorized attempt to read: {:?}", file_path_to_search);
                Ok(Response::new(StatusCode::Forbidden))
            } else {
                match Body::from_file(&file_path_to_search).await {
                    Ok(body) => {
                        let mime = body.mime().clone();
                        let body_as_bytes = body.into_bytes().await.unwrap();
                        self.insert_body_to_cache(url.clone(), body_as_bytes.clone(), mime.clone())
                            .await;
                        Ok(self.get_ok_response_from_body(body_as_bytes, mime))
                    }
                    Err(e) if e.kind() == io::ErrorKind::NotFound => {
                        log::warn!("File not found: {:?}", &file_path_to_search);
                        Ok(Response::new(StatusCode::NotFound))
                    }
                    Err(e) => Err(e.into()),
                }
            }
        };
    }
}
