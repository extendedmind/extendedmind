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
        http_archive,
        name = "raze__addr2line__0_13_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/addr2line/addr2line-0.13.0.crate",
        type = "tar.gz",
        strip_prefix = "addr2line-0.13.0",
        build_file = Label("//third_party/cargo/remote:addr2line-0.13.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__adler__0_2_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/adler/adler-0.2.3.crate",
        type = "tar.gz",
        strip_prefix = "adler-0.2.3",
        build_file = Label("//third_party/cargo/remote:adler-0.2.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__anyhow__1_0_33",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/anyhow/anyhow-1.0.33.crate",
        type = "tar.gz",
        strip_prefix = "anyhow-1.0.33",
        build_file = Label("//third_party/cargo/remote:anyhow-1.0.33.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__arrayvec__0_4_12",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/arrayvec/arrayvec-0.4.12.crate",
        type = "tar.gz",
        strip_prefix = "arrayvec-0.4.12",
        build_file = Label("//third_party/cargo/remote:arrayvec-0.4.12.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_channel__1_5_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-channel/async-channel-1.5.1.crate",
        type = "tar.gz",
        strip_prefix = "async-channel-1.5.1",
        build_file = Label("//third_party/cargo/remote:async-channel-1.5.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_executor__1_3_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-executor/async-executor-1.3.0.crate",
        type = "tar.gz",
        strip_prefix = "async-executor-1.3.0",
        build_file = Label("//third_party/cargo/remote:async-executor-1.3.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_global_executor__1_3_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-global-executor/async-global-executor-1.3.0.crate",
        type = "tar.gz",
        strip_prefix = "async-global-executor-1.3.0",
        build_file = Label("//third_party/cargo/remote:async-global-executor-1.3.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_io__1_1_10",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-io/async-io-1.1.10.crate",
        type = "tar.gz",
        strip_prefix = "async-io-1.1.10",
        build_file = Label("//third_party/cargo/remote:async-io-1.1.10.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_mutex__1_4_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-mutex/async-mutex-1.4.0.crate",
        type = "tar.gz",
        strip_prefix = "async-mutex-1.4.0",
        build_file = Label("//third_party/cargo/remote:async-mutex-1.4.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_std__1_6_5",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-std/async-std-1.6.5.crate",
        type = "tar.gz",
        strip_prefix = "async-std-1.6.5",
        build_file = Label("//third_party/cargo/remote:async-std-1.6.5.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_task__4_0_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-task/async-task-4.0.2.crate",
        type = "tar.gz",
        strip_prefix = "async-task-4.0.2",
        build_file = Label("//third_party/cargo/remote:async-task-4.0.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_trait__0_1_41",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-trait/async-trait-0.1.41.crate",
        type = "tar.gz",
        strip_prefix = "async-trait-0.1.41",
        build_file = Label("//third_party/cargo/remote:async-trait-0.1.41.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__atomic_waker__1_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/atomic-waker/atomic-waker-1.0.0.crate",
        type = "tar.gz",
        strip_prefix = "atomic-waker-1.0.0",
        build_file = Label("//third_party/cargo/remote:atomic-waker-1.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__autocfg__1_0_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/autocfg/autocfg-1.0.1.crate",
        type = "tar.gz",
        strip_prefix = "autocfg-1.0.1",
        build_file = Label("//third_party/cargo/remote:autocfg-1.0.1.BUILD.bazel"),
    )

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
        name = "raze__backtrace__0_3_53",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/backtrace/backtrace-0.3.53.crate",
        type = "tar.gz",
        strip_prefix = "backtrace-0.3.53",
        build_file = Label("//third_party/cargo/remote:backtrace-0.3.53.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__bitfield_rle__0_2_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/bitfield-rle/bitfield-rle-0.2.0.crate",
        type = "tar.gz",
        strip_prefix = "bitfield-rle-0.2.0",
        build_file = Label("//third_party/cargo/remote:bitfield-rle-0.2.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__blake2_rfc__0_2_18",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/blake2-rfc/blake2-rfc-0.2.18.crate",
        type = "tar.gz",
        strip_prefix = "blake2-rfc-0.2.18",
        build_file = Label("//third_party/cargo/remote:blake2-rfc-0.2.18.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__block_buffer__0_7_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/block-buffer/block-buffer-0.7.3.crate",
        type = "tar.gz",
        strip_prefix = "block-buffer-0.7.3",
        build_file = Label("//third_party/cargo/remote:block-buffer-0.7.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__block_padding__0_1_5",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/block-padding/block-padding-0.1.5.crate",
        type = "tar.gz",
        strip_prefix = "block-padding-0.1.5",
        build_file = Label("//third_party/cargo/remote:block-padding-0.1.5.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__blocking__1_0_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/blocking/blocking-1.0.2.crate",
        type = "tar.gz",
        strip_prefix = "blocking-1.0.2",
        build_file = Label("//third_party/cargo/remote:blocking-1.0.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__bumpalo__3_4_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/bumpalo/bumpalo-3.4.0.crate",
        type = "tar.gz",
        strip_prefix = "bumpalo-3.4.0",
        build_file = Label("//third_party/cargo/remote:bumpalo-3.4.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__byte_tools__0_3_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/byte-tools/byte-tools-0.3.1.crate",
        type = "tar.gz",
        strip_prefix = "byte-tools-0.3.1",
        build_file = Label("//third_party/cargo/remote:byte-tools-0.3.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__byteorder__1_3_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/byteorder/byteorder-1.3.4.crate",
        type = "tar.gz",
        strip_prefix = "byteorder-1.3.4",
        build_file = Label("//third_party/cargo/remote:byteorder-1.3.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cache_padded__1_1_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/cache-padded/cache-padded-1.1.1.crate",
        type = "tar.gz",
        strip_prefix = "cache-padded-1.1.1",
        build_file = Label("//third_party/cargo/remote:cache-padded-1.1.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cc__1_0_61",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/cc/cc-1.0.61.crate",
        type = "tar.gz",
        strip_prefix = "cc-1.0.61",
        build_file = Label("//third_party/cargo/remote:cc-1.0.61.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cfg_if__0_1_10",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/cfg-if/cfg-if-0.1.10.crate",
        type = "tar.gz",
        strip_prefix = "cfg-if-0.1.10",
        build_file = Label("//third_party/cargo/remote:cfg-if-0.1.10.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cfg_if__1_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/cfg-if/cfg-if-1.0.0.crate",
        type = "tar.gz",
        strip_prefix = "cfg-if-1.0.0",
        build_file = Label("//third_party/cargo/remote:cfg-if-1.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__clear_on_drop__0_2_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/clear_on_drop/clear_on_drop-0.2.4.crate",
        type = "tar.gz",
        strip_prefix = "clear_on_drop-0.2.4",
        build_file = Label("//third_party/cargo/remote:clear_on_drop-0.2.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__concurrent_queue__1_2_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/concurrent-queue/concurrent-queue-1.2.2.crate",
        type = "tar.gz",
        strip_prefix = "concurrent-queue-1.2.2",
        build_file = Label("//third_party/cargo/remote:concurrent-queue-1.2.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__constant_time_eq__0_1_5",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/constant_time_eq/constant_time_eq-0.1.5.crate",
        type = "tar.gz",
        strip_prefix = "constant_time_eq-0.1.5",
        build_file = Label("//third_party/cargo/remote:constant_time_eq-0.1.5.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__crossbeam_utils__0_7_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/crossbeam-utils/crossbeam-utils-0.7.2.crate",
        type = "tar.gz",
        strip_prefix = "crossbeam-utils-0.7.2",
        build_file = Label("//third_party/cargo/remote:crossbeam-utils-0.7.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__curve25519_dalek__2_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/curve25519-dalek/curve25519-dalek-2.1.0.crate",
        type = "tar.gz",
        strip_prefix = "curve25519-dalek-2.1.0",
        build_file = Label("//third_party/cargo/remote:curve25519-dalek-2.1.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__digest__0_8_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/digest/digest-0.8.1.crate",
        type = "tar.gz",
        strip_prefix = "digest-0.8.1",
        build_file = Label("//third_party/cargo/remote:digest-0.8.1.BUILD.bazel"),
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
        name = "raze__ed25519_dalek__1_0_0_pre_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/ed25519-dalek/ed25519-dalek-1.0.0-pre.3.crate",
        type = "tar.gz",
        strip_prefix = "ed25519-dalek-1.0.0-pre.3",
        build_file = Label("//third_party/cargo/remote:ed25519-dalek-1.0.0-pre.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__event_listener__2_5_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/event-listener/event-listener-2.5.1.crate",
        type = "tar.gz",
        strip_prefix = "event-listener-2.5.1",
        build_file = Label("//third_party/cargo/remote:event-listener-2.5.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__failure__0_1_8",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/failure/failure-0.1.8.crate",
        type = "tar.gz",
        strip_prefix = "failure-0.1.8",
        build_file = Label("//third_party/cargo/remote:failure-0.1.8.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__failure_derive__0_1_8",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/failure_derive/failure_derive-0.1.8.crate",
        type = "tar.gz",
        strip_prefix = "failure_derive-0.1.8",
        build_file = Label("//third_party/cargo/remote:failure_derive-0.1.8.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fake_simd__0_1_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/fake-simd/fake-simd-0.1.2.crate",
        type = "tar.gz",
        strip_prefix = "fake-simd-0.1.2",
        build_file = Label("//third_party/cargo/remote:fake-simd-0.1.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fastrand__1_4_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/fastrand/fastrand-1.4.0.crate",
        type = "tar.gz",
        strip_prefix = "fastrand-1.4.0",
        build_file = Label("//third_party/cargo/remote:fastrand-1.4.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__flat_tree__5_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/flat-tree/flat-tree-5.0.0.crate",
        type = "tar.gz",
        strip_prefix = "flat-tree-5.0.0",
        build_file = Label("//third_party/cargo/remote:flat-tree-5.0.0.BUILD.bazel"),
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
        name = "raze__futures_lite__1_11_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-lite/futures-lite-1.11.1.crate",
        type = "tar.gz",
        strip_prefix = "futures-lite-1.11.1",
        build_file = Label("//third_party/cargo/remote:futures-lite-1.11.1.BUILD.bazel"),
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
        name = "raze__generic_array__0_12_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/generic-array/generic-array-0.12.3.crate",
        type = "tar.gz",
        strip_prefix = "generic-array-0.12.3",
        build_file = Label("//third_party/cargo/remote:generic-array-0.12.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__getrandom__0_1_15",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/getrandom/getrandom-0.1.15.crate",
        type = "tar.gz",
        strip_prefix = "getrandom-0.1.15",
        build_file = Label("//third_party/cargo/remote:getrandom-0.1.15.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__gimli__0_22_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/gimli/gimli-0.22.0.crate",
        type = "tar.gz",
        strip_prefix = "gimli-0.22.0",
        build_file = Label("//third_party/cargo/remote:gimli-0.22.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__gloo_timers__0_2_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/gloo-timers/gloo-timers-0.2.1.crate",
        type = "tar.gz",
        strip_prefix = "gloo-timers-0.2.1",
        build_file = Label("//third_party/cargo/remote:gloo-timers-0.2.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__hermit_abi__0_1_17",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/hermit-abi/hermit-abi-0.1.17.crate",
        type = "tar.gz",
        strip_prefix = "hermit-abi-0.1.17",
        build_file = Label("//third_party/cargo/remote:hermit-abi-0.1.17.BUILD.bazel"),
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
        new_git_repository,
        name = "raze__hypercore__0_11_1_beta_10",
        remote = "https://github.com/datrs/hypercore.git",
        commit = "97ba31844886a4672a0ea8df6412881048bba1cb",
        build_file = Label("//third_party/cargo/remote:hypercore-0.11.1-beta.10.BUILD.bazel"),
        init_submodules = True,
    )

    maybe(
        http_archive,
        name = "raze__instant__0_1_7",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/instant/instant-0.1.7.crate",
        type = "tar.gz",
        strip_prefix = "instant-0.1.7",
        build_file = Label("//third_party/cargo/remote:instant-0.1.7.BUILD.bazel"),
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
        name = "raze__js_sys__0_3_45",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/js-sys/js-sys-0.3.45.crate",
        type = "tar.gz",
        strip_prefix = "js-sys-0.3.45",
        build_file = Label("//third_party/cargo/remote:js-sys-0.3.45.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__kv_log_macro__1_0_7",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/kv-log-macro/kv-log-macro-1.0.7.crate",
        type = "tar.gz",
        strip_prefix = "kv-log-macro-1.0.7",
        build_file = Label("//third_party/cargo/remote:kv-log-macro-1.0.7.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__lazy_static__1_4_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/lazy_static/lazy_static-1.4.0.crate",
        type = "tar.gz",
        strip_prefix = "lazy_static-1.4.0",
        build_file = Label("//third_party/cargo/remote:lazy_static-1.4.0.BUILD.bazel"),
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
        name = "raze__log__0_4_11",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/log/log-0.4.11.crate",
        type = "tar.gz",
        strip_prefix = "log-0.4.11",
        build_file = Label("//third_party/cargo/remote:log-0.4.11.BUILD.bazel"),
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
        name = "raze__memory_pager__0_9_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/memory-pager/memory-pager-0.9.0.crate",
        type = "tar.gz",
        strip_prefix = "memory-pager-0.9.0",
        build_file = Label("//third_party/cargo/remote:memory-pager-0.9.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__merkle_tree_stream__0_12_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/merkle-tree-stream/merkle-tree-stream-0.12.1.crate",
        type = "tar.gz",
        strip_prefix = "merkle-tree-stream-0.12.1",
        build_file = Label("//third_party/cargo/remote:merkle-tree-stream-0.12.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__miniz_oxide__0_4_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/miniz_oxide/miniz_oxide-0.4.3.crate",
        type = "tar.gz",
        strip_prefix = "miniz_oxide-0.4.3",
        build_file = Label("//third_party/cargo/remote:miniz_oxide-0.4.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__mkdirp__1_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/mkdirp/mkdirp-1.0.0.crate",
        type = "tar.gz",
        strip_prefix = "mkdirp-1.0.0",
        build_file = Label("//third_party/cargo/remote:mkdirp-1.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__nb_connect__1_0_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/nb-connect/nb-connect-1.0.2.crate",
        type = "tar.gz",
        strip_prefix = "nb-connect-1.0.2",
        build_file = Label("//third_party/cargo/remote:nb-connect-1.0.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__nodrop__0_1_14",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/nodrop/nodrop-0.1.14.crate",
        type = "tar.gz",
        strip_prefix = "nodrop-0.1.14",
        build_file = Label("//third_party/cargo/remote:nodrop-0.1.14.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__num_cpus__1_13_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/num_cpus/num_cpus-1.13.0.crate",
        type = "tar.gz",
        strip_prefix = "num_cpus-1.13.0",
        build_file = Label("//third_party/cargo/remote:num_cpus-1.13.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__object__0_21_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/object/object-0.21.1.crate",
        type = "tar.gz",
        strip_prefix = "object-0.21.1",
        build_file = Label("//third_party/cargo/remote:object-0.21.1.BUILD.bazel"),
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
        name = "raze__opaque_debug__0_2_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/opaque-debug/opaque-debug-0.2.3.crate",
        type = "tar.gz",
        strip_prefix = "opaque-debug-0.2.3",
        build_file = Label("//third_party/cargo/remote:opaque-debug-0.2.3.BUILD.bazel"),
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
        name = "raze__parking__2_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/parking/parking-2.0.0.crate",
        type = "tar.gz",
        strip_prefix = "parking-2.0.0",
        build_file = Label("//third_party/cargo/remote:parking-2.0.0.BUILD.bazel"),
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
        name = "raze__pin_project_lite__0_1_10",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/pin-project-lite/pin-project-lite-0.1.10.crate",
        type = "tar.gz",
        strip_prefix = "pin-project-lite-0.1.10",
        build_file = Label("//third_party/cargo/remote:pin-project-lite-0.1.10.BUILD.bazel"),
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
        name = "raze__polling__2_0_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/polling/polling-2.0.1.crate",
        type = "tar.gz",
        strip_prefix = "polling-2.0.1",
        build_file = Label("//third_party/cargo/remote:polling-2.0.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ppv_lite86__0_2_9",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/ppv-lite86/ppv-lite86-0.2.9.crate",
        type = "tar.gz",
        strip_prefix = "ppv-lite86-0.2.9",
        build_file = Label("//third_party/cargo/remote:ppv-lite86-0.2.9.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pretty_hash__0_4_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/pretty-hash/pretty-hash-0.4.1.crate",
        type = "tar.gz",
        strip_prefix = "pretty-hash-0.4.1",
        build_file = Label("//third_party/cargo/remote:pretty-hash-0.4.1.BUILD.bazel"),
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
        name = "raze__rand__0_7_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rand/rand-0.7.3.crate",
        type = "tar.gz",
        strip_prefix = "rand-0.7.3",
        build_file = Label("//third_party/cargo/remote:rand-0.7.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand_chacha__0_2_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rand_chacha/rand_chacha-0.2.2.crate",
        type = "tar.gz",
        strip_prefix = "rand_chacha-0.2.2",
        build_file = Label("//third_party/cargo/remote:rand_chacha-0.2.2.BUILD.bazel"),
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
        name = "raze__rand_core__0_5_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rand_core/rand_core-0.5.1.crate",
        type = "tar.gz",
        strip_prefix = "rand_core-0.5.1",
        build_file = Label("//third_party/cargo/remote:rand_core-0.5.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand_hc__0_2_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rand_hc/rand_hc-0.2.0.crate",
        type = "tar.gz",
        strip_prefix = "rand_hc-0.2.0",
        build_file = Label("//third_party/cargo/remote:rand_hc-0.2.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__random_access_disk__2_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/random-access-disk/random-access-disk-2.0.0.crate",
        type = "tar.gz",
        strip_prefix = "random-access-disk-2.0.0",
        build_file = Label("//third_party/cargo/remote:random-access-disk-2.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__random_access_memory__2_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/random-access-memory/random-access-memory-2.0.0.crate",
        type = "tar.gz",
        strip_prefix = "random-access-memory-2.0.0",
        build_file = Label("//third_party/cargo/remote:random-access-memory-2.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__random_access_storage__4_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/random-access-storage/random-access-storage-4.0.0.crate",
        type = "tar.gz",
        strip_prefix = "random-access-storage-4.0.0",
        build_file = Label("//third_party/cargo/remote:random-access-storage-4.0.0.BUILD.bazel"),
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
        name = "raze__rustc_demangle__0_1_17",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rustc-demangle/rustc-demangle-0.1.17.crate",
        type = "tar.gz",
        strip_prefix = "rustc-demangle-0.1.17",
        build_file = Label("//third_party/cargo/remote:rustc-demangle-0.1.17.BUILD.bazel"),
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
        name = "raze__sha2__0_8_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/sha2/sha2-0.8.2.crate",
        type = "tar.gz",
        strip_prefix = "sha2-0.8.2",
        build_file = Label("//third_party/cargo/remote:sha2-0.8.2.BUILD.bazel"),
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
        name = "raze__sleep_parser__0_8_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/sleep-parser/sleep-parser-0.8.0.crate",
        type = "tar.gz",
        strip_prefix = "sleep-parser-0.8.0",
        build_file = Label("//third_party/cargo/remote:sleep-parser-0.8.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sparse_bitfield__0_11_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/sparse-bitfield/sparse-bitfield-0.11.0.crate",
        type = "tar.gz",
        strip_prefix = "sparse-bitfield-0.11.0",
        build_file = Label("//third_party/cargo/remote:sparse-bitfield-0.11.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__subtle__2_3_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/subtle/subtle-2.3.0.crate",
        type = "tar.gz",
        strip_prefix = "subtle-2.3.0",
        build_file = Label("//third_party/cargo/remote:subtle-2.3.0.BUILD.bazel"),
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
        name = "raze__synstructure__0_12_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/synstructure/synstructure-0.12.4.crate",
        type = "tar.gz",
        strip_prefix = "synstructure-0.12.4",
        build_file = Label("//third_party/cargo/remote:synstructure-0.12.4.BUILD.bazel"),
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
        name = "raze__tree_index__0_6_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/tree-index/tree-index-0.6.1.crate",
        type = "tar.gz",
        strip_prefix = "tree-index-0.6.1",
        build_file = Label("//third_party/cargo/remote:tree-index-0.6.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__typenum__1_12_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/typenum/typenum-1.12.0.crate",
        type = "tar.gz",
        strip_prefix = "typenum-1.12.0",
        build_file = Label("//third_party/cargo/remote:typenum-1.12.0.BUILD.bazel"),
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
        name = "raze__varinteger__1_0_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/varinteger/varinteger-1.0.6.crate",
        type = "tar.gz",
        strip_prefix = "varinteger-1.0.6",
        build_file = Label("//third_party/cargo/remote:varinteger-1.0.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__vec_arena__1_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/vec-arena/vec-arena-1.0.0.crate",
        type = "tar.gz",
        strip_prefix = "vec-arena-1.0.0",
        build_file = Label("//third_party/cargo/remote:vec-arena-1.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__waker_fn__1_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/waker-fn/waker-fn-1.1.0.crate",
        type = "tar.gz",
        strip_prefix = "waker-fn-1.1.0",
        build_file = Label("//third_party/cargo/remote:waker-fn-1.1.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasi__0_9_0_wasi_snapshot_preview1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/wasi/wasi-0.9.0+wasi-snapshot-preview1.crate",
        type = "tar.gz",
        strip_prefix = "wasi-0.9.0+wasi-snapshot-preview1",
        build_file = Label("//third_party/cargo/remote:wasi-0.9.0+wasi-snapshot-preview1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen__0_2_68",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/wasm-bindgen/wasm-bindgen-0.2.68.crate",
        type = "tar.gz",
        strip_prefix = "wasm-bindgen-0.2.68",
        build_file = Label("//third_party/cargo/remote:wasm-bindgen-0.2.68.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_backend__0_2_68",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/wasm-bindgen-backend/wasm-bindgen-backend-0.2.68.crate",
        type = "tar.gz",
        strip_prefix = "wasm-bindgen-backend-0.2.68",
        build_file = Label("//third_party/cargo/remote:wasm-bindgen-backend-0.2.68.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_futures__0_4_18",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/wasm-bindgen-futures/wasm-bindgen-futures-0.4.18.crate",
        type = "tar.gz",
        strip_prefix = "wasm-bindgen-futures-0.4.18",
        build_file = Label("//third_party/cargo/remote:wasm-bindgen-futures-0.4.18.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_macro__0_2_68",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/wasm-bindgen-macro/wasm-bindgen-macro-0.2.68.crate",
        type = "tar.gz",
        strip_prefix = "wasm-bindgen-macro-0.2.68",
        build_file = Label("//third_party/cargo/remote:wasm-bindgen-macro-0.2.68.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_macro_support__0_2_68",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/wasm-bindgen-macro-support/wasm-bindgen-macro-support-0.2.68.crate",
        type = "tar.gz",
        strip_prefix = "wasm-bindgen-macro-support-0.2.68",
        build_file = Label("//third_party/cargo/remote:wasm-bindgen-macro-support-0.2.68.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_shared__0_2_68",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/wasm-bindgen-shared/wasm-bindgen-shared-0.2.68.crate",
        type = "tar.gz",
        strip_prefix = "wasm-bindgen-shared-0.2.68",
        build_file = Label("//third_party/cargo/remote:wasm-bindgen-shared-0.2.68.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__web_sys__0_3_45",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/web-sys/web-sys-0.3.45.crate",
        type = "tar.gz",
        strip_prefix = "web-sys-0.3.45",
        build_file = Label("//third_party/cargo/remote:web-sys-0.3.45.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wepoll_sys__3_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/wepoll-sys/wepoll-sys-3.0.0.crate",
        type = "tar.gz",
        strip_prefix = "wepoll-sys-3.0.0",
        build_file = Label("//third_party/cargo/remote:wepoll-sys-3.0.0.BUILD.bazel"),
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

    maybe(
        http_archive,
        name = "raze__zeroize__1_1_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/zeroize/zeroize-1.1.1.crate",
        type = "tar.gz",
        strip_prefix = "zeroize-1.1.1",
        build_file = Label("//third_party/cargo/remote:zeroize-1.1.1.BUILD.bazel"),
    )
