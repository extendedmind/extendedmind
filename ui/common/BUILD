package(default_visibility = ["//visibility:public"])

load("@rules_rust//rust:defs.bzl", "rust_library", "rust_test", "rustfmt_test")
load("@crate_index//:defs.bzl", "all_crate_deps")

srcs = glob(["src/**"])

rust_library(
    name = "extendedmind_ui_common",
    deps = [
        "//core:extendedmind_core",
    ] + all_crate_deps(),
    srcs = srcs,
)

rust_test(
    name = "extendedmind_ui_common_test",
    crate = ":extendedmind_ui_common",
    size = "small",
)

rustfmt_test(
    name = "extendedmind_ui_common_rustfmt_test",
    targets = [":extendedmind_ui_common"],
)
