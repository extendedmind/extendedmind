package(default_visibility = ["//visibility:public"])

load("@rules_rust//rust:defs.bzl", "rust_library")
load("@rules_capnproto//capnp:capnp_library.bzl", "capnp_library")
load("@rules_capnproto//capnp:rust_capnp_sources.bzl", "rust_capnp_sources")

capnp_library(
    name = "extendedmind_schema_data_capnp",
    srcs = ["src/data.capnp"],
)

capnp_library(
    name = "extendedmind_schema_capnp",
    srcs = ["src/data.capnp", "src/wire_protocol.capnp"],
)

rust_capnp_sources(
    name = "extendedmind_schema_capnp_rust_sources",
    visibility = ["//visibility:public"],
    deps = [":extendedmind_schema_capnp"],
)

rust_library(
    name = "extendedmind_schema_rust",
    srcs = [":extendedmind_schema_capnp_rust_sources"],
    deps = ["//third_party/cargo:capnp"],
)
