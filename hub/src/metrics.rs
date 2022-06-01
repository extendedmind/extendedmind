use std::collections::HashMap;
use std::ffi::OsStr;
use std::fs::{read_dir, File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use std::thread;
use std::time;
use thread_priority::{set_current_thread_priority, ThreadPriority};

// This is the number of characters taken from timestamp to create new metrics file. E.g.
// from "2022-05-30_17.06.03", 13 means "2022-05-30.metrics".
const DEFAULT_METRICS_FILE_PRECISION: u8 = 10;

// The default time to sleep when trying to refresh metrics
const DEFAULT_METRICS_INTERVAL_SECONDS: u64 = 10;

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
                let stem: String = path
                    .file_stem()
                    .unwrap()
                    .to_os_string()
                    .into_string()
                    .unwrap();
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

                // TODO: Lue jotenkin näin se sisältö HashMappiin, lue sitten rivi kerrallaan
                // sisään edellinen metrics-tiedosto, ja samalla kun looppaa, vaihda arvot,
                // poista avain hashmapistä, ja lopuksi lisää pohjalle kaikki loput arvot, ja
                // vaihda .state arvo oikeaan.
                //
                // let mut reader = BufReader::new(metrics_state_file);
                // let mut previous_path = String::new();
                // reader.read_line(&mut previous_path).unwrap();
            }

            thread::sleep(sleep_duration);
        }
    });
}

fn trim_newline(s: &str) -> String {
    if s.ends_with('\n') {
        s[0..s.len() - 1].to_string()
    } else {
        s.to_string()
    }
}
