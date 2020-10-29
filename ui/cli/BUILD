package(default_visibility = ["//visibility:public"])

load("@io_bazel_rules_rust//rust:rust.bzl", "rust_binary", "rust_test")
load("//:format.bzl", "rust_format")

rust_binary(
    name = "extendedmind_cli",
    deps = ["//schema:extendedmind_schema_rust",
            "//engine:extendedmind_engine",
            "//third_party/cargo:async_tungstenite",
            "//third_party/cargo:futures",
            "//third_party/cargo:async_std",
            "//third_party/cargo:clap",
            "//third_party/cargo:bytes",
    ],
    srcs = glob(["src/**"]),
)

rust_test(
    name = "extendedmind_cli_test",
    srcs = ["tests/cli_integration_test.rs"],
    deps = [":extendedmind_cli", "//third_party/cargo:duct"],
    size = "small",
)

rust_format(
    name = "extendedmind_cli_format",
    srcs = glob(["src/**"]) + glob(["tests/**"]),
)

sh_test(
    name = "extendedmind_cli_format_test",
    srcs = ["//:format_test.sh"],
    data = [":extendedmind_cli_format_input", ":extendedmind_cli_format_output"],
    deps = ["@bazel_tools//tools/bash/runfiles"],
    size = "small",
)
