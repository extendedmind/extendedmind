package(default_visibility = ["//visibility:public"])

load("@io_bazel_rules_rust//rust:rust.bzl", "rust_library")

rust_library(
    name = "extendedmind_engine",
    deps = ["//schema:extendedmind_schema_rust"],
    srcs = glob(["src/**"]),
)