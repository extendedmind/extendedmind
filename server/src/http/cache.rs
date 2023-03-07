use axum::body::HttpBody;
use axum::body::{BoxBody, Full};
use axum::http::header;
use axum::http::Method;
use axum::http::{HeaderMap, HeaderValue, StatusCode};
use axum::http::{Request, Response};
use axum::middleware::Next;
use moka::future::Cache;
use std::sync::Arc;
use std::time::Duration;

use crate::common::{is_inline_css, log_access, ResponseCache, ServerState};

// Guesstimate one entry has overhead of six 64bit pointers and 128 bytes of headers
const CACHE_ENTRY_OVERHEAD: u32 = 6 * 8 + 128;

pub fn create_response_cache(
    cache_ttl_sec: Option<u64>,
    cache_tti_sec: Option<u64>,
    cache_max_size: Option<u64>,
) -> Option<ResponseCache> {
    let ttl_sec = cache_ttl_sec?;
    let tti_sec = cache_tti_sec?;
    let max_size = cache_max_size?;
    log::info!(
        "Creating cache with time-to-live: {}s, time-to-idle: {}s and max size: {} bytes",
        &ttl_sec,
        &tti_sec,
        &max_size,
    );

    Some(
        Cache::builder()
            .time_to_live(Duration::from_secs(ttl_sec))
            .time_to_idle(Duration::from_secs(tti_sec))
            .weigher(
                |key: &String, value: &(StatusCode, Vec<u8>, HeaderMap<HeaderValue>)| -> u32 {
                    let len: u64 = key.len().try_into().unwrap_or(u32::MAX) as u64
                        + CACHE_ENTRY_OVERHEAD as u64
                        + value.1.len().try_into().unwrap_or(u32::MAX) as u64;
                    if len > u32::MAX.into() {
                        u32::MAX
                    } else {
                        len as u32
                    }
                },
            )
            .max_capacity(max_size)
            .build(),
    )
}

pub fn get_cache_key(url_path: &str, accept_encoding: &str, inline_css: bool) -> String {
    format!("{} {} {}", url_path, accept_encoding, inline_css)
}

pub async fn cache_middleware<B>(
    axum::extract::State(state): axum::extract::State<Arc<ServerState>>,
    request: Request<B>,
    next: Next<B>,
) -> Response<BoxBody> {
    let url_path: String = request.uri().path().to_string();
    let method = request.method();
    let skip_cache: bool = {
        if method != &Method::GET {
            true
        } else {
            match &state.skip_cache_wildmatch {
                Some(skip_cache_wildmatch) => skip_cache_wildmatch
                    .iter()
                    .find(|wildmatch_path| wildmatch_path.matches(&url_path))
                    .is_some(),
                None => false,
            }
        }
    };
    let cache_key: Option<String> = if skip_cache {
        None
    } else {
        let accept_encoding: String = request
            .headers()
            .get_all(header::ACCEPT_ENCODING)
            .into_iter()
            .map(|header| header.to_str().unwrap_or(""))
            .collect::<Vec<&str>>()
            .join(",")
            .chars()
            .filter(|c| !c.is_whitespace())
            .collect();
        let inline_css = is_inline_css(
            &url_path,
            request.headers().get("Referer"),
            &state.inline_css_wildmatch,
            &state.inline_css_skip_referer_wildmatch,
        );

        Some(get_cache_key(&url_path, &accept_encoding, inline_css))
    };

    let cache = if let Some(cache_key) = &cache_key {
        // Try to find this request from the cache
        let cache = state.cache.clone().unwrap();
        let cached_response = cache.get(&cache_key.clone());
        if let Some((status, body_as_bytes, headers)) = cached_response {
            log::debug!("Cache hit: {}", cache_key);
            let mut response = Response::builder().status(status);
            let response_headers = response.headers_mut().unwrap();
            for header in headers.iter() {
                response_headers.insert(header.0, header.1.into());
            }
            let response = response.body(Full::from(body_as_bytes)).unwrap();
            log_access(
                method,
                &url_path,
                &status.as_u16().to_string(),
                Some("cached"),
            );
            return response.map(axum::body::boxed);
        }
        Some(cache)
    } else {
        None
    };

    // Execute downstream handlers
    let mut response: Response<BoxBody> = next.run(request).await.into();

    if let Some(cache_key) = cache_key {
        let cache = cache.unwrap();
        let status = response.status();
        if !status.is_success() {
            return response;
        }
        log::debug!("Cache_miss: {}", cache_key);

        // Consume the body and headers
        let body = response.body_mut();
        let mut body_as_bytes: Vec<u8> = vec![];
        while let Some(Ok(data)) = body.data().await {
            body_as_bytes.extend(data);
        }
        let headers = response.headers_mut();

        // Insert to cache
        cache
            .insert(cache_key, (status, body_as_bytes.clone(), headers.clone()))
            .await;

        // Re-create the response as the original had to be consumed above
        let mut response = Response::builder().status(status);
        let response_headers = response.headers_mut().unwrap();
        for header in headers.iter() {
            response_headers.insert(header.0, header.1.into());
        }
        let response = response.body(Full::from(body_as_bytes)).unwrap();
        response.map(axum::body::boxed)
    } else {
        // There is no caching for this request, just return the response we got
        log::debug!("Skip cache: {}", url_path);
        response
    }
}
