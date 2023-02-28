package(default_visibility = ["//visibility:public"])

load("@rules_rust//rust:defs.bzl", "rust_library", "rust_binary", "rustfmt_test")
load("@crate_index//:defs.bzl", "all_crate_deps")

rust_library(
    name = "extendedmind_hub",
    deps = [
        "//core:extendedmind_core",
    ] + all_crate_deps(),
    srcs = glob(include=["src/**"], exclude=["src/main.rs"]),
)

rust_binary(
    name = "extendedmind_hub_bin",
    deps = [
        "//core:extendedmind_core",
    ] + all_crate_deps(),
    srcs = glob(include=["src/**"], exclude=["src/lib.rs"]),
)

rustfmt_test(
    name = "extendedmind_hub_rustfmt_test",
    targets = [":extendedmind_hub"],
)
