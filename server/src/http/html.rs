use axum::body::{Body, Bytes, Full};
use axum::http::{header, HeaderValue, Request, Response, StatusCode};
use mime_guess::Mime;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::{ffi::OsStr, io};
use tokio::fs::File;
use tokio::io::AsyncReadExt;
use wildmatch::WildMatch;

use super::cache::ResponseCache;
use crate::common::{is_inline_css, log_access, StaticFilesState};

const CSS_NEEDLE: &str = "<link rel=\"stylesheet\" href=\"/";
const CSS_ELEMENT_START: &str = "<style>";
const CSS_ELEMENT_END: &str = "</style>";

impl StaticFilesState {
    pub fn new(
        prefix: String,
        dir: PathBuf,
        skip_compress_mime: Option<Vec<String>>,
        inline_css_wildmatch: Option<Vec<WildMatch>>,
        inline_css_skip_referer_wildmatch: Option<Vec<WildMatch>>,
        immutable_path: Option<Vec<String>>,
        hsts_max_age: Option<u64>,
        hsts_preload: bool,
        cache: Option<ResponseCache>,
        skip_cache_paths: Option<Vec<String>>,
    ) -> Self {
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

        let skip_cache_wildmatch = match skip_cache_paths {
            Some(skip_cache_path) => Some(
                skip_cache_path
                    .iter()
                    .map(|path| WildMatch::new(path))
                    .collect(),
            ),
            None => None,
        };

        Self {
            prefix,
            dir,
            skip_compress_mime,
            inline_css_wildmatch,
            inline_css_skip_referer_wildmatch,
            immutable_path_wildmatch,
            hsts_max_age,
            hsts_preload,
            cache,
            skip_cache_wildmatch,
        }
    }

    async fn get_file_path_from_url_path(&self, url_path: &str) -> Option<PathBuf> {
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
        let file_path = PathBuf::from(file_path);
        let mut file_path_to_search = file_path;
        if file_path_to_search.extension().is_none() {
            // When a call comes without an extension, search for .html suffix and/or directory with
            // index.html
            let (exists, is_dir): (bool, bool) =
                match tokio::fs::metadata(&file_path_to_search).await {
                    Ok(metadata) => (true, metadata.is_dir()),
                    _ => (false, false),
                };

            log::debug!(
                "{:?}, exists {}, is_dir {}",
                file_path_to_search,
                exists,
                is_dir
            );
            if is_dir {
                let file_path_with_extension =
                    get_path_with_extension(&file_path_to_search, "html");
                if file_path_with_extension.exists() {
                    file_path_to_search = file_path_with_extension;
                } else {
                    file_path_to_search.push("index.html");
                }
            } else if !exists {
                let file_path_with_extension =
                    get_path_with_extension(&file_path_to_search, "html");
                file_path_to_search = file_path_with_extension;
            }
        }

        // NB: Important for security!
        log::debug!("FPTS: {:?}, SD: {:?}", file_path_to_search, self.dir);
        if !file_path_to_search.starts_with(&self.dir) {
            None
        } else {
            Some(file_path_to_search)
        }
    }

    async fn process_body_inlining(
        &self,
        url_path: &str,
        file_path: &PathBuf,
        referer_header_value: Option<&HeaderValue>,
        contents: Vec<u8>,
    ) -> (Vec<u8>, Mime) {
        let mime_type = mime_guess::from_path(file_path).first_or_text_plain();
        if mime_type.essence_str() == "text/html"
            && is_inline_css(
                url_path,
                referer_header_value,
                &self.inline_css_wildmatch,
                &self.inline_css_skip_referer_wildmatch,
            )
        {
            log::debug!("Inlining CSS for path {}", url_path);
            let body_as_string = String::from_utf8(contents).unwrap();
            // Locate styleheet links, only absolute paths are supported for now
            let css_links: Vec<_> = body_as_string.match_indices(CSS_NEEDLE).collect();
            let css_links_iter = css_links.iter();
            let mut inlined_css_body: String = "".to_string();
            let mut last_processed_index = 0;
            for val in css_links_iter {
                let element_start_index = val.0;
                inlined_css_body += &body_as_string[last_processed_index..element_start_index];
                let path_start_index = val.0 + CSS_NEEDLE.len() - 1;
                let path_end_index =
                    path_start_index + body_as_string[path_start_index..].find("\"").unwrap_or(0);
                let element_end_index =
                    path_end_index + body_as_string[path_end_index..].find(">").unwrap_or(0);

                if path_end_index > 0 && element_end_index > 0 {
                    let css_path = &body_as_string[path_start_index..path_end_index];
                    log::debug!("Inlining CSS in path: {}", css_path);
                    let css_file_path = self.get_file_path_from_url_path(css_path).await.unwrap();
                    let mut file = File::open(css_file_path).await.unwrap();
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
            (inlined_css_body.as_bytes().to_vec(), mime_type)
        } else {
            (contents, mime_type)
        }
    }

    fn get_ok_response_from_body(
        &self,
        path: &str,
        contents: Vec<u8>,
        mime_type: Mime,
    ) -> Response<Full<Bytes>> {
        let skip_compression: bool = match &self.skip_compress_mime {
            Some(skip_compress_mime) => {
                skip_compress_mime.contains(&mime_type.essence_str().to_string())
            }
            None => false,
        };
        let immutable_path: bool = match &self.immutable_path_wildmatch {
            Some(immutable_path) => immutable_path
                .iter()
                .find(|wildmatch_path| wildmatch_path.matches(path))
                .is_some(),
            None => false,
        };
        let response = Response::builder()
            .status(StatusCode::OK)
            .header(
                header::CONTENT_TYPE,
                HeaderValue::from_str(mime_type.as_ref()).unwrap(),
            )
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
        let response = if skip_compression {
            response.header("Cache-Control", "no-transform")
        } else {
            if immutable_path {
                response.header("Cache-Control", "public, max-age=604800, immutable")
            } else {
                response
            }
        };
        response.body(Full::from(contents)).unwrap()
    }
}

fn get_path_with_extension(path: &PathBuf, extension: &str) -> PathBuf {
    let mut path_with_extension = path.clone();
    path_with_extension.set_extension(extension);
    return path_with_extension;
}

pub async fn handle_static_files(
    axum::extract::State(state): axum::extract::State<Arc<StaticFilesState>>,
    request: Request<Body>,
) -> Response<Full<Bytes>> {
    let url_path = request.uri().path();
    let method = request.method();
    // Read the file from the file system
    let file_path = state.get_file_path_from_url_path(url_path).await;
    if let Some(file_path) = file_path {
        match File::open(&file_path).await {
            Ok(mut file) => {
                let mut contents = vec![];
                file.read_to_end(&mut contents).await.unwrap();
                let (contents, mime_type) = state
                    .process_body_inlining(
                        &url_path,
                        &file_path,
                        request.headers().get("Referer"),
                        contents,
                    )
                    .await;
                log_access(method, url_path, "200", None);
                state.get_ok_response_from_body(url_path, contents, mime_type)
            }
            Err(e) if e.kind() == io::ErrorKind::NotFound => {
                log_access(method, url_path, "404", None);
                log::info!("File not found: {:?}", &file_path);
                Response::builder()
                    .status(StatusCode::NOT_FOUND)
                    .body(Full::default())
                    .unwrap()
            }
            Err(e) => {
                log_access(method, url_path, "500", None);
                log::warn!("Internal server error for path: {:?}, {:?}", &file_path, e);
                Response::builder()
                    .status(StatusCode::NOT_FOUND)
                    .body(Full::default())
                    .unwrap()
            }
        }
    } else {
        log::warn!("Unauthorized attempt to read: {:?}", url_path);
        log_access(method, url_path, "403", None);
        Response::builder()
            .status(StatusCode::FORBIDDEN)
            .body(Full::default())
            .unwrap()
    }
}
