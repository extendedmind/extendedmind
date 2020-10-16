load("@bazel_skylib//rules:diff_test.bzl", "diff_test")

def _rust_format_srcs_impl(ctx):
    toolchain = ctx.toolchains["@io_bazel_rules_rust//rust:toolchain"]
    rustfmt_bin = toolchain.rustfmt 
    formatted_files = []

    for unformatted_file in ctx.files.srcs:
        # We want the file to end up in the same folder as the source, so we need to take away the beginning part
        unformatted_file_relative_path = unformatted_file.short_path[(ctx.build_file_path.rindex("/") + 1):]
        formatted_file = ctx.actions.declare_file("__formatted_" + unformatted_file_relative_path)
        formatted_files += [formatted_file]

        args = ctx.actions.args()
        args.add("--stdout-file", formatted_file.path)
        args.add("--")
        args.add(rustfmt_bin.path)
        args.add("--emit", "stdout")
        args.add("--edition", "2018")
        args.add("--quiet")
        args.add(unformatted_file.path)
        ctx.actions.run(
            executable = ctx.executable._process_wrapper,
            inputs = [unformatted_file],
            outputs = [formatted_file],
            arguments = [args],
            tools = [rustfmt_bin],
            mnemonic = "Rustfmt",
        )

    return struct(files = depset(formatted_files))

rust_format_srcs = rule(
    attrs = {
        "srcs": attr.label_list(allow_files = True),
        "_process_wrapper": attr.label(
            default = "@io_bazel_rules_rust//util/process_wrapper",
            executable = True,
            allow_single_file = True,
            cfg = "exec",
        ),
    },
    implementation = _rust_format_srcs_impl,
    toolchains = [
        "@io_bazel_rules_rust//rust:toolchain",
    ],
)

def rust_format(name, srcs, **kwargs):
    native.filegroup(
        name = name + "_input",
        srcs = srcs,
    )

    rust_format_srcs(
        name = name + "_formatted",
        srcs = [name + "_input"],
    )

    native.filegroup(
        name = name + "_output",
        srcs = [":" + name + "_formatted"],
    )

