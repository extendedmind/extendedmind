load("@build_bazel_rules_nodejs//:index.bzl", "copy_to_bin", "nodejs_test")
load("@npm//@bazel/cypress:index.bzl", "cypress_web_test")
load("@npm//@sveltejs/kit:index.bzl", "svelte_kit")

load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")

filegroup(
    name = "conf",
    srcs = [
        "cypress.json",
        "package.json",
        "package-lock.json",
        "svelte.config.js",
        "tsconfig.json",
    ],
    visibility = ["//visibility:public"],
)

svelte_kit(
    name = "web",
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
        ":conf",
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

cypress_web_test(
    name = "it",
    srcs = [
        "//ui/web/tests/cypress/integration:frontPage.spec.js",
    ],
    config_file = "cypress.json",
)
