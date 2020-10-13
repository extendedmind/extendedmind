package(default_visibility = ["//visibility:public"])

load("@io_bazel_rules_rust//rust:rust.bzl", "rust_library", "rust_test")

rust_library(
    name = "extendedmind_engine",
    deps = [
        "//schema:extendedmind_schema_rust",
        "//third_party/cargo:automerge_frontend",
        "//third_party/cargo:serde_json",
    ],
    srcs = glob(["src/**"]),
)

rust_test(
    name = "extendedmind_engine_test",
    crate = ":extendedmind_engine",
    size = "small",
)
