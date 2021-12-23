package(default_visibility = ["//visibility:public"])

load("@rules_rust//rust:defs.bzl", "rust_library", "rust_shared_library", "rust_test", "rustfmt_test")
load("@rules_rust//wasm_bindgen:wasm_bindgen.bzl", "rust_wasm_bindgen")

deps = [
    "//schema:extendedmind_schema_rust",
    "//engine:extendedmind_engine",
    "//third_party/cargo:wasm_bindgen",
    "//third_party/cargo:wasm_bindgen_futures",
    "//third_party/cargo:ws_stream_wasm",
    "//third_party/cargo:js_sys",
    "//third_party/cargo:async_std",
    "//third_party/cargo:futures",
    "//third_party/cargo:anyhow",
    "//third_party/cargo:log",
    "//third_party/cargo:console_error_panic_hook",
    "//third_party/cargo:console_log",
    "//third_party/cargo:indexed_db_futures",
]

proc_macro_deps = [
    "//third_party/cargo:async_attributes",
    "//third_party/cargo:async_trait",
    "//third_party/cargo:derivative",
]

srcs = glob(["src/**"])

rust_library(
    name = "extendedmind_ui_common",
    deps = deps,
    proc_macro_deps = proc_macro_deps,
    srcs = srcs,
)

rust_shared_library(
    name = "extendedmind_ui_common_shared",
    deps = deps,
    proc_macro_deps = proc_macro_deps,
    srcs = srcs,
)

rust_wasm_bindgen(
    name = "extendedmind_ui_common_wasm",
    target = "web",
    wasm_file = ":extendedmind_ui_common_shared",
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
