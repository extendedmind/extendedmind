package(default_visibility = ["//visibility:public"])

load("@rules_rust//rust:defs.bzl", "rust_binary", "rustfmt_test")

rust_binary(
    name = "extendedmind_hub",
    deps = ["//schema:extendedmind_schema_rust",
            "//engine:extendedmind_engine",
            "//third_party/cargo:fern",
            "//third_party/cargo:log",
            "//third_party/cargo:anyhow",
            "//third_party/cargo:chrono",
            "//third_party/cargo:futures",
            "//third_party/cargo:tide",
            "//third_party/cargo:tide_websockets",
            "//third_party/cargo:async_std",
            "//third_party/cargo:async_tungstenite",
            "//third_party/cargo:async_ctrlc",
            "//third_party/cargo:ctrlc",
            "//third_party/cargo:clap",
    ],
    proc_macro_deps = [
        "//third_party/cargo:derivative",
    ],
    srcs = glob(["src/**"]),
)

rustfmt_test(
    name = "extendedmind_hub_rustfmt_test",
    targets = [":extendedmind_hub"],
)
