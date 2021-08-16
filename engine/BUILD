package(default_visibility = ["//visibility:public"])

load("@rules_rust//rust:rust.bzl", "rust_library", "rust_test")
load("//:format.bzl", "rust_format")

rust_library(
    name = "extendedmind_engine",
    deps = [
        "//schema:extendedmind_schema_rust",
        # "//third_party/cargo:automerge_frontend",
        "//third_party/cargo:serde_json",
        "//third_party/cargo:hypercore",
        "//third_party/cargo:hypercore_protocol",
        "//third_party/cargo:async_std",
        "//third_party/cargo:bytes",
        "//third_party/cargo:futures",
        "//third_party/cargo:random_access_storage",
        "//third_party/cargo:random_access_disk",
        "//third_party/cargo:hex",
        "//third_party/cargo:anyhow",
        "//third_party/cargo:log",
        "//third_party/cargo:reusable_box_future",
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
