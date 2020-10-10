use std::env;
use std::process;
use std::process::{Command, Stdio};

fn main() {
    let current_dir = env::var("CARGO_MANIFEST_DIR").ok().expect("Cargo should have set the CARGO_MANIFEST_DIR environment variable");
    if Command::new("sh")
        .arg("-c")
        .arg(&format!("cp -r {}/../bazel-extendedmind/bazel-out/darwin-fastbuild/bin/schema/models {}/src/", current_dir, current_dir))
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .status().unwrap().code().unwrap() != 0
    {
        println!("Error while copying changes from bazel output directory. Did you run a bazel build before?");
        process::exit(1)
    }
    println!("cargo:rerun-if-changed=src/schema.json");
}
