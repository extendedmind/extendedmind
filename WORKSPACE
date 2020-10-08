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
# http_archive(
#     name = "openapi_tools_generator_bazel",
#     sha256 = "720b9cb82687fca4387cdac1f2fd578ef064ec9f039fa5593d297c2bcc7125aa",
#     strip_prefix = "openapi-generator-bazel-1517b59ff968c823d034684897c243e1d96ee4c5",
#     urls = [
#         "https://github.com/ttiurani/openapi-generator-bazel/archive/1517b59ff968c823d034684897c243e1d96ee4c5.tar.gz",
#     ],
# )
# local_repository(name = "openapi_tools_generator_bazel", path = "../openapi-generator-bazel")
local_repository(
    name = "io_bazel_rules_openapi",
    path = "../rules_openapi")
load("@io_bazel_rules_openapi//openapi:openapi.bzl", "openapi_repositories")
openapi_repositories(
    codegen_cli_provider = "openapi",
    codegen_cli_version = "4.3.1", 
    codegen_cli_sha256 = "f438cd16bc1db28d3363e314cefb59384f252361db9cb1a04a322e7eb5b331c1", 
)

# Rust
http_archive(
    name = "io_bazel_rules_rust",
    sha256 = "618cba29165b7a893960de7bc48510b0fb182b21a4286e1d3dbacfef89ace906",
    strip_prefix = "rules_rust-5998baf9016eca24fafbad60e15f4125dd1c5f46",
    urls = [
        # Master branch as of 2020-09-24
        "https://github.com/bazelbuild/rules_rust/archive/5998baf9016eca24fafbad60e15f4125dd1c5f46.tar.gz",
    ],
)
load("@io_bazel_rules_rust//rust:repositories.bzl", "rust_repositories")
rust_repositories()
load("@io_bazel_rules_rust//:workspace.bzl", "rust_workspace")
rust_workspace()
