use async_std::io::ReadExt;
use async_std::path::PathBuf as AsyncPathBuf;
use std::path::{Path, PathBuf};
use std::{ffi::OsStr, io};
use tide::http::mime::Mime;
use tide::{Body, Endpoint, Request, Response, Result, StatusCode};
use wildmatch::WildMatch;

use crate::common::log_access;

const CSS_NEEDLE: &str = "<link rel=\"stylesheet\" href=\"/";
const CSS_ELEMENT_START: &str = "<style>";
const CSS_ELEMENT_END: &str = "</style>";

#[derive(Clone)]
pub struct ServeStaticFiles {
    prefix: String,
    dir: PathBuf,
    skip_compress_mime: Option<Vec<String>>,
    inline_css_wildmatch: Option<Vec<WildMatch>>,
    immutable_path_wildmatch: Option<Vec<WildMatch>>,
    hsts_max_age: Option<u64>,
    hsts_preload: bool,
}

impl ServeStaticFiles {
    pub fn new(
        prefix: String,
        dir: PathBuf,
        skip_compress_mime: Option<Vec<String>>,
        inline_css_path: Option<Vec<String>>,
        immutable_path: Option<Vec<String>>,
        hsts_max_age: Option<u64>,
        hsts_preload: bool,
    ) -> Self {
        if let Some(paths) = &inline_css_path {
            log::info!("Inlining CSS for paths {:?}", &paths);
        }
        let inline_css_wildmatch = match inline_css_path {
            Some(inline_css_path) => Some(
                inline_css_path
                    .iter()
                    .map(|path| WildMatch::new(path))
                    .collect(),
            ),
            None => None,
        };

        if let Some(paths) = &immutable_path {
            log::info!("Using immutable response headers for paths {:?}", &paths);
        }

        let immutable_path_wildmatch = match immutable_path {
            Some(immutable_path) => Some(
                immutable_path
                    .iter()
                    .map(|path| WildMatch::new(path))
                    .collect(),
            ),
            None => None,
        };

        if let Some(max_age) = hsts_max_age {
            log::info!(
                "Setting HSTS max-age to: {}, {}",
                &max_age,
                if hsts_preload {
                    "preloading"
                } else {
                    "not preloading"
                }
            );
        }

        Self {
            prefix,
            dir,
            skip_compress_mime,
            inline_css_wildmatch,
            immutable_path_wildmatch,
            hsts_max_age,
            hsts_preload,
        }
    }

    async fn get_file_path_from_url_path(&self, url_path: &str) -> Option<AsyncPathBuf> {
        let path = url_path
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

        // NB: Important for security!
        if !file_path_to_search.starts_with(&self.dir) {
            None
        } else {
            Some(file_path_to_search)
        }
    }

    async fn process_body_inlining(&self, path: &str, body: Body) -> Body {
        let mime = body.mime().clone();
        if mime.essence() == "text/html" {
            let inline_css: bool = match &self.inline_css_wildmatch {
                Some(inline_css_wildmatch) => inline_css_wildmatch
                    .iter()
                    .find(|wildmatch_path| wildmatch_path.matches(path))
                    .is_some(),
                None => false,
            };
            if inline_css {
                log::debug!("Inlining CSS for path {}", path);
                let body_as_string = body.into_string().await.unwrap();
                // Locate styleheet links, only absolute paths are supported for now
                let css_links: Vec<_> = body_as_string.match_indices(CSS_NEEDLE).collect();
                let css_links_iter = css_links.iter();
                let mut inlined_css_body: String = "".to_string();
                let mut last_processed_index = 0;
                for val in css_links_iter {
                    let element_start_index = val.0;
                    inlined_css_body += &body_as_string[last_processed_index..element_start_index];
                    let path_start_index = val.0 + CSS_NEEDLE.len() - 1;
                    let path_end_index = path_start_index
                        + body_as_string[path_start_index..].find("\"").unwrap_or(0);
                    let element_end_index =
                        path_end_index + body_as_string[path_end_index..].find(">").unwrap_or(0);

                    if path_end_index > 0 && element_end_index > 0 {
                        let css_path = &body_as_string[path_start_index..path_end_index];
                        log::debug!("Inlining CSS in path: {}", css_path);
                        let css_file_path =
                            self.get_file_path_from_url_path(css_path).await.unwrap();
                        let mut file = async_std::fs::File::open(css_file_path).await.unwrap();
                        let mut contents: Vec<u8> = Vec::new();
                        file.read_to_end(&mut contents).await.unwrap();
                        let css_file_content =
                            html_escape::encode_style(std::str::from_utf8(&contents).unwrap());
                        inlined_css_body += CSS_ELEMENT_START;
                        inlined_css_body += &css_file_content;
                        inlined_css_body += CSS_ELEMENT_END;
                    } else {
                        // Something went wrong, just add the element like it is to the string
                        inlined_css_body += &body_as_string[element_start_index..element_end_index];
                    }
                    last_processed_index = element_end_index + 1;
                }

                // Add all of the rest to the value
                inlined_css_body += &body_as_string[last_processed_index..];

                let mut body = Body::from_string(inlined_css_body);
                body.set_mime(mime);
                return body;
            }
        }
        body
    }

    fn get_ok_response_from_body(
        &self,
        path: &str,
        body_as_bytes: Vec<u8>,
        mime: Mime,
    ) -> Response {
        let mut body = Body::from_bytes(body_as_bytes);
        body.set_mime(mime.clone());
        let skip_compression: bool = match &self.skip_compress_mime {
            Some(skip_compress_mime) => skip_compress_mime.contains(&mime.essence().to_string()),
            None => false,
        };
        let immutable_path: bool = match &self.immutable_path_wildmatch {
            Some(immutable_path) => immutable_path
                .iter()
                .find(|wildmatch_path| wildmatch_path.matches(path))
                .is_some(),
            None => false,
        };
        let response = Response::builder(StatusCode::Ok)
            .body(body)
            .header("Permissions-Policy", "browsing-topics=()");
        let response = match &self.hsts_max_age {
            Some(hsts_max_age) => {
                let mut value = format!("max-age={}; includeSubDomains", hsts_max_age);
                if self.hsts_preload {
                    value += "; preload";
                }
                response.header("Strict-Transport-Security", value)
            }
            None => response,
        };
        if skip_compression {
            response.header("Cache-Control", "no-transform").build()
        } else {
            if immutable_path {
                response
                    .header("Cache-Control", "public, max-age=604800, immutable")
                    .build()
            } else {
                response.build()
            }
        }
    }

    fn get_path_with_extension(path: &AsyncPathBuf, extension: &str) -> AsyncPathBuf {
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
        let url_path = &req.url().path();
        // Read the file from the file system
        let file_path = self.get_file_path_from_url_path(url_path).await;
        if file_path.is_none() {
            log::warn!("Unauthorized attempt to read: {:?}", url_path);
            log_access(url_path, "403", None);
            Ok(Response::new(StatusCode::Forbidden))
        } else {
            let file_path = file_path.unwrap();
            match Body::from_file(&file_path).await {
                Ok(body) => {
                    let body = self.process_body_inlining(&url_path, body).await;
                    // For some reason this does not work by default, so add it here
                    let mime = if file_path.extension() == Some(OsStr::new("atom")) {
                        Mime::from("application/atom+xml")
                    } else {
                        body.mime().clone()
                    };
                    let body_as_bytes = body.into_bytes().await.unwrap();
                    log_access(url_path, "200", None);
                    Ok(self.get_ok_response_from_body(url_path, body_as_bytes, mime))
                }
                Err(e) if e.kind() == io::ErrorKind::NotFound => {
                    log_access(url_path, "404", None);
                    log::info!("File not found: {:?}", &file_path);
                    Ok(Response::new(StatusCode::NotFound))
                }
                Err(e) => Err(e.into()),
            }
        }
    }
}
