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
RULES_OPEN_API_VERSION = "3778d76697ca1386b3263bd22f1b292c84dbd08f"
RULES_OPEN_API_SHA256 = "9e2a7c3dcf23e170a24a7851223d36766eee6c8dc67266f5f193dab5027571cb"

http_archive(
    name = "io_bazel_rules_openapi",
    strip_prefix = "rules_openapi-%s" % RULES_OPEN_API_VERSION,
    url = "https://github.com/ttiurani/rules_openapi/archive/%s.tar.gz" % RULES_OPEN_API_VERSION,
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
    sha256 = "5ef76c7ca318f0795c2a524a01e0a7a399fd845d7cdebf7bc7ea7321859069b6",
    strip_prefix = "rules_rust-af2f908a2d342d79b74ea97fcbfbe7b0d03e2bdf",
    urls = [
        # Master branch as of 2021-08-16
        "https://github.com/bazelbuild/rules_rust/archive/af2f908a2d342d79b74ea97fcbfbe7b0d03e2bdf.tar.gz",
    ],
)
load("@rules_rust//rust:repositories.bzl", "rust_repositories")
rust_repositories(version = "1.54.0", edition="2018", rustfmt_version = "1.54.0")

load("//third_party/cargo:crates.bzl", "raze_fetch_remote_crates")
raze_fetch_remote_crates()

# Node/Javascript/Typescript/Svelte/Cypress

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "3635797a96c7bfcd0d265dacd722a07335e64d6ded9834af8d3f1b7ba5a25bba",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/4.3.0/rules_nodejs-4.3.0.tar.gz"],
)

load("@build_bazel_rules_nodejs//:index.bzl", "npm_install")

npm_install(
    name = "npm",
    package_json = "//ui/web:package.json",
    package_lock_json = "//ui/web:package-lock.json",
    quiet = False,
)

load("@build_bazel_rules_nodejs//toolchains/cypress:cypress_repositories.bzl", "cypress_repositories")

cypress_repositories(name = "cypress", version = "8.5.0")
