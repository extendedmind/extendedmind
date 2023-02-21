load("@npm//vite:index.bzl", "vite")
load(":jest.bzl", "jest_test")

filegroup(
    name = "conf",
    srcs = [
        "package.json",
        "package-lock.json",
        "svelte.config.js",
        "tools.js",
        "tsconfig.json",
        "vite.config.ts",
    ],
    visibility = ["//visibility:public"],
)

vite(
    name = "build",
    outs = ["dist"],
    chdir = "ui/web",
    args = [
        "build",
        # This is a terrible hack to find Bazel-generated code using the @D variable: Sveltekit
        # ignores everything after "--, but they can still be found via process.argv in
        # svelte.config.js.
        "--",
        "--out-dir",
        "../../$(@D)/dist/extendedmind",
        "--schema-dir",
        "../../$(@D)/../../schema/src",
        "--wasm-dir",
        "../../$(@D)/../common",
    ],
    data = [
        ":conf",
        "//schema:extendedmind_schema_capnp_ts_sources",
        "//ui/common:extendedmind_ui_common_wasm",
        "//ui/web/src",
        "//ui/web/static",
        "@npm//@sveltejs/adapter-static",
        "@npm//@sveltejs/kit",
        "@npm//svelte",
        "@npm//svelte-check",
        "@npm//capnp-ts",
        "@npm//vite-plugin-top-level-await",
        "@npm//vite-plugin-wasm",
    ],
)

jest_test(
    name = "integration_test",
    srcs = [
        "//ui/web/tests",
    ],
    jest_config = ":jest.e2e.config.js",
    jest_playwright_config = ":jest-playwright.config.js",
    server_bin = "//server:extendedmind_server",
    server_http_port = "8080",
    server_tcp_port = "8081",
    server_data_dir = "../../$(@D)/server_data",
    cli_bin = "//ui/cli:extendedmind_cli",
    cli_data_dir = "../../$(@D)/cli_data",
    dist_dir = ":build",
    deps = [
        "@npm//jest-playwright-preset",
        "@npm//playwright",
        "@npm//dotenv",
    ],
)

genrule(
    name = "external-deps-refresh",
    visibility = ["//visibility:public"],
    srcs = [
        "//schema:extendedmind_schema_capnp_ts_sources",
        "//ui/common:extendedmind_ui_common_wasm",
    ],
    outs = ["external-deps-refresh.sh"],
    cmd = """
    cat <<\\EOF > $@
#!/bin/bash
npm run copyExternalDeps
EOF
    """,
    executable = True,
)
