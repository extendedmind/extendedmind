load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Cap'n Proto
RULES_CAPNPROTO_VERSION = "b02150cc8d81cda29195f93dafdc4d49befad19f"
RULES_CAPNPROTO_SHA256 = "98aab9cfc26dd648a66d82a1cfc1befd0f3067ec96d0ab18296b29a5f6288788"

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
)

capnp_dependencies()
capnp_toolchain()
capnp_rust_toolchain()

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
# new_local_repository(
#     name = "cargo_raze",
#     path = "[path to cargo raze]/cargo-raze",
#     build_file = "[path to cargo raze]/cargo-raze/BUILD.bazel",
# )
load("@cargo_raze//:repositories.bzl", "cargo_raze_repositories")
cargo_raze_repositories()
load("@cargo_raze//:transitive_deps.bzl", "cargo_raze_transitive_deps")
cargo_raze_transitive_deps()

# Node/Javascript/Typescript/Svelte/Esbuild

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "d63ecec7192394f5cc4ad95a115f8a6c9de55c60d56c1f08da79c306355e4654",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/4.6.1/rules_nodejs-4.6.1.tar.gz"],
)

load("@build_bazel_rules_nodejs//:index.bzl", "npm_install")

npm_install(
    name = "npm",
    package_json = "//ui/web:package.json",
    package_lock_json = "//ui/web:package-lock.json",
    quiet = False,
    symlink_node_modules = False,
)
