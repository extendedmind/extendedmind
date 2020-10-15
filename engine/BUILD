package(default_visibility = ["//visibility:public"])

load("@io_bazel_rules_rust//rust:rust.bzl", "rust_library", "rust_test")
load("//:format.bzl", "rust_format")

rust_library(
    name = "extendedmind_engine",
    deps = [
        "//schema:extendedmind_schema_rust",
        "//third_party/cargo:automerge_frontend",
        "//third_party/cargo:serde_json",
        "//third_party/cargo:hypercore",
    ],
    srcs = glob(["src/**"]),
)

rust_test(
    name = "extendedmind_engine_test",
    crate = ":extendedmind_engine",
    size = "small",
)

rust_format(
    name = "extendedmind_engine_format",
    srcs = glob(["src/**"]),
)

sh_test(
    name = "extendedmind_engine_format_test",
    srcs = ["//:format_test.sh"],
    data = [":extendedmind_engine_format_input", ":extendedmind_engine_format_output"],
    deps = ["@bazel_tools//tools/bash/runfiles"],
    size = "small",
)
