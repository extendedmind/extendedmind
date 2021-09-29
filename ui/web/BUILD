load("@build_bazel_rules_nodejs//:index.bzl", "copy_to_bin", "nodejs_test")
load("@npm//@sveltejs/kit:index.bzl", "svelte_kit")

load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")

filegroup(
    name = "conf",
    srcs = [
        "package.json",
        "package-lock.json",
        "svelte.config.js",
        "tsconfig.json",
    ],
    visibility = ["//visibility:public"],
)

svelte_kit(
    name = "build",
    outs = ["dist"],
    chdir = "ui/web",
    args = [
        "build",
        # This is a terrible hack: apparently Sveltekit ignores these, but they can still be found
        # via process.argv in svelte.config.js. --out gives error, but just words work.
        "--",
        "--out",
        "../../$(@D)/dist/extendedmind"
    ],
    data = [
        ":svelte.config.js",
        ":tsconfig.json",
        ":package.json",
        "//ui/web/src",
        "//ui/web/static",
        "@npm//@sveltejs/adapter-static",
        "@npm//@sveltejs/kit",
        "@npm//@fontsource/fira-mono",
        "@npm//@lukeed/uuid",
        "@npm//cookie",
        "@npm//svelte",
        "@npm//svelte-check",
        "@npm//svelte-preprocess",
    ],
)
