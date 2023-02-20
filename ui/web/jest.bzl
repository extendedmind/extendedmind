load("@npm//jest:index.bzl", "jest", _jest_test = "jest_test")

def jest_test(name, srcs, deps, jest_config, jest_playwright_config, server_bin, server_http_port, server_tcp_port, server_data_dir, cli_bin, cli_data_dir, dist_dir, **kwargs):
    "A macro around the autogenerated jest_test rule"
    templated_args = [
        "--no-cache",
        "--no-watchman",
        "--ci",
        "--colors",
    ]
    templated_args.extend(["--config", "$(rootpath %s)" % jest_config])
    for src in srcs:
        templated_args.extend(["--runTestsByPath", "$(rootpath %s)" % src])

    # HACK: Pass in extra args after "--" to use in jest.e2e.config.js
    templated_args.extend([
        "--",
        "--playwright-config", "$(rootpath %s)" % jest_playwright_config,
        "--server-bin", "$(rootpath %s)" % server_bin,
        "--server-http-port", server_http_port,
        "--server-tcp-port", server_tcp_port,
        "--server-data-dir", server_data_dir,
        "--cli-bin", "$(rootpath %s)" % cli_bin,
        "--cli-data-dir", cli_data_dir,
        "--dist-dir", "$(rootpath %s)" % dist_dir])

    data = [jest_config, jest_playwright_config, server_bin, cli_bin, dist_dir] + srcs + deps + ["jest-reporter.js"]
    _jest_test(
        name = name,
        data = data,
        templated_args = templated_args,
        **kwargs
    )

    # This rule is used specifically to update snapshots via `bazel run`
    jest(
        name = "%s.update" % name,
        data = data,
        templated_args = templated_args + ["-u"],
        **kwargs
    )
