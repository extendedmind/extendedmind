package(default_visibility = ["//visibility:public"])

load("@io_bazel_rules_openapi//openapi:openapi.bzl", "openapi_gen")
load("@rules_rust//rust:rust.bzl", "rust_library")

RUST_OPENAPI_MODEL_OUTS = [
    "models/data.rs",
    "models/reminder.rs",
    "models/item.rs",
    "models/mod.rs",
]
openapi_gen(
    name = "schema_openapi_gen_rust",
    language = "rust",
    spec = "src/openapi.yaml",
    spec_refs = ["src/schema.json"],
)
# We only want the schema models so the generated lib.rs needs to be modified to comment out unnecessary
# fields. A bit awkward but the OpenAPI generator is the best JSON Schema generator for Rust, so this is
# still better than the alternative.
genrule(
    name = "schema_rust_models",
    srcs = ["schema_openapi_gen_rust"],
    outs = RUST_OPENAPI_MODEL_OUTS + ["lib.rs"],
    cmd = ("unzip -j $< src/lib.rs src/{} -d $(@D)/models "
         + "&& cd $(@D) "
         + "&& mv models/lib.rs ./"
         + "&& sed -i -e '/crate url/ s/^/\\/\\//' lib.rs "
         + "&& sed -i -e '/crate hyper/ s/^/\\/\\//' lib.rs "
         + "&& sed -i -e '/crate futures/ s/^/\\/\\//' lib.rs"
         + "&& sed -i -e '/mod apis/ s/^/\\/\\//' lib.rs"
          ).format(" src/".join(RUST_OPENAPI_MODEL_OUTS)),
)
rust_library(
    name = "extendedmind_schema_rust",
    srcs = [":schema_rust_models"],
    deps = ["//third_party/cargo:serde", "//third_party/cargo:serde_json"],
    proc_macro_deps = ["//third_party/cargo:serde_derive"],
)
