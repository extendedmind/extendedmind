use async_std::channel::Receiver;
use extendedmind_hub::extendedmind_engine::{Bytes, Engine, RandomAccessDisk};
use std::io;
use tide::http::{headers::HeaderValues, Method};
use wildmatch::WildMatch;

// Identifies that the log entry belongs in the access log. Needs to be separate from actual paths,
// hence the space.
pub const ACCESS_LOG_IDENTIFIER: &str = "GET _";
pub const DEFAULT_ADMIN_SOCKET_FILE: &str = "/var/run/extendedmind_server.sock";

#[derive(derivative::Derivative)]
#[derivative(Clone(bound = ""))]
pub struct State {
    // Engine
    pub engine: Engine<RandomAccessDisk>,
    // System command receiver
    pub system_commands: Receiver<Result<Bytes, io::Error>>,
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
