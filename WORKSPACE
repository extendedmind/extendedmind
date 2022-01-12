load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Maven
RULES_JVM_EXTERNAL_TAG = "3.3"
RULES_JVM_EXTERNAL_SHA = "d85951a92c0908c80bd8551002d66cb23c3434409c814179c0ff026b53544dab"
http_archive(
    name = "rules_jvm_external",
    strip_prefix = "rules_jvm_external-%s" % RULES_JVM_EXTERNAL_TAG,
    sha256 = RULES_JVM_EXTERNAL_SHA,
    url = "https://github.com/bazelbuild/rules_jvm_external/archive/%s.zip" % RULES_JVM_EXTERNAL_TAG,
)
load("@rules_jvm_external//:defs.bzl", "maven_install")
maven_install(
    artifacts = [
        "org.openapitools:openapi-generator-cli:4.3.1",
    ],
    repositories = [
        "https://repo1.maven.org/maven2",
    ],
)

# OpenAPI
RULES_OPEN_API_VERSION = "86fa11d0a8a8188ceecb74b5674af3f7363701e8"
RULES_OPEN_API_SHA256 = "73c98d5a8283bb70142b6fbb49a944752a677e1b11553790d4d9aee9e9950942"

http_archive(
    name = "io_bazel_rules_openapi",
    strip_prefix = "rules_openapi-%s" % RULES_OPEN_API_VERSION,
    url = "https://github.com/meetup/rules_openapi/archive/%s.tar.gz" % RULES_OPEN_API_VERSION,
    sha256 = RULES_OPEN_API_SHA256
)

load("@io_bazel_rules_openapi//openapi:openapi.bzl", "openapi_repositories")
openapi_repositories(
    codegen_cli_provider = "openapi",
    codegen_cli_version = "4.3.1",
    codegen_cli_sha256 = "f438cd16bc1db28d3363e314cefb59384f252361db9cb1a04a322e7eb5b331c1",
)

# Rust
http_archive(
    name = "rules_rust",
    sha256 = "59ffb4b9d26525e1ed2cfb45eb0253bbf3b1d8974cda58f93a14183c47d28b3c",
    strip_prefix = "rules_rust-332542944e0c444e689ab011955df462f8f1f2b5",
    urls = [
        # Master branch as of 2021-11-10
        "https://github.com/bazelbuild/rules_rust/archive/332542944e0c444e689ab011955df462f8f1f2b5.tar.gz",
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
    sha256 = "4913ea835810c195df24d3a929315c29a64566cc48e409d8b0f35008b4e02e59",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/4.4.4/rules_nodejs-4.4.4.tar.gz"],
)

load("@build_bazel_rules_nodejs//:index.bzl", "npm_install")

npm_install(
    name = "npm",
    package_json = "//ui/web:package.json",
    package_lock_json = "//ui/web:package-lock.json",
    quiet = False,
    symlink_node_modules = False,
)
