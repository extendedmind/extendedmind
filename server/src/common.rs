use std::{path::PathBuf, time::Duration};

use axum::http::{HeaderMap, HeaderValue, Method, StatusCode};
use extendedmind_hub::extendedmind_core::{FeedDiskPersistence, Peermerge, RandomAccessDisk};
use moka::future::Cache;
use serde::Serialize;
use wildmatch::WildMatch;

pub type ResponseCache = Cache<String, (StatusCode, Vec<u8>, HeaderMap<HeaderValue>)>;

// Identifies that the log entry belongs in the access log. Needs to be separate from actual paths,
// hence the space.
pub const ACCESS_LOG_IDENTIFIER: &str = "GET _";

// The default time to sleep when trying to refresh metrics
pub const DEFAULT_METRICS_INTERVAL_SECONDS: u64 = 60;

pub const WEBSOCKET_PATH: &str = "/extendedmind/peermerge";

/// Use a single state for the entire server that is wrapped in an Arc for cheap cloning.
#[derive(Clone, Debug)]
pub struct ServerState {
    pub peermerge: Peermerge<RandomAccessDisk, FeedDiskPersistence>,
    pub static_root_dir: Option<PathBuf>,
    pub skip_compress_mime: Option<Vec<String>>,
    pub inline_css_wildmatch: Option<Vec<WildMatch>>,
    pub inline_css_skip_referer_wildmatch: Option<Vec<WildMatch>>,
    pub immutable_path_wildmatch: Option<Vec<WildMatch>>,
    pub hsts_max_age: Option<u64>,
    pub hsts_preload: bool,
    pub skip_cache_wildmatch: Option<Vec<WildMatch>>,
    pub cache: Option<ResponseCache>,
    pub metrics_state: Option<MetricsState>,
}

impl ServerState {
    pub fn new(
        peermerge: Peermerge<RandomAccessDisk, FeedDiskPersistence>,
        static_root_dir: Option<PathBuf>,
        skip_compress_mime: Option<Vec<String>>,
        inline_css_wildmatch: Option<Vec<WildMatch>>,
        inline_css_skip_referer_wildmatch: Option<Vec<WildMatch>>,
        immutable_path: Option<Vec<String>>,
        hsts_max_age: Option<u64>,
        hsts_preload: bool,
        cache: Option<ResponseCache>,
        skip_cache_paths: Option<Vec<String>>,
        metrics_state: Option<MetricsState>,
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
            peermerge,
            static_root_dir,
            skip_compress_mime,
            inline_css_wildmatch,
            inline_css_skip_referer_wildmatch,
            immutable_path_wildmatch,
            hsts_max_age,
            hsts_preload,
            cache,
            skip_cache_wildmatch,
            metrics_state,
        }
    }
}

#[derive(Debug, Clone)]
pub struct MetricsState {
    pub metrics_endpoint: String,
    pub metrics_dir: PathBuf,
    pub metrics_secret: Option<String>,
    pub cache: Cache<String, MetricsResponse>,
    pub skip_compression: bool,
}

#[derive(Serialize, Debug, Clone)]
pub struct MetricsResponse {
    pub start: String,
    pub end: String,
    pub metrics: Vec<MetricsRange>,
}

#[derive(Serialize, Debug, Clone)]
pub struct MetricsRange {
    pub start: String,
    pub end: String,
    pub entries: Vec<MetricsEntry>,
}

#[derive(Serialize, Debug, Clone)]
pub struct MetricsEntry {
    pub path: String,
    pub status: usize,
    pub count: usize,
    pub immutable: bool,
}

impl MetricsState {
    pub fn new(
        metrics_endpoint: String,
        metrics_dir: PathBuf,
        metrics_secret: Option<String>,
        skip_compression: bool,
    ) -> Self {
        let cache_ttl_sec = DEFAULT_METRICS_INTERVAL_SECONDS;
        log::info!(
            "Setting up cache for metrics endpoint at {} with time-to-live: {}s",
            &metrics_endpoint,
            &cache_ttl_sec,
        );
        let cache = Cache::builder()
            .time_to_live(Duration::from_secs(cache_ttl_sec))
            .build();

        Self {
            metrics_endpoint,
            metrics_dir,
            metrics_secret,
            cache,
            skip_compression,
        }
    }
}

pub fn log_access(method: &Method, url_path: &str, code: &str, extra: Option<&str>) {
    if method == Method::GET {
        log::info!(
            "{} {} {} {}",
            crate::common::ACCESS_LOG_IDENTIFIER,
            code,
            &url_path,
            extra.unwrap_or("")
        );
    } else {
        log::debug!("{} {} {} {}", method, code, &url_path, extra.unwrap_or(""));
    }
}

pub fn is_inline_css(
    url_path: &str,
    referer_header_value: Option<&HeaderValue>,
    inline_css_wildmatch: &Option<Vec<WildMatch>>,
    inline_css_skip_referer_wildmatch: &Option<Vec<WildMatch>>,
) -> bool {
    let inline_path = match inline_css_wildmatch {
        Some(inline_css_wildmatch) => inline_css_wildmatch
            .iter()
            .find(|wildmatch_path| wildmatch_path.matches(url_path))
            .is_some(),
        None => false,
    };
    let skip_domain = if inline_path {
        match inline_css_skip_referer_wildmatch {
            Some(inline_css_skip_referer_wildmatch) => inline_css_skip_referer_wildmatch
                .iter()
                .find(|referer| {
                    if let Some(referer_header_value) = referer_header_value {
                        referer.matches(referer_header_value.to_str().unwrap())
                    } else {
                        false
                    }
                })
                .is_some(),
            None => false,
        }
    } else {
        false
    };

    return inline_path && !skip_domain;
}
