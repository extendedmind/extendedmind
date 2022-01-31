load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Node/Javascript/Typescript/Svelte/Esbuild
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "f690430f4d4cc403b5c90d0f0b21842183b56b732fff96cfe6555fe73189906a",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.0.1/rules_nodejs-5.0.1.tar.gz"],
)
load("@build_bazel_rules_nodejs//:repositories.bzl", "build_bazel_rules_nodejs_dependencies")
build_bazel_rules_nodejs_dependencies()
load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")

nodejs_register_toolchains(
    name = "nodejs"
)

load("@build_bazel_rules_nodejs//:index.bzl", "npm_install", "node_repositories")

npm_install(
    name = "npm",
    package_json = "//ui/web:package.json",
    package_lock_json = "//ui/web:package-lock.json",
    quiet = False,
    symlink_node_modules = False,
)

# Cap'n Proto
RULES_CAPNPROTO_VERSION = "c8c751513dfd54194e098c253053309f091311e9"
RULES_CAPNPROTO_SHA256 = "6bdbfb7ab678a94f2120a97b9688a95535b3b5ec6b148d388dccaba1a14870d8"

http_archive(
    name = "rules_capnproto",
    strip_prefix = "rules_capnproto-%s" % RULES_CAPNPROTO_VERSION,
    url = "https://github.com/ttiurani/rules_capnproto/archive/%s.tar.gz" % RULES_CAPNPROTO_VERSION,
    sha256 = RULES_CAPNPROTO_SHA256,
)

load(
    "@rules_capnproto//capnp:repositories.bzl",
    "capnp_dependencies",
    "capnp_toolchain",
    "capnp_rust_toolchain",
    "capnp_ts_toolchain",
    "capnp_java_toolchain"
)

capnp_dependencies()
capnp_toolchain()
capnp_rust_toolchain()
capnp_ts_toolchain()
capnp_java_toolchain()

# Rust
http_archive(
    name = "rules_rust",
    sha256 = "257d08303b2814ff29f11d1d4f2ed9dff39d5fa9f7362dc802faa090875ea5d9",
    strip_prefix = "rules_rust-fd436df9e2d4ac1b234ca5e969e34a4cb5891910",
    urls = [
        # Master branch as of 2022-01-18
        "https://github.com/bazelbuild/rules_rust/archive/fd436df9e2d4ac1b234ca5e969e34a4cb5891910.tar.gz",
    ],
)
load("@rules_rust//rust:repositories.bzl", "rust_repositories")
rust_repositories(version = "1.56.1", edition="2018", rustfmt_version = "1.56.1")

load("@rules_rust//wasm_bindgen:repositories.bzl", "rust_wasm_bindgen_repositories")
rust_wasm_bindgen_repositories()

load("//third_party/cargo:crates.bzl", "raze_fetch_remote_crates")
raze_fetch_remote_crates()

CARGO_RAZE_VERSION = "07c775bd436316f6e837d5dd5eec61320dddb79e"
CARGO_RAZE_SHA256 = "82bf8d769611025b0b81872876dd830524693a6e93af96e18ee18701f1e50cf6"

http_archive(
    name = "cargo_raze",
    strip_prefix = "cargo-raze-%s" % CARGO_RAZE_VERSION,
    url = "https://github.com/ttiurani/cargo-raze/archive/%s.tar.gz" % CARGO_RAZE_VERSION,
    sha256 = CARGO_RAZE_SHA256
)
# # Example on using local version of cargo raze for hacking:
# local_repository(
#     name = "cargo_raze",
#     path = "[path to]/cargo-raze",
# )
load("@cargo_raze//:repositories.bzl", "cargo_raze_repositories")
cargo_raze_repositories()
load("@cargo_raze//:transitive_deps.bzl", "cargo_raze_transitive_deps")
cargo_raze_transitive_deps()
