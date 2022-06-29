use chrono::prelude::*;
use moka::future::Cache;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::convert::TryInto;
use std::ffi::OsStr;
use std::fs::{read_dir, File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use std::thread;
use std::time;
use std::time::Duration;
use thread_priority::{set_current_thread_priority, ThreadPriority};
use wildmatch::WildMatch;

use crate::common::{
    get_stem_from_path, TIMESTAMP_DAYS_FORMAT, TIMESTAMP_MINUTES_FORMAT, TIMESTAMP_SECONDS_FORMAT,
};

// This is the number of characters taken from timestamp to create new metrics file. E.g.
// from "2022-05-30_17.06.03", 13 means "2022-05-30.metrics".
const DEFAULT_METRICS_FILE_PRECISION: u8 = 10;

// The default time to sleep when trying to refresh metrics
const DEFAULT_METRICS_INTERVAL_SECONDS: u64 = 10;

// Show 30 by default, maps to showing one month with DEFAULT_METRICS_FILE_PRECISION
const DEFAULT_METRICS_LIMIT: usize = 30;

pub fn process_metrics(metrics_dir: PathBuf, metrics_precision: Option<u8>, log_dir: PathBuf) {
    thread::spawn(move || {
        set_current_thread_priority(ThreadPriority::Min).unwrap();
        let metrics_precision = metrics_precision.unwrap_or(DEFAULT_METRICS_FILE_PRECISION);
        let sleep_duration = time::Duration::from_secs(DEFAULT_METRICS_INTERVAL_SECONDS);

        // Read in the last file checked
        let metrics_state_file_path = metrics_dir.join(".state");

        loop {
            log::debug!(
                "Attempting metrics collection to {}",
                metrics_dir.to_str().unwrap()
            );

            let metrics_state_file: Option<File> = OpenOptions::new()
                .read(true)
                .open(&metrics_state_file_path)
                .map_or(None, |file| Some(file));
            let state: (String, usize) = if let Some(metrics_state_file) = metrics_state_file {
                let mut state_reader = BufReader::new(metrics_state_file);
                let mut state = String::new();
                state_reader.read_line(&mut state).unwrap();
                let split = state.split(" ");
                let state_split: Vec<&str> = split.collect();
                let state_path = state_split[0].to_string();
                let state_count_str = trim_newline(state_split[1]);
                (state_path, state_count_str.parse::<usize>().unwrap())
            } else {
                ("".to_string(), 0)
            };
            let mut paths = read_dir(log_dir.to_str().unwrap())
                .unwrap()
                .map(|res| res.map(|e| e.path()))
                .filter(|path| {
                    if let Ok(path) = path {
                        return path.is_file()
                            && path.extension() == Some(OsStr::new("log"))
                            && path.to_str().unwrap().to_string() >= state.0;
                    }
                    false
                })
                .collect::<Result<Vec<_>, std::io::Error>>()
                .unwrap();
            paths.sort();

            for path in paths {
                let stem: String = get_stem_from_path(&path);
                if stem.len() <= metrics_precision.into() {
                    log::warn!(
                        "Log file {} has too low precision, needs at least {}",
                        path.to_str().unwrap(),
                        metrics_precision + 1
                    );
                    continue;
                }

                let start_line_index: usize = if path.to_str().unwrap() == state.0 {
                    state.1 + 1
                } else {
                    0
                };
                let mut log_map: HashMap<String, usize> = HashMap::new();

                let log_file = File::open(&path).unwrap();
                let log_reader = BufReader::new(log_file);
                let mut last_processed_index: usize = 0;
                for (i, line) in log_reader.lines().enumerate() {
                    let line = line.unwrap();
                    if i >= start_line_index {
                        let split = line.split(" ");
                        let log: Vec<&str> = split.collect();
                        let key = format!("{} {}", log[1], trim_newline(log[2]));
                        if log.len() < 3 {
                            // If the line is shorter, it might be that it is being written ATM
                            log::warn!("Malformed log line: {}", &line);
                        } else if log_map.contains_key(&key) {
                            let new_count: usize = log_map.get(&key).unwrap() + 1;
                            log_map.insert(key, new_count);
                        } else {
                            log_map.insert(key, 1);
                        }
                        last_processed_index = i;
                    }
                }

                if !log_map.is_empty() {
                    log::debug!(
                        "Found (partially) unprocessed log file {}",
                        path.to_str().unwrap(),
                    );
                    let metrics_file_name: String =
                        stem[0..metrics_precision.into()].to_string() + ".metrics";
                    let metrics_file_tmp_name: String = format!("{}.tmp", &metrics_file_name);
                    let metrics_file_path = metrics_dir.join(&metrics_file_name);
                    let metrics_file_tmp_path = metrics_dir.join(metrics_file_tmp_name);
                    let metrics_file: Option<File> = OpenOptions::new()
                        .read(true)
                        .open(&metrics_file_path)
                        .map_or(None, |file| Some(file));

                    let mut metrics_file_tmp: File = OpenOptions::new()
                        .create(true)
                        .append(true)
                        .open(&metrics_file_tmp_path)
                        .unwrap();

                    // Read in existing and append to them
                    if let Some(metrics_reader) =
                        metrics_file.as_ref().map(|file| BufReader::new(file))
                    {
                        for line in metrics_reader.lines() {
                            let line = line.unwrap();
                            let split = line.split(" ");
                            let metric: Vec<&str> = split.collect();
                            if metric.len() < 3 {
                                log::warn!(
                                    "Malformed metric line: '{}' in file {}",
                                    &line,
                                    &metrics_file_name
                                );
                                continue;
                            }
                            let key = format!("{} {}", metric[0], metric[1]);
                            let existing_count_str = trim_newline(metric[2]);
                            let existing_count = existing_count_str.parse::<usize>().unwrap();

                            if let Some(additional_count) = log_map.get(&key) {
                                let new_line =
                                    format!("{} {}\n", key, existing_count + additional_count);
                                metrics_file_tmp.write_all(new_line.as_bytes()).unwrap();
                                log_map.remove(&key);
                            } else {
                                metrics_file_tmp
                                    .write_all((line + "\n").as_bytes())
                                    .unwrap();
                            }
                        }
                    }

                    // Write out new lines
                    for (key, count) in log_map {
                        let new_line = format!("{} {}\n", key, count);
                        metrics_file_tmp.write_all(new_line.as_bytes()).unwrap();
                    }

                    // Finally delete old metrics file, rename tmp, and change state
                    if metrics_file.is_some() {
                        std::fs::remove_file(&metrics_file_path).unwrap();
                    };
                    std::fs::rename(metrics_file_tmp_path, metrics_file_path).unwrap();
                    let mut metrics_state_file = std::fs::OpenOptions::new()
                        .create(true)
                        .write(true)
                        .truncate(true)
                        .open(&metrics_state_file_path)
                        .unwrap();
                    metrics_state_file
                        .write_all(
                            format!("{} {}\n", &path.to_str().unwrap(), last_processed_index)
                                .as_bytes(),
                        )
                        .unwrap();
                }
            }
            thread::sleep(sleep_duration);
        }
    });
}

#[derive(Serialize, Clone)]
struct MetricsResponse {
    start: String,
    end: String,
    metrics: Vec<MetricsRange>,
}

#[derive(Serialize, Clone)]
struct MetricsRange {
    start: String,
    end: String,
    entries: Vec<MetricsEntry>,
}

#[derive(Serialize, Clone)]
struct MetricsEntry {
    path: String,
    status: usize,
    count: usize,
    immutable: bool,
}

#[derive(Clone)]
pub struct ProduceMetrics {
    metrics_dir: PathBuf,
    metrics_secret: Option<String>,
    immutable_path_wildmatch: Option<Vec<WildMatch>>,
    cache: Cache<String, MetricsResponse>,
}

impl ProduceMetrics {
    pub fn new(
        metrics_endpoint: String,
        metrics_dir: PathBuf,
        metrics_secret: Option<String>,
        immutable_path: Option<Vec<String>>,
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

        let immutable_path_wildmatch = match immutable_path {
            Some(immutable_path) => Some(
                immutable_path
                    .iter()
                    .map(|path| WildMatch::new(path))
                    .collect(),
            ),
            None => None,
        };

        Self {
            metrics_dir,
            metrics_secret,
            immutable_path_wildmatch,
            cache,
        }
    }

    fn get_metrics_response_from_cache(&self, query: String) -> Option<MetricsResponse> {
        self.cache.get(&query)
    }

    async fn insert_metrics_response_to_cache(
        &self,
        query: String,
        metrics_response: MetricsResponse,
    ) {
        self.cache.insert(query, metrics_response).await
    }
}

#[derive(Deserialize, Debug, Clone)]
struct MetricsParams {
    limit: Option<usize>,
    secret: Option<String>,
}

impl Default for MetricsParams {
    fn default() -> Self {
        MetricsParams {
            limit: None,
            secret: None,
        }
    }
}

#[async_trait::async_trait]
impl<State> tide::Endpoint<State> for ProduceMetrics
where
    State: Clone + Send + Sync + 'static,
{
    async fn call(&self, req: tide::Request<State>) -> tide::Result {
        let MetricsParams { limit, secret } = req.query().unwrap_or_default();
        let correct_secret = if let Some(metrics_secret) = &self.metrics_secret {
            if let Some(secret) = secret {
                secret.eq(metrics_secret)
            } else {
                false
            }
        } else {
            false
        };
        let limit: usize = if let Some(limit) = limit {
            if correct_secret {
                limit
            } else {
                DEFAULT_METRICS_LIMIT
            }
        } else {
            DEFAULT_METRICS_LIMIT
        };
        let query = format!("limit={}&correct_secret={}", limit, correct_secret);
        let url_path = &req.url().path();
        let cached_metrics_response = self.get_metrics_response_from_cache(query.clone());
        return if let Some(cached_metrics_response) = cached_metrics_response {
            // The body for the URL was found from the cache, return it without any file IO
            log::debug!("Metrics cache hit: {}", &url_path);
            let body = tide::Body::from_json(&cached_metrics_response).unwrap();
            Ok(tide::Response::builder(200).body(body).build())
        } else {
            // Read the file from the file system
            log::debug!("Metrics cache miss: {}", &url_path);

            let mut paths = read_dir(self.metrics_dir.to_str().unwrap())
                .unwrap()
                .map(|res| res.map(|e| e.path()))
                .filter(|path| {
                    if let Ok(path) = path {
                        return path.is_file() && path.extension() == Some(OsStr::new("metrics"));
                    }
                    false
                })
                .collect::<Result<Vec<_>, std::io::Error>>()
                .unwrap();
            paths.sort();

            let end_timestamp = get_timestamp_diff(&get_stem_from_path(&paths[paths.len() - 1]), 1);
            let limit: i64 = limit.try_into().unwrap();
            let start_timestamp = get_timestamp_diff(&end_timestamp, limit * -1);

            let mut metrics: Vec<MetricsRange> = vec![];
            for path in paths {
                let stem = get_stem_from_path(&path);
                if stem >= start_timestamp {
                    let mut entries: Vec<MetricsEntry> = vec![];
                    let metrics_file = File::open(&path).unwrap();
                    let metrics_reader = BufReader::new(metrics_file);
                    for line in metrics_reader.lines() {
                        let line = line.unwrap();
                        let split = line.split(" ");
                        let metric: Vec<&str> = split.collect();
                        let status = metric[0].parse::<usize>().unwrap();
                        let url_path: String = metric[1].to_string();
                        let count = trim_newline(metric[2]).parse::<usize>().unwrap();
                        let immutable: bool = match &self.immutable_path_wildmatch {
                            Some(immutable_path) => immutable_path
                                .iter()
                                .find(|wildmatch_path| wildmatch_path.matches(&url_path))
                                .is_some(),
                            None => false,
                        };
                        if correct_secret || (!immutable && status == 200) {
                            entries.push(MetricsEntry {
                                path: url_path,
                                status,
                                count,
                                immutable,
                            })
                        }
                    }
                    metrics.push(MetricsRange {
                        end: get_timestamp_diff(&stem, 1),
                        start: stem,
                        entries,
                    })
                }
            }

            let metrics_response: MetricsResponse = MetricsResponse {
                start: start_timestamp,
                end: end_timestamp,
                metrics,
            };

            self.insert_metrics_response_to_cache(query, metrics_response.clone())
                .await;

            let body = tide::Body::from_json(&metrics_response).unwrap();
            Ok(tide::Response::builder(200).body(body).build())
        };
    }
}

fn get_timestamp_diff(timestamp: &str, delta: i64) -> String {
    match timestamp.len() {
        10 => {
            let diff_date = Utc
                .datetime_from_str(
                    format!("{}_00.00.00", &timestamp).as_str(),
                    TIMESTAMP_SECONDS_FORMAT,
                )
                .unwrap();
            let diff = diff_date + chrono::Duration::days(delta);
            diff.format(TIMESTAMP_DAYS_FORMAT).to_string()
        }
        16 => {
            let diff_date = Utc
                .datetime_from_str(
                    format!("{}.00", &timestamp).as_str(),
                    TIMESTAMP_SECONDS_FORMAT,
                )
                .unwrap();
            let diff = diff_date + chrono::Duration::minutes(delta);
            diff.format(TIMESTAMP_MINUTES_FORMAT).to_string()
        }
        // TODO: Rest of the accepted precisions
        _ => "".to_string(),
    }
}

fn trim_newline(s: &str) -> String {
    if s.ends_with('\n') {
        s[0..s.len() - 1].to_string()
    } else {
        s.to_string()
    }
}
