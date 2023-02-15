package(default_visibility = ["//visibility:public"])

load("@rules_rust//rust:defs.bzl", "rust_binary", "rust_test", "rustfmt_test")

rust_binary(
    name = "extendedmind_cli",
    deps = ["//schema:extendedmind_schema_rust",
            "//core:extendedmind_core",
            "//ui/common:extendedmind_ui_common",
            "//third_party/cargo:async_tungstenite",
            "//third_party/cargo:futures",
            "//third_party/cargo:async_std",
            "//third_party/cargo:log",
            "//third_party/cargo:fern",
            "//third_party/cargo:chrono",
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

rustfmt_test(
    name = "extendedmind_cli_rustfmt_test",
    targets = [":extendedmind_cli"],
)
