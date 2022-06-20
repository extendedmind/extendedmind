package(default_visibility = ["//visibility:public"])

load("@rules_rust//rust:defs.bzl", "rust_binary", "rustfmt_test")

platform(
	name = "arm64_linux_rpi3b",
	constraint_values = [
		"@platforms//cpu:aarch64",
		"@platforms//os:linux",
	],
)

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
            "//third_party/cargo:tide_compress",
            "//third_party/cargo:tide_rustls",
            "//third_party/cargo:tide_acme",
            "//third_party/cargo:thread_priority",
            "//third_party/cargo:serde",
            "//third_party/cargo:moka",
            "//third_party/cargo:tar",
            "//third_party/cargo:flate2",
            "//third_party/cargo:age",
            "//third_party/cargo:lettre",
            "//third_party/cargo:wildmatch",
            "//third_party/cargo:html_escape",
            "//third_party/cargo:async_std",
            "//third_party/cargo:async_tungstenite",
            "//third_party/cargo:async_ctrlc",
            "//third_party/cargo:ctrlc",
            "//third_party/cargo:clap",
    ],
    proc_macro_deps = [
        "//third_party/cargo:derivative",
        "//third_party/cargo:async_trait",
    ],
    srcs = glob(["src/**"]),
)

rustfmt_test(
    name = "extendedmind_hub_rustfmt_test",
    targets = [":extendedmind_hub"],
)
