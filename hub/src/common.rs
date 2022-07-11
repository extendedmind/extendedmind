use async_std::channel::{Receiver, Sender};
use extendedmind_engine::{Bytes, Engine, RandomAccessDisk};
use std::{io, path::PathBuf};
use tide::http::{headers::HeaderValues, Method};
use wildmatch::WildMatch;

// Identifies that the log entry belongs in the access log. Needs to be separate from actual paths,
// hence the space.
pub const ACCESS_LOG_IDENTIFIER: &str = "GET _";

// Use UTC time, and format that is simple to use as a file name
pub const TIMESTAMP_SECONDS_FORMAT: &str = "%Y-%m-%d_%H.%M.%S";
pub const TIMESTAMP_SECONDS_FORMAT_LEN: usize = 19;
pub const TIMESTAMP_MINUTES_FORMAT: &str = "%Y-%m-%d_%H.%M";
pub const TIMESTAMP_DAYS_FORMAT: &str = "%Y-%m-%d";
pub const DEFAULT_ADMIN_SOCKET_FILE: &str = "/var/run/extendedmind_hub.sock";

#[derive(Clone, Copy)]
#[repr(u8)]
pub enum SystemCommand {
    WakeUp = 1,
    Disconnect = 2,
}

#[derive(derivative::Derivative)]
#[derivative(Clone(bound = ""))]
pub struct State {
    // Engine
    pub engine: Engine<RandomAccessDisk>,
    // System command receiver
    pub system_commands: Receiver<Result<Bytes, io::Error>>,
}

pub type ChannelSenderReceiver = (
    Sender<Result<Bytes, io::Error>>,
    Receiver<Result<Bytes, io::Error>>,
);

pub fn get_stem_from_path(path: &PathBuf) -> String {
    path.file_stem()
        .unwrap()
        .to_os_string()
        .into_string()
        .unwrap()
}

pub fn log_access(method: &Method, url_path: &str, code: &str, extra: Option<&str>) {
    // This value should be
    if method == &Method::Get {
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
    referer_header_value: Option<&HeaderValues>,
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
                        let referer_header_value = &referer_header_value[0].to_string();
                        referer.matches(referer_header_value)
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
