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
http_archive(
    name = "io_bazel_rules_openapi",
    sha256 = "85bfdf9e404050994babcefee64a690db0a2365d943b61879c79d34cc5586f5f",
    strip_prefix = "rules_openapi-28408ea51191bd79ab8ddecde3b434af12ae89d4",
    urls = [
        "https://github.com/ttiurani/rules_openapi/archive/28408ea51191bd79ab8ddecde3b434af12ae89d4.tar.gz",
    ],
)
load("@io_bazel_rules_openapi//openapi:openapi.bzl", "openapi_repositories")
openapi_repositories(
    codegen_cli_provider = "openapi",
    codegen_cli_version = "4.3.1", 
    codegen_cli_sha256 = "f438cd16bc1db28d3363e314cefb59384f252361db9cb1a04a322e7eb5b331c1", 
)

# Rust
load("//third_party/cargo:crates.bzl", "raze_fetch_remote_crates")
raze_fetch_remote_crates()
http_archive(
    name = "io_bazel_rules_rust",
    sha256 = "22034df99c4ad0d1a82c008d7132c01a16745a68e864b995c8aaa1b9af118f7b",
    strip_prefix = "rules_rust-82fdfd913bfacb770fd6c933703b45dc3ffe9eff",
    urls = [
        # Master branch as of 2020-10-14
        "https://github.com/bazelbuild/rules_rust/archive/82fdfd913bfacb770fd6c933703b45dc3ffe9eff.tar.gz",
    ],
)
load("@io_bazel_rules_rust//rust:repositories.bzl", "rust_repositories")
rust_repositories(version = "1.46.0", edition="2018", rustfmt_version = "1.4.18")
load("@io_bazel_rules_rust//:workspace.bzl", "rust_workspace")
rust_workspace()
