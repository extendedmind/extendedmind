use axum::body::{Body, Bytes, Full};
use axum::http::{header, HeaderValue, Request, Response, StatusCode};
use mime_guess::Mime;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::{ffi::OsStr, io};
use tokio::fs::File;
use tokio::io::AsyncReadExt;

use crate::common::{is_inline_css, log_access, ServerState};

const CSS_NEEDLE_1: &str = "<link rel=\"stylesheet\" href=\"/";
const CSS_NEEDLE_2: &str = ".css\" rel=\"stylesheet\"";
const CSS_ELEMENT_START: &str = "<style>";
const CSS_ELEMENT_END: &str = "</style>";

impl ServerState {
    async fn get_file_path_from_url_path(&self, url_path: &str) -> Option<PathBuf> {
        let dir = self.static_root_dir.as_ref().unwrap();
        let path = url_path.trim_start_matches('/');
        let mut file_path = dir.clone();
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
        if !file_path_to_search.starts_with(&dir) {
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
            let css_paths = css_paths(&body_as_string);
            let mut inlined_css_body: String = "".to_string();
            let mut last_processed_index = 0;
            for (css_path, element_start_index, element_end_index) in css_paths {
                inlined_css_body += &body_as_string[last_processed_index..element_start_index];
                let css_path = if css_path.starts_with("/") {
                    css_path.to_string()
                } else {
                    // Need to combine the url and path
                    format!(
                        "{}{}",
                        url_path[..url_path.rfind('/').unwrap() + 1].to_string(),
                        css_path
                    )
                };
                let css_file_path = self.get_file_path_from_url_path(&css_path).await.unwrap();
                let mut file = File::open(css_file_path).await.unwrap();
                let mut contents: Vec<u8> = Vec::new();
                file.read_to_end(&mut contents).await.unwrap();
                let css_file_content =
                    html_escape::encode_style(std::str::from_utf8(&contents).unwrap());
                inlined_css_body += CSS_ELEMENT_START;
                inlined_css_body += &css_file_content;
                inlined_css_body += CSS_ELEMENT_END;
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

fn css_paths(html: &str) -> Vec<(String, usize, usize)> {
    let mut css_links: Vec<(usize, &str)> = html
        .match_indices(CSS_NEEDLE_1)
        .map(|val| (val.0, CSS_NEEDLE_1))
        .collect();
    let mut css_links_2 = html
        .match_indices(CSS_NEEDLE_2)
        .map(|val| (val.0, CSS_NEEDLE_2))
        .collect();
    css_links.append(&mut css_links_2);
    css_links.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap());
    let css_links_iter = css_links.iter();
    let mut css_paths: Vec<(String, usize, usize)> = vec![];
    for val in css_links_iter {
        let (path_start_index, path_end_index, element_start_index) = if val.1 == CSS_NEEDLE_1 {
            let element_start_index = val.0;
            let path_start_index = val.0 + CSS_NEEDLE_1.len() - 1;
            let path_end_index =
                path_start_index + html[path_start_index..].find("\"").unwrap_or(0);
            (path_start_index, path_end_index, element_start_index)
        } else if val.1 == CSS_NEEDLE_2 {
            let path_end_index = val.0 + 4;
            let path_start_index = html[..path_end_index].rfind("\"").unwrap_or(0) + 1;
            let element_start_index = html[..path_start_index].rfind("<").unwrap_or(0);
            (path_start_index, path_end_index, element_start_index)
        } else {
            unreachable!();
        };
        let element_end_index = path_end_index + html[path_end_index..].find(">").unwrap_or(0);
        if path_end_index > 0 && element_end_index > 0 {
            css_paths.push((
                html[path_start_index..path_end_index].to_string(),
                element_start_index,
                element_end_index,
            ));
        }
    }
    css_paths
}

pub async fn handle_static_files(
    axum::extract::State(state): axum::extract::State<Arc<ServerState>>,
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_css_paths() {
        let html: &str = "<html>\n\
             <body>\n\
             </body>\n\
             </html>";
        let expected: Vec<(String, usize, usize)> = vec![];
        assert_eq!(css_paths(html), expected);
        let html: &str = "<html>\n\
             <body>\n\
             <link href=\"../_app/test1.css\" rel=\"stylesheet\">
             <link rel=\"stylesheet\" href=\"/_app/test2.css\"/>
             <link href=\"/_app/test3.css\" rel=\"stylesheet\"/>
             <link rel=\"stylesheet\" href=\"/_app/test4.css\"/>
             </body>\n\
             </html>";
        let expected: Vec<(String, usize, usize)> = vec![
            ("../_app/test1.css".to_string(), 14, 61),
            ("/_app/test2.css".to_string(), 76, 122),
            ("/_app/test3.css".to_string(), 137, 183),
            ("/_app/test4.css".to_string(), 198, 244),
        ];
        assert_eq!(css_paths(html), expected);
    }
}
