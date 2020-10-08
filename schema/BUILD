package(default_visibility = ["//visibility:public"])

load("@io_bazel_rules_openapi//openapi:openapi.bzl", "openapi_gen")

RUST_OPENAPI_OUTS = [
    "data.rs",
    "mod.rs"
]
openapi_gen(
    name = "openapi_rust",
    language = "rust",
    spec = "src/openapi.yaml",
    spec_refs = ["src/schema.json"],
)
genrule(
    name = "schema_rust",
    srcs = ["openapi_rust"],
    outs = RUST_OPENAPI_OUTS,
    cmd = "unzip -j $< src/models/{} -d $(@D)".format(" src/models/".join(RUST_OPENAPI_OUTS)),
)
