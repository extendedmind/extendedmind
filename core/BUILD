package(default_visibility = ["//visibility:public"])

load("@rules_rust//rust:defs.bzl", "rust_library", "rust_test", "rustfmt_test")
load("@crate_index//:defs.bzl", "all_crate_deps")

rust_library(
    name = "extendedmind_core",
    edition = "2021",
    deps = [
        "//schema:extendedmind_schema_rust",
    ] + all_crate_deps(),
    srcs = glob(["src/**"]),
)

rust_test(
    name = "extendedmind_core_test",
    crate = ":extendedmind_core",
    size = "small",
)

rustfmt_test(
    name = "extendedmind_core_rustfmt_test",
    targets = [":extendedmind_core"],
)
