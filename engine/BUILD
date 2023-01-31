package(default_visibility = ["//visibility:public"])

load("@rules_rust//rust:defs.bzl", "rust_library", "rust_test", "rustfmt_test")
load("@bazel_skylib//lib:selects.bzl", "selects")

rust_library(
    name = "extendedmind_engine",
    deps = [
        "//schema:extendedmind_schema_rust",
        "//third_party/cargo:peermerge",
        "//third_party/cargo:async_std",
        "//third_party/cargo:bytes",
        "//third_party/cargo:futures",
        "//third_party/cargo:anyhow",
        "//third_party/cargo:reusable_box_future",
    ],
    srcs = glob(["src/**"]),
)

rust_test(
    name = "extendedmind_engine_test",
    crate = ":extendedmind_engine",
    size = "small",
)

rustfmt_test(
    name = "extendedmind_engine_rustfmt_test",
    targets = [":extendedmind_engine"],
)
