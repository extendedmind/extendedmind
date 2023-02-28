package(default_visibility = ["//visibility:public"])

load("@rules_rust//rust:defs.bzl", "rust_library", "rust_test", "rustfmt_test")
load("@crate_index//:defs.bzl", "all_crate_deps")

rust_library(
    name = "extendedmind_ui_disk",
    deps = [
        "//ui/common:extendedmind_ui_common",
    ] + all_crate_deps(),
    proc_macro_deps = all_crate_deps(proc_macro = True),
    srcs = glob(["src/**"]),
)

rust_test(
    name = "extendedmind_ui_disk_test",
    crate = ":extendedmind_ui_disk",
    size = "small",
)

rustfmt_test(
    name = "extendedmind_ui_disk_rustfmt_test",
    targets = [":extendedmind_ui_disk"],
)
