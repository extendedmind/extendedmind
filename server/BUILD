package(default_visibility = ["//visibility:public"])

load("@rules_rust//rust:defs.bzl", "rust_binary", "rustfmt_test")
load("@crate_index//:defs.bzl", "all_crate_deps")

platform(
	name = "arm64_linux_rpi3b",
	constraint_values = [
		"@platforms//cpu:aarch64",
		"@platforms//os:linux",
	],
)

rust_binary(
    name = "extendedmind_server",
    deps = [
        "//hub:extendedmind_hub",
    ] + all_crate_deps(),
    proc_macro_deps = all_crate_deps(proc_macro = True),
    srcs = glob(["src/**"]),
)

rustfmt_test(
    name = "extendedmind_server_rustfmt_test",
    targets = [":extendedmind_server"],
)
