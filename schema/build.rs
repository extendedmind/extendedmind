use std::ffi::OsStr;
use std::path::PathBuf;

fn main() {
    let out_dir: String = std::env::var_os("OUT_DIR").unwrap().into_string().unwrap();
    let manifest_dir = std::env::var_os("CARGO_MANIFEST_DIR")
        .unwrap()
        .into_string()
        .unwrap();
    let bazel_generated_rust_path =
        PathBuf::from(format!("{}/../bazel-bin/schema/src", manifest_dir));
    let mut capnp_sources: Vec<PathBuf> = bazel_generated_rust_path
        .read_dir()
        .unwrap()
        .flatten()
        .filter(|entry| {
            entry.path().is_file() && entry.path().extension() == Some(OsStr::new("rs"))
        })
        .map(|entry| entry.path())
        .collect();
    for capnp_source in capnp_sources.iter_mut() {
        let source = capnp_source.canonicalize().unwrap();
        let destination = PathBuf::from(format!(
            "{}/{}",
            out_dir,
            capnp_source.file_name().unwrap().to_str().unwrap()
        ));
        if !destination.exists() {
            std::fs::copy(source.clone(), destination.clone()).expect(
                format!(
                    "{:?} could not be copied to {:?}",
                    capnp_source, destination
                )
                .as_str(),
            );
        }
    }
}
