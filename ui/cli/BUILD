package(default_visibility = ["//visibility:public"])

load("@rules_rust//rust:defs.bzl", "rust_binary", "rust_test", "rustfmt_test")
load("@crate_index//:defs.bzl", "all_crate_deps", "crate_deps")

rust_binary(
    name = "extendedmind_cli",
    deps = [
        "//ui/disk:extendedmind_ui_disk",
    ] + all_crate_deps(),
    srcs = glob(["src/**"]),
)

rust_test(
    name = "extendedmind_cli_test",
    srcs = ["tests/cli_integration_test.rs"],
    deps = [":extendedmind_cli"] + crate_deps(["duct"]),
    size = "small",
)

rustfmt_test(
    name = "extendedmind_cli_rustfmt_test",
    targets = [":extendedmind_cli"],
)
