package(default_visibility = ["//visibility:public"])

load("@rules_rust//rust:rust.bzl", "rust_binary")
load("//:format.bzl", "rust_format")

rust_binary(
    name = "extendedmind_hub",
    deps = ["//schema:extendedmind_schema_rust",
            "//engine:extendedmind_engine",
            "//third_party/cargo:fern",
            "//third_party/cargo:log",
            "//third_party/cargo:anyhow",
            "//third_party/cargo:chrono",
            "//third_party/cargo:futures",
            "//third_party/cargo:tide",
            "//third_party/cargo:tide_websockets",
            "//third_party/cargo:async_std",
            "//third_party/cargo:async_tungstenite",
            "//third_party/cargo:async_ctrlc",
            "//third_party/cargo:ctrlc",
    ],
    srcs = glob(["src/**"]),
)

rust_format(
    name = "extendedmind_hub_format",
    srcs = glob(["src/**"]) + glob(["tests/**"]),
)

sh_test(
    name = "extendedmind_hub_format_test",
    srcs = ["//:format_test.sh"],
    data = [":extendedmind_hub_format_input", ":extendedmind_hub_format_output"],
    deps = ["@bazel_tools//tools/bash/runfiles"],
    size = "small",
)
