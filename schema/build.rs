use isahc::prelude::*;
use std::io::Write;
use std::{path::PathBuf, str::FromStr};

fn download_capnp_schemas() {
    let java_capnp_text = isahc::get("https://raw.githubusercontent.com/capnproto/capnproto-java/master/compiler/src/main/schema/capnp/java.capnp").unwrap().text().unwrap();
    std::fs::create_dir_all("target/capnp").unwrap();
    let mut java_capnp_file = std::fs::OpenOptions::new()
        .create(true)
        .write(true)
        .truncate(true)
        .open(PathBuf::from_str("target/capnp/java.capnp").unwrap())
        .unwrap();
    java_capnp_file
        .write_all(&java_capnp_text.as_bytes())
        .unwrap();
    java_capnp_file.flush().unwrap();
}

fn main() {
    download_capnp_schemas();
    capnpc::CompilerCommand::new()
        .import_path("target")
        .src_prefix("src")
        .file("src/data.capnp")
        .file("src/wire_protocol.capnp")
        .file("src/ui_protocol.capnp")
        .run()
        .expect("schema compiler command");
}
