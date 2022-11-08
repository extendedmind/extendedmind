package(default_visibility = ["//visibility:public"])

load("@rules_rust//rust:defs.bzl", "rust_library", "rust_test", "rustfmt_test")
load("@bazel_skylib//lib:selects.bzl", "selects")

rust_library(
    name = "extendedmind_engine",
    deps = [
        "//schema:extendedmind_schema_rust",
        "//third_party/cargo:automerge",
        "//third_party/cargo:hypercore_protocol",
        "//third_party/cargo:async_std",
        "//third_party/cargo:bytes",
        "//third_party/cargo:futures",
        "//third_party/cargo:random_access_storage",
        "//third_party/cargo:random_access_memory",
        "//third_party/cargo:hex",
        "//third_party/cargo:anyhow",
        "//third_party/cargo:log",
        "//third_party/cargo:reusable_box_future",
        "//third_party/cargo:wasm_bindgen",
        "//third_party/cargo:wasm_bindgen_futures",
    ] + selects.with_or({
        (
            "@rules_rust//rust/platform:wasm32-unknown-unknown",
        ): [
            # WASM-only dependencies here
        ],
        "//conditions:default": [
            "//third_party/cargo:random_access_disk",
        ],
    }),
    proc_macro_deps = [
        "//third_party/cargo:async_attributes",
        "//third_party/cargo:derivative",
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
