"""
@generated
cargo-raze crate workspace functions

DO NOT EDIT! Replaced on runs of cargo-raze
"""

load("@bazel_tools//tools/build_defs/repo:git.bzl", "new_git_repository")  # buildifier: disable=load
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")  # buildifier: disable=load
load("@bazel_tools//tools/build_defs/repo:utils.bzl", "maybe")  # buildifier: disable=load

def raze_fetch_remote_crates():
    """This function defines a collection of repos and should be called in a WORKSPACE file"""
    maybe(
        new_git_repository,
        name = "raze__automerge_frontend__0_1_0",
        remote = "https://github.com/ttiurani/automerge-rs.git",
        commit = "c4230c029b0e20328fe2f5606e5503ffcd2cc964",
        build_file = Label("//third_party/cargo/remote:automerge-frontend-0.1.0.BUILD.bazel"),
        init_submodules = True,
    )

    maybe(
        new_git_repository,
        name = "raze__automerge_protocol__0_1_0",
        remote = "https://github.com/ttiurani/automerge-rs.git",
        commit = "c4230c029b0e20328fe2f5606e5503ffcd2cc964",
        build_file = Label("//third_party/cargo/remote:automerge-protocol-0.1.0.BUILD.bazel"),
        init_submodules = True,
    )

    maybe(
        http_archive,
        name = "raze__duct__0_13_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/duct/duct-0.13.4.crate",
        type = "tar.gz",
        strip_prefix = "duct-0.13.4",
        build_file = Label("//third_party/cargo/remote:duct-0.13.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fuchsia_cprng__0_1_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/fuchsia-cprng/fuchsia-cprng-0.1.1.crate",
        type = "tar.gz",
        strip_prefix = "fuchsia-cprng-0.1.1",
        build_file = Label("//third_party/cargo/remote:fuchsia-cprng-0.1.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures__0_3_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures/futures-0.3.6.crate",
        type = "tar.gz",
        strip_prefix = "futures-0.3.6",
        build_file = Label("//third_party/cargo/remote:futures-0.3.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_channel__0_3_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-channel/futures-channel-0.3.6.crate",
        type = "tar.gz",
        strip_prefix = "futures-channel-0.3.6",
        build_file = Label("//third_party/cargo/remote:futures-channel-0.3.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_core__0_3_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-core/futures-core-0.3.6.crate",
        type = "tar.gz",
        strip_prefix = "futures-core-0.3.6",
        build_file = Label("//third_party/cargo/remote:futures-core-0.3.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_executor__0_3_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-executor/futures-executor-0.3.6.crate",
        type = "tar.gz",
        strip_prefix = "futures-executor-0.3.6",
        build_file = Label("//third_party/cargo/remote:futures-executor-0.3.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_io__0_3_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-io/futures-io-0.3.6.crate",
        type = "tar.gz",
        strip_prefix = "futures-io-0.3.6",
        build_file = Label("//third_party/cargo/remote:futures-io-0.3.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_macro__0_3_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-macro/futures-macro-0.3.6.crate",
        type = "tar.gz",
        strip_prefix = "futures-macro-0.3.6",
        build_file = Label("//third_party/cargo/remote:futures-macro-0.3.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_sink__0_3_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-sink/futures-sink-0.3.6.crate",
        type = "tar.gz",
        strip_prefix = "futures-sink-0.3.6",
        build_file = Label("//third_party/cargo/remote:futures-sink-0.3.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_task__0_3_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-task/futures-task-0.3.6.crate",
        type = "tar.gz",
        strip_prefix = "futures-task-0.3.6",
        build_file = Label("//third_party/cargo/remote:futures-task-0.3.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_util__0_3_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-util/futures-util-0.3.6.crate",
        type = "tar.gz",
        strip_prefix = "futures-util-0.3.6",
        build_file = Label("//third_party/cargo/remote:futures-util-0.3.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__hex__0_4_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/hex/hex-0.4.2.crate",
        type = "tar.gz",
        strip_prefix = "hex-0.4.2",
        build_file = Label("//third_party/cargo/remote:hex-0.4.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__itoa__0_4_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/itoa/itoa-0.4.6.crate",
        type = "tar.gz",
        sha256 = "dc6f3ad7b9d11a0c00842ff8de1b60ee58661048eb8049ed33c73594f359d7e6",
        strip_prefix = "itoa-0.4.6",
        build_file = Label("//third_party/cargo/remote:itoa-0.4.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__libc__0_2_79",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/libc/libc-0.2.79.crate",
        type = "tar.gz",
        strip_prefix = "libc-0.2.79",
        build_file = Label("//third_party/cargo/remote:libc-0.2.79.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__maplit__1_0_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/maplit/maplit-1.0.2.crate",
        type = "tar.gz",
        strip_prefix = "maplit-1.0.2",
        build_file = Label("//third_party/cargo/remote:maplit-1.0.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__memchr__2_3_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/memchr/memchr-2.3.3.crate",
        type = "tar.gz",
        strip_prefix = "memchr-2.3.3",
        build_file = Label("//third_party/cargo/remote:memchr-2.3.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__once_cell__1_4_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/once_cell/once_cell-1.4.1.crate",
        type = "tar.gz",
        strip_prefix = "once_cell-1.4.1",
        build_file = Label("//third_party/cargo/remote:once_cell-1.4.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__os_pipe__0_9_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/os_pipe/os_pipe-0.9.2.crate",
        type = "tar.gz",
        strip_prefix = "os_pipe-0.9.2",
        build_file = Label("//third_party/cargo/remote:os_pipe-0.9.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pin_project__0_4_27",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/pin-project/pin-project-0.4.27.crate",
        type = "tar.gz",
        strip_prefix = "pin-project-0.4.27",
        build_file = Label("//third_party/cargo/remote:pin-project-0.4.27.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pin_project_internal__0_4_27",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/pin-project-internal/pin-project-internal-0.4.27.crate",
        type = "tar.gz",
        strip_prefix = "pin-project-internal-0.4.27",
        build_file = Label("//third_party/cargo/remote:pin-project-internal-0.4.27.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pin_utils__0_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/pin-utils/pin-utils-0.1.0.crate",
        type = "tar.gz",
        strip_prefix = "pin-utils-0.1.0",
        build_file = Label("//third_party/cargo/remote:pin-utils-0.1.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__proc_macro_hack__0_5_18",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/proc-macro-hack/proc-macro-hack-0.5.18.crate",
        type = "tar.gz",
        strip_prefix = "proc-macro-hack-0.5.18",
        build_file = Label("//third_party/cargo/remote:proc-macro-hack-0.5.18.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__proc_macro_nested__0_1_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/proc-macro-nested/proc-macro-nested-0.1.6.crate",
        type = "tar.gz",
        strip_prefix = "proc-macro-nested-0.1.6",
        build_file = Label("//third_party/cargo/remote:proc-macro-nested-0.1.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__proc_macro2__1_0_24",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/proc-macro2/proc-macro2-1.0.24.crate",
        type = "tar.gz",
        sha256 = "1e0704ee1a7e00d7bb417d0770ea303c1bccbabf0ef1667dae92b5967f5f8a71",
        strip_prefix = "proc-macro2-1.0.24",
        build_file = Label("//third_party/cargo/remote:proc-macro2-1.0.24.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__quote__1_0_7",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/quote/quote-1.0.7.crate",
        type = "tar.gz",
        sha256 = "aa563d17ecb180e500da1cfd2b028310ac758de548efdd203e18f283af693f37",
        strip_prefix = "quote-1.0.7",
        build_file = Label("//third_party/cargo/remote:quote-1.0.7.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand__0_3_23",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rand/rand-0.3.23.crate",
        type = "tar.gz",
        strip_prefix = "rand-0.3.23",
        build_file = Label("//third_party/cargo/remote:rand-0.3.23.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand__0_4_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rand/rand-0.4.6.crate",
        type = "tar.gz",
        strip_prefix = "rand-0.4.6",
        build_file = Label("//third_party/cargo/remote:rand-0.4.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand_core__0_3_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rand_core/rand_core-0.3.1.crate",
        type = "tar.gz",
        strip_prefix = "rand_core-0.3.1",
        build_file = Label("//third_party/cargo/remote:rand_core-0.3.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand_core__0_4_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rand_core/rand_core-0.4.2.crate",
        type = "tar.gz",
        strip_prefix = "rand_core-0.4.2",
        build_file = Label("//third_party/cargo/remote:rand_core-0.4.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rdrand__0_4_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rdrand/rdrand-0.4.0.crate",
        type = "tar.gz",
        strip_prefix = "rdrand-0.4.0",
        build_file = Label("//third_party/cargo/remote:rdrand-0.4.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ryu__1_0_5",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/ryu/ryu-1.0.5.crate",
        type = "tar.gz",
        sha256 = "71d301d4193d031abdd79ff7e3dd721168a9572ef3fe51a1517aba235bd8f86e",
        strip_prefix = "ryu-1.0.5",
        build_file = Label("//third_party/cargo/remote:ryu-1.0.5.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde__1_0_116",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/serde/serde-1.0.116.crate",
        type = "tar.gz",
        sha256 = "96fe57af81d28386a513cbc6858332abc6117cfdb5999647c6444b8f43a370a5",
        strip_prefix = "serde-1.0.116",
        build_file = Label("//third_party/cargo/remote:serde-1.0.116.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_derive__1_0_116",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/serde_derive/serde_derive-1.0.116.crate",
        type = "tar.gz",
        sha256 = "f630a6370fd8e457873b4bd2ffdae75408bc291ba72be773772a4c2a065d9ae8",
        strip_prefix = "serde_derive-1.0.116",
        build_file = Label("//third_party/cargo/remote:serde_derive-1.0.116.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_json__1_0_58",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/serde_json/serde_json-1.0.58.crate",
        type = "tar.gz",
        sha256 = "a230ea9107ca2220eea9d46de97eddcb04cd00e92d13dda78e478dd33fa82bd4",
        strip_prefix = "serde_json-1.0.58",
        build_file = Label("//third_party/cargo/remote:serde_json-1.0.58.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__shared_child__0_3_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/shared_child/shared_child-0.3.4.crate",
        type = "tar.gz",
        strip_prefix = "shared_child-0.3.4",
        build_file = Label("//third_party/cargo/remote:shared_child-0.3.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__slab__0_4_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/slab/slab-0.4.2.crate",
        type = "tar.gz",
        strip_prefix = "slab-0.4.2",
        build_file = Label("//third_party/cargo/remote:slab-0.4.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__syn__1_0_44",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/syn/syn-1.0.44.crate",
        type = "tar.gz",
        strip_prefix = "syn-1.0.44",
        build_file = Label("//third_party/cargo/remote:syn-1.0.44.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__thiserror__1_0_21",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/thiserror/thiserror-1.0.21.crate",
        type = "tar.gz",
        strip_prefix = "thiserror-1.0.21",
        build_file = Label("//third_party/cargo/remote:thiserror-1.0.21.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__thiserror_impl__1_0_21",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/thiserror-impl/thiserror-impl-1.0.21.crate",
        type = "tar.gz",
        strip_prefix = "thiserror-impl-1.0.21",
        build_file = Label("//third_party/cargo/remote:thiserror-impl-1.0.21.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_xid__0_2_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/unicode-xid/unicode-xid-0.2.1.crate",
        type = "tar.gz",
        sha256 = "f7fe0bb3479651439c9112f72b6c505038574c9fbb575ed1bf3b797fa39dd564",
        strip_prefix = "unicode-xid-0.2.1",
        build_file = Label("//third_party/cargo/remote:unicode-xid-0.2.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__uuid__0_5_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/uuid/uuid-0.5.1.crate",
        type = "tar.gz",
        strip_prefix = "uuid-0.5.1",
        build_file = Label("//third_party/cargo/remote:uuid-0.5.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__winapi__0_3_9",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/winapi/winapi-0.3.9.crate",
        type = "tar.gz",
        strip_prefix = "winapi-0.3.9",
        build_file = Label("//third_party/cargo/remote:winapi-0.3.9.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__winapi_i686_pc_windows_gnu__0_4_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/winapi-i686-pc-windows-gnu/winapi-i686-pc-windows-gnu-0.4.0.crate",
        type = "tar.gz",
        strip_prefix = "winapi-i686-pc-windows-gnu-0.4.0",
        build_file = Label("//third_party/cargo/remote:winapi-i686-pc-windows-gnu-0.4.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__winapi_x86_64_pc_windows_gnu__0_4_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/winapi-x86_64-pc-windows-gnu/winapi-x86_64-pc-windows-gnu-0.4.0.crate",
        type = "tar.gz",
        strip_prefix = "winapi-x86_64-pc-windows-gnu-0.4.0",
        build_file = Label("//third_party/cargo/remote:winapi-x86_64-pc-windows-gnu-0.4.0.BUILD.bazel"),
    )
