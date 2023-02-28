package(default_visibility = ["//visibility:public"])

load("@rules_rust//rust:defs.bzl", "rust_shared_library")
load("@rules_rust//wasm_bindgen:wasm_bindgen.bzl", "rust_wasm_bindgen")
load("@crate_index//:defs.bzl", "all_crate_deps")

rust_shared_library(
    name = "extendedmind_ui_wasm_shared",
    deps = [
        "//ui/common:extendedmind_ui_common",
    ] + all_crate_deps(),
    proc_macro_deps = all_crate_deps(proc_macro = True),
    srcs = glob(["src/**"]),
)

rust_wasm_bindgen(
    name = "extendedmind_ui_wasm",
    target = "bundler",
    wasm_file = ":extendedmind_ui_wasm_shared",
)
