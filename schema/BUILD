package(default_visibility = ["//visibility:public"])

load("@rules_rust//rust:defs.bzl", "rust_library")
load("@crate_index//:defs.bzl", "all_crate_deps")
load("@rules_capnproto//capnp:capnp_library.bzl", "capnp_library")
load("@rules_capnproto//capnp:rust_capnp_sources.bzl", "rust_capnp_sources")
load("@rules_capnproto//capnp:ts_capnp_sources.bzl", "ts_capnp_sources")
load("@rules_capnproto//capnp:java_capnp_sources.bzl", "java_capnp_sources")

capnp_library(
    name = "extendedmind_schema_ui_capnp",
    srcs = ["src/model.capnp", "src/ui_protocol.capnp"],
    deps = ["@capnproto_java//:capnpc_java_capnp"]
)

capnp_library(
    name = "extendedmind_schema_capnp",
    srcs = ["src/model.capnp", "src/wire_protocol.capnp", "src/ui_protocol.capnp"],
    deps = ["@capnproto_java//:capnpc_java_capnp"]
)

rust_capnp_sources(
    name = "extendedmind_schema_capnp_rust_sources",
    visibility = ["//visibility:public"],
    deps = [":extendedmind_schema_capnp"],
)

rust_library(
    name = "extendedmind_schema_rust",
    srcs = [":extendedmind_schema_capnp_rust_sources"],
    deps = all_crate_deps(),
)

ts_capnp_sources(
    name = "extendedmind_schema_capnp_ts_sources",
    visibility = ["//visibility:public"],
    deps = [":extendedmind_schema_ui_capnp"],
)

java_capnp_sources(
    name = "extendedmind_schema_capnp_java_sources",
    visibility = ["//visibility:public"],
    deps = [":extendedmind_schema_ui_capnp"],
)

java_library(
    name = "extendedmind_schema_capnp_java_lib",
    visibility = ["//visibility:public"],
    srcs = [":extendedmind_schema_capnp_java_sources"],
    deps = ["@maven//:org_capnproto_runtime"],
)
