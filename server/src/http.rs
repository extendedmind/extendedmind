// use crate::{
//     common::State,
//     metrics::ProduceMetrics,
//     opts::{HttpOpts, MetricsOpts, PerformanceOpts},
// };
// use anyhow::Result;
// use moka::future::Cache;
// use tide::{
//     http::{
//         headers::{HeaderName, HeaderValues},
//         Mime,
//     },
//     Redirect, Request, StatusCode,
// };
// use tide_compress::CompressMiddleware;
// use tide_websockets::WebSocket;
// use wildmatch::WildMatch;

// mod websocket;
// use websocket::handle_peermerge;
// mod html;
// use html::ServeStaticFiles;
// mod cache;
// pub use cache::create_cache;
// use cache::CacheMiddleware;
mod html;
pub mod serve;

// pub fn http_main_server(
//     initial_state: State,
//     cache: Option<Cache<String, (StatusCode, Mime, Vec<u8>, Vec<(HeaderName, HeaderValues)>)>>,
//     http_opts: HttpOpts,
//     metrics_opts: MetricsOpts,
//     performance_opts: PerformanceOpts,
// ) -> Result<tide::Server<State>> {
//     let skip_compress_mime = performance_opts.skip_compress_mime.clone();
//     let mut app = tide::with_state(initial_state);
//     let inline_css_wildmatch = match performance_opts.inline_css_path {
//         Some(inline_css_path) => {
//             log::info!("Inlining CSS for paths {:?}", &inline_css_path);
//             Some(
//                 inline_css_path
//                     .iter()
//                     .map(|path| WildMatch::new(path))
//                     .collect(),
//             )
//         }
//         None => None,
//     };
//     let inline_css_skip_referer_wildmatch = match performance_opts.inline_css_skip_referer {
//         Some(inline_css_skip_referer) => {
//             log::info!(
//                 "Skip inlining CSS for Referer header url {:?}",
//                 &inline_css_skip_referer
//             );
//             Some(
//                 inline_css_skip_referer
//                     .iter()
//                     .map(|referer| WildMatch::new(referer))
//                     .collect(),
//             )
//         }
//         None => None,
//     };

//     let metrics_skip_compress: bool = metrics_opts.metrics_skip_compress.unwrap_or(false)
//         || match &skip_compress_mime {
//             Some(skip_compress_mime) => {
//                 skip_compress_mime.contains(&"application/json".to_string())
//             }
//             None => false,
//         };

//     if let Some(static_root_dir) = http_opts.static_root_dir {
//         let index_path = static_root_dir.join("index.html");

//         let serve_static_files = ServeStaticFiles::new(
//             "*".to_string(),
//             static_root_dir,
//             skip_compress_mime,
//             inline_css_wildmatch.clone(),
//             inline_css_skip_referer_wildmatch.clone(),
//             performance_opts.immutable_path.clone(),
//             http_opts.hsts_max_age,
//             http_opts.hsts_preload.unwrap_or(false),
//         );
//         if index_path.exists() {
//             app.at("").get(serve_static_files.clone());
//         }
//         app.at("*").get(serve_static_files);
//     }

//     let skip_cache_path: Option<Vec<String>> =
//         if let Some(metrics_endpoint) = metrics_opts.metrics_endpoint {
//             if let Some(metrics_dir) = metrics_opts.metrics_dir {
//                 app.at(&metrics_endpoint).get(ProduceMetrics::new(
//                     metrics_endpoint.clone(),
//                     metrics_dir,
//                     metrics_opts.metrics_secret,
//                     performance_opts.immutable_path,
//                     metrics_skip_compress,
//                 ));
//                 Some(vec![metrics_endpoint])
//             } else {
//                 None
//             }
//         } else {
//             None
//         };

//     app.at("/extendedmind/peermerge")
//         .get(WebSocket::new(handle_peermerge));

//     if let Some(cache) = cache {
//         app.with(CacheMiddleware::new(
//             "*".to_string(),
//             cache,
//             skip_cache_path,
//             inline_css_wildmatch,
//             inline_css_skip_referer_wildmatch,
//         ));
//     }
//     app.with(CompressMiddleware::new());

//     return Ok(app);
// }

// /// The shared application state.
// #[derive(Clone)]
// pub struct RedirectState {
//     redirect_to_url: String,
//     permanent: bool,
// }

// pub fn http_redirect_server(
//     redirect_to_url: &str,
//     permanent: bool,
// ) -> Result<tide::Server<RedirectState>> {
//     let mut app = tide::with_state(RedirectState {
//         redirect_to_url: redirect_to_url.to_string(),
//         permanent,
//     });

//     app.at("").get(if permanent {
//         Redirect::permanent(redirect_to_url.to_string())
//     } else {
//         Redirect::temporary(redirect_to_url.to_string())
//     });

//     app.at("*").get(|req: Request<RedirectState>| async move {
//         let path = req.url().path();
//         let redirect_to = format!("{}{}", req.state().redirect_to_url, path);
//         Ok(if req.state().permanent {
//             Redirect::permanent(redirect_to)
//         } else {
//             Redirect::temporary(redirect_to)
//         })
//     });
//     return Ok(app);
// }
