package(default_visibility = ["//visibility:public"])

load("@io_bazel_rules_rust//rust:rust.bzl", "rust_binary", "rust_test")

rust_binary(
    name = "extendedmind_cli",
    deps = ["//schema:extendedmind_schema_rust", "//engine:extendedmind_engine"],
    srcs = glob(["src/**"]),
)

rust_test(
    name = "extendedmind_cli_test",
    srcs = ["tests/cli_integration_test.rs"],
    deps = [":extendedmind_cli", "//third_party/cargo:duct"],
    size = "small",
)
