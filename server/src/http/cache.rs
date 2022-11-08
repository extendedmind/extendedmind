use moka::future::Cache;
use std::time::Duration;
use tide::{
    http::{
        content::{AcceptEncoding, ContentEncoding, Encoding},
        headers::{HeaderName, HeaderValues},
        Method, Mime,
    },
    Body, Middleware, Next, Request, Response, StatusCode,
};
use wildmatch::WildMatch;

use crate::common::{is_inline_css, log_access};

#[derive(Clone)]
pub struct CacheMiddleware {
    cache: Cache<String, (StatusCode, Mime, Vec<u8>, Vec<(HeaderName, HeaderValues)>)>,
    skip_cache_wildmatch: Option<Vec<WildMatch>>,
    inline_css_wildmatch: Option<Vec<WildMatch>>,
    inline_css_skip_domain_wildmatch: Option<Vec<WildMatch>>,
}

pub fn create_cache(
    cache_ttl_sec: Option<u64>,
    cache_tti_sec: Option<u64>,
) -> Option<Cache<String, (StatusCode, Mime, Vec<u8>, Vec<(HeaderName, HeaderValues)>)>> {
    let ttl_sec = cache_ttl_sec?;
    let tti_sec = cache_tti_sec?;
    log::info!(
        "Creating cache with time-to-live: {}s and time-to-idle: {}s",
        &ttl_sec,
        &tti_sec,
    );

    Some(
        Cache::builder()
            .time_to_live(Duration::from_secs(ttl_sec))
            .time_to_idle(Duration::from_secs(tti_sec))
            .build(),
    )
}

impl CacheMiddleware {
    pub fn new(
        prefix: String,
        cache: Cache<String, (StatusCode, Mime, Vec<u8>, Vec<(HeaderName, HeaderValues)>)>,
        skip_cache_path: Option<Vec<String>>,
        inline_css_wildmatch: Option<Vec<WildMatch>>,
        inline_css_skip_domain_wildmatch: Option<Vec<WildMatch>>,
    ) -> Self {
        log::info!("Setting up response cache for path {}", &prefix,);
        let skip_cache_wildmatch = match skip_cache_path {
            Some(skip_cache_path) => Some(
                skip_cache_path
                    .iter()
                    .map(|path| WildMatch::new(path))
                    .collect(),
            ),
            None => None,
        };

        Self {
            cache,
            skip_cache_wildmatch,
            inline_css_wildmatch,
            inline_css_skip_domain_wildmatch,
        }
    }
}

#[tide::utils::async_trait]
impl<State: Clone + Send + Sync + 'static> Middleware<State> for CacheMiddleware {
    async fn handle(&self, req: Request<State>, next: Next<'_, State>) -> tide::Result {
        let url_path: String = req.url().path().to_string();
        let method = &req.method();
        let skip_cache: bool = {
            if method != &Method::Get {
                true
            } else {
                match &self.skip_cache_wildmatch {
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
            let accepts = AcceptEncoding::from_headers(&req)?;

            // This encoding is not necessarily the one that is returned: e.g. AVIF files should
            // not be re-compressed at all, so even though the cache key will se "br", that is not
            // what the body is encoded with..
            let requested_encoding: String = if let Some(mut accepts) = accepts {
                let encoding =
                    accepts.negotiate(&[Encoding::Brotli, Encoding::Gzip, Encoding::Deflate])?;
                encoding.to_string()
            } else {
                "".to_string()
            };
            let inline_css = is_inline_css(
                &url_path,
                req.header("Referer"),
                &self.inline_css_wildmatch,
                &self.inline_css_skip_domain_wildmatch,
            );

            Some(get_cache_key(&url_path, &requested_encoding, inline_css))
        };

        if let Some(cache_key) = &cache_key {
            // Try to find this request from the cache
            let cached_response = &self.cache.get(&cache_key.clone());
            if let Some((status, mime, body_as_bytes, headers)) = cached_response {
                log::debug!("Cache hit: {}", cache_key);
                let mut body = Body::from_bytes(body_as_bytes.to_vec());
                body.set_mime(mime.clone());
                let mut res_builder = Response::builder(status.clone()).body(body);
                for (header_name, header_values) in headers {
                    res_builder = res_builder.header(header_name, header_values);
                }
                log_access(method, &url_path, &status.to_string(), Some("cached"));
                return Ok(res_builder.build());
            }
        }

        let mut res: Response = next.run(req).await;
        if let Some(cache_key) = cache_key {
            let status = res.status();
            if !status.is_success() {
                return Ok(res);
            }

            log::debug!("Cache_miss: {}", cache_key);
            let cache_headers: Vec<(HeaderName, HeaderValues)> = res
                .iter()
                .map(|(header_name, header_values)| (header_name.clone(), header_values.clone()))
                .collect();
            let body = res.take_body();
            let mime = body.mime().clone();
            let body_as_bytes = body.into_bytes().await.unwrap();

            self.cache
                .insert(
                    cache_key,
                    (status, mime.clone(), body_as_bytes.clone(), cache_headers),
                )
                .await;
            let mut body = Body::from_bytes(body_as_bytes);
            body.set_mime(mime.clone());
            res.set_body(body);
            Ok(res)
        } else {
            // There is no caching for this request, just return the response we got
            log::debug!("Skip cache: {}", url_path);
            Ok(res)
        }
    }
}

fn get_cache_key(url_path: &str, requested_encoding: &str, inline_css: bool) -> String {
    format!("{} {} {}", url_path, requested_encoding, inline_css)
}
