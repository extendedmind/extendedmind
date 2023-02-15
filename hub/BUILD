package(default_visibility = ["//visibility:public"])

load("@rules_rust//rust:defs.bzl", "rust_library", "rust_binary", "rustfmt_test")

HUB_DEPS = [
    "//schema:extendedmind_schema_rust",
    "//core:extendedmind_core",
    "//third_party/cargo:peermerge_tcp",
    "//third_party/cargo:log",
    "//third_party/cargo:anyhow",
    "//third_party/cargo:chrono",
    "//third_party/cargo:futures",
    "//third_party/cargo:thread_priority",
    "//third_party/cargo:tar",
    "//third_party/cargo:flate2",
    "//third_party/cargo:age",
    "//third_party/cargo:lettre",
    "//third_party/cargo:async_std",
    "//third_party/cargo:clap",
    "//third_party/cargo:async_ctrlc",
]

rust_library(
    name = "extendedmind_hub",
    deps = HUB_DEPS,
    srcs = glob(include=["src/**"], exclude=["src/main.rs"]),
)

rust_binary(
    name = "extendedmind_hub_bin",
    deps = HUB_DEPS + [
        "//third_party/cargo:fern",
    ],
    srcs = glob(include=["src/**"], exclude=["src/lib.rs"]),
)

rustfmt_test(
    name = "extendedmind_hub_rustfmt_test",
    targets = [":extendedmind_hub"],
)
