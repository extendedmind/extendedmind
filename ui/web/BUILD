load("@npm//@sveltejs/kit:index.bzl", "svelte_kit")
load(":jest.bzl", "jest_test")

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

jest_test(
    name = "integration_test",
    srcs = [
        "//ui/web/tests",
    ],
    jest_config = ":jest.e2e.config.js",
    jest_playwright_config = ":jest-playwright.config.js",
    hub_bin = "//hub:extendedmind_hub",
    hub_port = "8080",
    deps = [
        "@npm//jest-playwright-preset",
        "@npm//playwright",
    ],
)
