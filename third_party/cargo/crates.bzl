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
        name = "raze__actix_codec__0_3_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/actix-codec/actix-codec-0.3.0.crate",
        type = "tar.gz",
        strip_prefix = "actix-codec-0.3.0",
        build_file = Label("//third_party/cargo/remote:actix-codec-0.3.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__actix_connect__2_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/actix-connect/actix-connect-2.0.0.crate",
        type = "tar.gz",
        strip_prefix = "actix-connect-2.0.0",
        build_file = Label("//third_party/cargo/remote:actix-connect-2.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__actix_http__2_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/actix-http/actix-http-2.0.0.crate",
        type = "tar.gz",
        strip_prefix = "actix-http-2.0.0",
        build_file = Label("//third_party/cargo/remote:actix-http-2.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__actix_macros__0_1_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/actix-macros/actix-macros-0.1.2.crate",
        type = "tar.gz",
        strip_prefix = "actix-macros-0.1.2",
        build_file = Label("//third_party/cargo/remote:actix-macros-0.1.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__actix_protobuf__0_6_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/actix-protobuf/actix-protobuf-0.6.0.crate",
        type = "tar.gz",
        strip_prefix = "actix-protobuf-0.6.0",
        build_file = Label("//third_party/cargo/remote:actix-protobuf-0.6.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__actix_router__0_2_5",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/actix-router/actix-router-0.2.5.crate",
        type = "tar.gz",
        strip_prefix = "actix-router-0.2.5",
        build_file = Label("//third_party/cargo/remote:actix-router-0.2.5.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__actix_rt__1_1_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/actix-rt/actix-rt-1.1.1.crate",
        type = "tar.gz",
        strip_prefix = "actix-rt-1.1.1",
        build_file = Label("//third_party/cargo/remote:actix-rt-1.1.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__actix_server__1_0_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/actix-server/actix-server-1.0.4.crate",
        type = "tar.gz",
        strip_prefix = "actix-server-1.0.4",
        build_file = Label("//third_party/cargo/remote:actix-server-1.0.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__actix_service__1_0_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/actix-service/actix-service-1.0.6.crate",
        type = "tar.gz",
        strip_prefix = "actix-service-1.0.6",
        build_file = Label("//third_party/cargo/remote:actix-service-1.0.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__actix_testing__1_0_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/actix-testing/actix-testing-1.0.1.crate",
        type = "tar.gz",
        strip_prefix = "actix-testing-1.0.1",
        build_file = Label("//third_party/cargo/remote:actix-testing-1.0.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__actix_threadpool__0_3_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/actix-threadpool/actix-threadpool-0.3.3.crate",
        type = "tar.gz",
        strip_prefix = "actix-threadpool-0.3.3",
        build_file = Label("//third_party/cargo/remote:actix-threadpool-0.3.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__actix_tls__2_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/actix-tls/actix-tls-2.0.0.crate",
        type = "tar.gz",
        strip_prefix = "actix-tls-2.0.0",
        build_file = Label("//third_party/cargo/remote:actix-tls-2.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__actix_utils__2_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/actix-utils/actix-utils-2.0.0.crate",
        type = "tar.gz",
        strip_prefix = "actix-utils-2.0.0",
        build_file = Label("//third_party/cargo/remote:actix-utils-2.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__actix_web__3_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/actix-web/actix-web-3.1.0.crate",
        type = "tar.gz",
        strip_prefix = "actix-web-3.1.0",
        build_file = Label("//third_party/cargo/remote:actix-web-3.1.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__actix_web_codegen__0_3_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/actix-web-codegen/actix-web-codegen-0.3.0.crate",
        type = "tar.gz",
        strip_prefix = "actix-web-codegen-0.3.0",
        build_file = Label("//third_party/cargo/remote:actix-web-codegen-0.3.0.BUILD.bazel"),
    )

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
        name = "raze__aead__0_3_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/aead/aead-0.3.2.crate",
        type = "tar.gz",
        strip_prefix = "aead-0.3.2",
        build_file = Label("//third_party/cargo/remote:aead-0.3.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aes__0_5_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/aes/aes-0.5.0.crate",
        type = "tar.gz",
        strip_prefix = "aes-0.5.0",
        build_file = Label("//third_party/cargo/remote:aes-0.5.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aes_gcm__0_7_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/aes-gcm/aes-gcm-0.7.0.crate",
        type = "tar.gz",
        strip_prefix = "aes-gcm-0.7.0",
        build_file = Label("//third_party/cargo/remote:aes-gcm-0.7.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aes_soft__0_5_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/aes-soft/aes-soft-0.5.0.crate",
        type = "tar.gz",
        strip_prefix = "aes-soft-0.5.0",
        build_file = Label("//third_party/cargo/remote:aes-soft-0.5.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aesni__0_8_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/aesni/aesni-0.8.0.crate",
        type = "tar.gz",
        strip_prefix = "aesni-0.8.0",
        build_file = Label("//third_party/cargo/remote:aesni-0.8.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aho_corasick__0_7_14",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/aho-corasick/aho-corasick-0.7.14.crate",
        type = "tar.gz",
        strip_prefix = "aho-corasick-0.7.14",
        build_file = Label("//third_party/cargo/remote:aho-corasick-0.7.14.BUILD.bazel"),
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
        name = "raze__arc_swap__0_4_7",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/arc-swap/arc-swap-0.4.7.crate",
        type = "tar.gz",
        strip_prefix = "arc-swap-0.4.7",
        build_file = Label("//third_party/cargo/remote:arc-swap-0.4.7.BUILD.bazel"),
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
        name = "raze__async_global_executor__1_4_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-global-executor/async-global-executor-1.4.2.crate",
        type = "tar.gz",
        strip_prefix = "async-global-executor-1.4.2",
        build_file = Label("//third_party/cargo/remote:async-global-executor-1.4.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_io__1_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-io/async-io-1.1.0.crate",
        type = "tar.gz",
        strip_prefix = "async-io-1.1.0",
        build_file = Label("//third_party/cargo/remote:async-io-1.1.0.BUILD.bazel"),
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
        name = "raze__async_task__4_0_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-task/async-task-4.0.3.crate",
        type = "tar.gz",
        strip_prefix = "async-task-4.0.3",
        build_file = Label("//third_party/cargo/remote:async-task-4.0.3.BUILD.bazel"),
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
        name = "raze__async_tungstenite__0_9_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-tungstenite/async-tungstenite-0.9.3.crate",
        type = "tar.gz",
        strip_prefix = "async-tungstenite-0.9.3",
        build_file = Label("//third_party/cargo/remote:async-tungstenite-0.9.3.BUILD.bazel"),
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
        name = "raze__awc__2_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/awc/awc-2.0.0.crate",
        type = "tar.gz",
        strip_prefix = "awc-2.0.0",
        build_file = Label("//third_party/cargo/remote:awc-2.0.0.BUILD.bazel"),
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
        name = "raze__base_x__0_2_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/base-x/base-x-0.2.6.crate",
        type = "tar.gz",
        strip_prefix = "base-x-0.2.6",
        build_file = Label("//third_party/cargo/remote:base-x-0.2.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__base64__0_12_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/base64/base64-0.12.3.crate",
        type = "tar.gz",
        strip_prefix = "base64-0.12.3",
        build_file = Label("//third_party/cargo/remote:base64-0.12.3.BUILD.bazel"),
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
        name = "raze__bitflags__1_2_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/bitflags/bitflags-1.2.1.crate",
        type = "tar.gz",
        strip_prefix = "bitflags-1.2.1",
        build_file = Label("//third_party/cargo/remote:bitflags-1.2.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__blake2__0_9_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/blake2/blake2-0.9.0.crate",
        type = "tar.gz",
        strip_prefix = "blake2-0.9.0",
        build_file = Label("//third_party/cargo/remote:blake2-0.9.0.BUILD.bazel"),
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
        name = "raze__block_buffer__0_9_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/block-buffer/block-buffer-0.9.0.crate",
        type = "tar.gz",
        strip_prefix = "block-buffer-0.9.0",
        build_file = Label("//third_party/cargo/remote:block-buffer-0.9.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__block_cipher__0_8_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/block-cipher/block-cipher-0.8.0.crate",
        type = "tar.gz",
        strip_prefix = "block-cipher-0.8.0",
        build_file = Label("//third_party/cargo/remote:block-cipher-0.8.0.BUILD.bazel"),
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
        name = "raze__brotli_sys__0_3_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/brotli-sys/brotli-sys-0.3.2.crate",
        type = "tar.gz",
        strip_prefix = "brotli-sys-0.3.2",
        build_file = Label("//third_party/cargo/remote:brotli-sys-0.3.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__brotli2__0_3_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/brotli2/brotli2-0.3.2.crate",
        type = "tar.gz",
        strip_prefix = "brotli2-0.3.2",
        build_file = Label("//third_party/cargo/remote:brotli2-0.3.2.BUILD.bazel"),
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
        name = "raze__bytes__0_5_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/bytes/bytes-0.5.6.crate",
        type = "tar.gz",
        strip_prefix = "bytes-0.5.6",
        build_file = Label("//third_party/cargo/remote:bytes-0.5.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__bytestring__0_1_5",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/bytestring/bytestring-0.1.5.crate",
        type = "tar.gz",
        strip_prefix = "bytestring-0.1.5",
        build_file = Label("//third_party/cargo/remote:bytestring-0.1.5.BUILD.bazel"),
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
        name = "raze__chacha20__0_5_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/chacha20/chacha20-0.5.0.crate",
        type = "tar.gz",
        strip_prefix = "chacha20-0.5.0",
        build_file = Label("//third_party/cargo/remote:chacha20-0.5.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__chacha20poly1305__0_6_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/chacha20poly1305/chacha20poly1305-0.6.0.crate",
        type = "tar.gz",
        strip_prefix = "chacha20poly1305-0.6.0",
        build_file = Label("//third_party/cargo/remote:chacha20poly1305-0.6.0.BUILD.bazel"),
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
        name = "raze__cloudabi__0_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/cloudabi/cloudabi-0.1.0.crate",
        type = "tar.gz",
        strip_prefix = "cloudabi-0.1.0",
        build_file = Label("//third_party/cargo/remote:cloudabi-0.1.0.BUILD.bazel"),
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
        name = "raze__const_fn__0_4_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/const_fn/const_fn-0.4.2.crate",
        type = "tar.gz",
        strip_prefix = "const_fn-0.4.2",
        build_file = Label("//third_party/cargo/remote:const_fn-0.4.2.BUILD.bazel"),
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
        name = "raze__cookie__0_14_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/cookie/cookie-0.14.2.crate",
        type = "tar.gz",
        strip_prefix = "cookie-0.14.2",
        build_file = Label("//third_party/cargo/remote:cookie-0.14.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__copyless__0_1_5",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/copyless/copyless-0.1.5.crate",
        type = "tar.gz",
        strip_prefix = "copyless-0.1.5",
        build_file = Label("//third_party/cargo/remote:copyless-0.1.5.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__core_foundation__0_7_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/core-foundation/core-foundation-0.7.0.crate",
        type = "tar.gz",
        strip_prefix = "core-foundation-0.7.0",
        build_file = Label("//third_party/cargo/remote:core-foundation-0.7.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__core_foundation_sys__0_7_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/core-foundation-sys/core-foundation-sys-0.7.0.crate",
        type = "tar.gz",
        strip_prefix = "core-foundation-sys-0.7.0",
        build_file = Label("//third_party/cargo/remote:core-foundation-sys-0.7.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cpuid_bool__0_1_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/cpuid-bool/cpuid-bool-0.1.2.crate",
        type = "tar.gz",
        strip_prefix = "cpuid-bool-0.1.2",
        build_file = Label("//third_party/cargo/remote:cpuid-bool-0.1.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__crc32fast__1_2_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/crc32fast/crc32fast-1.2.0.crate",
        type = "tar.gz",
        strip_prefix = "crc32fast-1.2.0",
        build_file = Label("//third_party/cargo/remote:crc32fast-1.2.0.BUILD.bazel"),
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
        name = "raze__crypto_mac__0_8_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/crypto-mac/crypto-mac-0.8.0.crate",
        type = "tar.gz",
        strip_prefix = "crypto-mac-0.8.0",
        build_file = Label("//third_party/cargo/remote:crypto-mac-0.8.0.BUILD.bazel"),
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
        name = "raze__curve25519_dalek__3_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/curve25519-dalek/curve25519-dalek-3.0.0.crate",
        type = "tar.gz",
        strip_prefix = "curve25519-dalek-3.0.0",
        build_file = Label("//third_party/cargo/remote:curve25519-dalek-3.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__derive_more__0_99_11",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/derive_more/derive_more-0.99.11.crate",
        type = "tar.gz",
        strip_prefix = "derive_more-0.99.11",
        build_file = Label("//third_party/cargo/remote:derive_more-0.99.11.BUILD.bazel"),
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
        name = "raze__digest__0_9_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/digest/digest-0.9.0.crate",
        type = "tar.gz",
        strip_prefix = "digest-0.9.0",
        build_file = Label("//third_party/cargo/remote:digest-0.9.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__discard__1_0_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/discard/discard-1.0.4.crate",
        type = "tar.gz",
        strip_prefix = "discard-1.0.4",
        build_file = Label("//third_party/cargo/remote:discard-1.0.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__dtoa__0_4_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/dtoa/dtoa-0.4.6.crate",
        type = "tar.gz",
        strip_prefix = "dtoa-0.4.6",
        build_file = Label("//third_party/cargo/remote:dtoa-0.4.6.BUILD.bazel"),
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
        name = "raze__either__1_6_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/either/either-1.6.1.crate",
        type = "tar.gz",
        strip_prefix = "either-1.6.1",
        build_file = Label("//third_party/cargo/remote:either-1.6.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__encoding_rs__0_8_24",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/encoding_rs/encoding_rs-0.8.24.crate",
        type = "tar.gz",
        strip_prefix = "encoding_rs-0.8.24",
        build_file = Label("//third_party/cargo/remote:encoding_rs-0.8.24.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__enum_as_inner__0_3_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/enum-as-inner/enum-as-inner-0.3.3.crate",
        type = "tar.gz",
        strip_prefix = "enum-as-inner-0.3.3",
        build_file = Label("//third_party/cargo/remote:enum-as-inner-0.3.3.BUILD.bazel"),
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
        name = "raze__fixedbitset__0_2_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/fixedbitset/fixedbitset-0.2.0.crate",
        type = "tar.gz",
        strip_prefix = "fixedbitset-0.2.0",
        build_file = Label("//third_party/cargo/remote:fixedbitset-0.2.0.BUILD.bazel"),
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
        name = "raze__flate2__1_0_18",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/flate2/flate2-1.0.18.crate",
        type = "tar.gz",
        strip_prefix = "flate2-1.0.18",
        build_file = Label("//third_party/cargo/remote:flate2-1.0.18.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fnv__1_0_7",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/fnv/fnv-1.0.7.crate",
        type = "tar.gz",
        strip_prefix = "fnv-1.0.7",
        build_file = Label("//third_party/cargo/remote:fnv-1.0.7.BUILD.bazel"),
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
        name = "raze__fuchsia_zircon__0_3_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/fuchsia-zircon/fuchsia-zircon-0.3.3.crate",
        type = "tar.gz",
        strip_prefix = "fuchsia-zircon-0.3.3",
        build_file = Label("//third_party/cargo/remote:fuchsia-zircon-0.3.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fuchsia_zircon_sys__0_3_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/fuchsia-zircon-sys/fuchsia-zircon-sys-0.3.3.crate",
        type = "tar.gz",
        strip_prefix = "fuchsia-zircon-sys-0.3.3",
        build_file = Label("//third_party/cargo/remote:fuchsia-zircon-sys-0.3.3.BUILD.bazel"),
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
        name = "raze__futures_timer__3_0_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-timer/futures-timer-3.0.2.crate",
        type = "tar.gz",
        strip_prefix = "futures-timer-3.0.2",
        build_file = Label("//third_party/cargo/remote:futures-timer-3.0.2.BUILD.bazel"),
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
        name = "raze__fxhash__0_2_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/fxhash/fxhash-0.2.1.crate",
        type = "tar.gz",
        strip_prefix = "fxhash-0.2.1",
        build_file = Label("//third_party/cargo/remote:fxhash-0.2.1.BUILD.bazel"),
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
        name = "raze__generic_array__0_14_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/generic-array/generic-array-0.14.4.crate",
        type = "tar.gz",
        strip_prefix = "generic-array-0.14.4",
        build_file = Label("//third_party/cargo/remote:generic-array-0.14.4.BUILD.bazel"),
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
        name = "raze__ghash__0_3_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/ghash/ghash-0.3.0.crate",
        type = "tar.gz",
        strip_prefix = "ghash-0.3.0",
        build_file = Label("//third_party/cargo/remote:ghash-0.3.0.BUILD.bazel"),
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
        name = "raze__h2__0_2_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/h2/h2-0.2.6.crate",
        type = "tar.gz",
        strip_prefix = "h2-0.2.6",
        build_file = Label("//third_party/cargo/remote:h2-0.2.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__hashbrown__0_9_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/hashbrown/hashbrown-0.9.1.crate",
        type = "tar.gz",
        strip_prefix = "hashbrown-0.9.1",
        build_file = Label("//third_party/cargo/remote:hashbrown-0.9.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__heck__0_3_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/heck/heck-0.3.1.crate",
        type = "tar.gz",
        strip_prefix = "heck-0.3.1",
        build_file = Label("//third_party/cargo/remote:heck-0.3.1.BUILD.bazel"),
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
        http_archive,
        name = "raze__hostname__0_3_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/hostname/hostname-0.3.1.crate",
        type = "tar.gz",
        strip_prefix = "hostname-0.3.1",
        build_file = Label("//third_party/cargo/remote:hostname-0.3.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__http__0_2_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/http/http-0.2.1.crate",
        type = "tar.gz",
        strip_prefix = "http-0.2.1",
        build_file = Label("//third_party/cargo/remote:http-0.2.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__httparse__1_3_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/httparse/httparse-1.3.4.crate",
        type = "tar.gz",
        strip_prefix = "httparse-1.3.4",
        build_file = Label("//third_party/cargo/remote:httparse-1.3.4.BUILD.bazel"),
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
        new_git_repository,
        name = "raze__hypercore_protocol__0_0_2",
        remote = "https://github.com/ttiurani/hypercore-protocol-rs.git",
        commit = "846b52568b4c78127993b19e5c8888c464bbbf4d",
        build_file = Label("//third_party/cargo/remote:hypercore-protocol-0.0.2.BUILD.bazel"),
        init_submodules = True,
    )

    maybe(
        http_archive,
        name = "raze__idna__0_2_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/idna/idna-0.2.0.crate",
        type = "tar.gz",
        strip_prefix = "idna-0.2.0",
        build_file = Label("//third_party/cargo/remote:idna-0.2.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__indexmap__1_6_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/indexmap/indexmap-1.6.0.crate",
        type = "tar.gz",
        strip_prefix = "indexmap-1.6.0",
        build_file = Label("//third_party/cargo/remote:indexmap-1.6.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__input_buffer__0_3_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/input_buffer/input_buffer-0.3.1.crate",
        type = "tar.gz",
        strip_prefix = "input_buffer-0.3.1",
        build_file = Label("//third_party/cargo/remote:input_buffer-0.3.1.BUILD.bazel"),
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
        name = "raze__iovec__0_1_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/iovec/iovec-0.1.4.crate",
        type = "tar.gz",
        strip_prefix = "iovec-0.1.4",
        build_file = Label("//third_party/cargo/remote:iovec-0.1.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ipconfig__0_2_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/ipconfig/ipconfig-0.2.2.crate",
        type = "tar.gz",
        strip_prefix = "ipconfig-0.2.2",
        build_file = Label("//third_party/cargo/remote:ipconfig-0.2.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__itertools__0_8_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/itertools/itertools-0.8.2.crate",
        type = "tar.gz",
        strip_prefix = "itertools-0.8.2",
        build_file = Label("//third_party/cargo/remote:itertools-0.8.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__itoa__0_4_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/itoa/itoa-0.4.6.crate",
        type = "tar.gz",
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
        name = "raze__kernel32_sys__0_2_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/kernel32-sys/kernel32-sys-0.2.2.crate",
        type = "tar.gz",
        strip_prefix = "kernel32-sys-0.2.2",
        build_file = Label("//third_party/cargo/remote:kernel32-sys-0.2.2.BUILD.bazel"),
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
        name = "raze__language_tags__0_2_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/language-tags/language-tags-0.2.2.crate",
        type = "tar.gz",
        strip_prefix = "language-tags-0.2.2",
        build_file = Label("//third_party/cargo/remote:language-tags-0.2.2.BUILD.bazel"),
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
        name = "raze__libc__0_2_76",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/libc/libc-0.2.76.crate",
        type = "tar.gz",
        strip_prefix = "libc-0.2.76",
        build_file = Label("//third_party/cargo/remote:libc-0.2.76.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__linked_hash_map__0_5_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/linked-hash-map/linked-hash-map-0.5.3.crate",
        type = "tar.gz",
        strip_prefix = "linked-hash-map-0.5.3",
        build_file = Label("//third_party/cargo/remote:linked-hash-map-0.5.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__lock_api__0_4_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/lock_api/lock_api-0.4.1.crate",
        type = "tar.gz",
        strip_prefix = "lock_api-0.4.1",
        build_file = Label("//third_party/cargo/remote:lock_api-0.4.1.BUILD.bazel"),
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
        name = "raze__lru_cache__0_1_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/lru-cache/lru-cache-0.1.2.crate",
        type = "tar.gz",
        strip_prefix = "lru-cache-0.1.2",
        build_file = Label("//third_party/cargo/remote:lru-cache-0.1.2.BUILD.bazel"),
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
        name = "raze__match_cfg__0_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/match_cfg/match_cfg-0.1.0.crate",
        type = "tar.gz",
        strip_prefix = "match_cfg-0.1.0",
        build_file = Label("//third_party/cargo/remote:match_cfg-0.1.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__matches__0_1_8",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/matches/matches-0.1.8.crate",
        type = "tar.gz",
        strip_prefix = "matches-0.1.8",
        build_file = Label("//third_party/cargo/remote:matches-0.1.8.BUILD.bazel"),
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
        name = "raze__mime__0_3_16",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/mime/mime-0.3.16.crate",
        type = "tar.gz",
        strip_prefix = "mime-0.3.16",
        build_file = Label("//third_party/cargo/remote:mime-0.3.16.BUILD.bazel"),
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
        name = "raze__mio__0_6_22",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/mio/mio-0.6.22.crate",
        type = "tar.gz",
        strip_prefix = "mio-0.6.22",
        build_file = Label("//third_party/cargo/remote:mio-0.6.22.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__mio_uds__0_6_8",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/mio-uds/mio-uds-0.6.8.crate",
        type = "tar.gz",
        strip_prefix = "mio-uds-0.6.8",
        build_file = Label("//third_party/cargo/remote:mio-uds-0.6.8.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__miow__0_2_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/miow/miow-0.2.1.crate",
        type = "tar.gz",
        strip_prefix = "miow-0.2.1",
        build_file = Label("//third_party/cargo/remote:miow-0.2.1.BUILD.bazel"),
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
        name = "raze__multimap__0_8_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/multimap/multimap-0.8.2.crate",
        type = "tar.gz",
        strip_prefix = "multimap-0.8.2",
        build_file = Label("//third_party/cargo/remote:multimap-0.8.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__net2__0_2_35",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/net2/net2-0.2.35.crate",
        type = "tar.gz",
        strip_prefix = "net2-0.2.35",
        build_file = Label("//third_party/cargo/remote:net2-0.2.35.BUILD.bazel"),
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
        name = "raze__opaque_debug__0_3_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/opaque-debug/opaque-debug-0.3.0.crate",
        type = "tar.gz",
        strip_prefix = "opaque-debug-0.3.0",
        build_file = Label("//third_party/cargo/remote:opaque-debug-0.3.0.BUILD.bazel"),
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
        name = "raze__parking_lot__0_11_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/parking_lot/parking_lot-0.11.0.crate",
        type = "tar.gz",
        strip_prefix = "parking_lot-0.11.0",
        build_file = Label("//third_party/cargo/remote:parking_lot-0.11.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__parking_lot_core__0_8_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/parking_lot_core/parking_lot_core-0.8.0.crate",
        type = "tar.gz",
        strip_prefix = "parking_lot_core-0.8.0",
        build_file = Label("//third_party/cargo/remote:parking_lot_core-0.8.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__percent_encoding__2_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/percent-encoding/percent-encoding-2.1.0.crate",
        type = "tar.gz",
        strip_prefix = "percent-encoding-2.1.0",
        build_file = Label("//third_party/cargo/remote:percent-encoding-2.1.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__petgraph__0_5_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/petgraph/petgraph-0.5.1.crate",
        type = "tar.gz",
        strip_prefix = "petgraph-0.5.1",
        build_file = Label("//third_party/cargo/remote:petgraph-0.5.1.BUILD.bazel"),
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
        name = "raze__pin_project__1_0_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/pin-project/pin-project-1.0.1.crate",
        type = "tar.gz",
        strip_prefix = "pin-project-1.0.1",
        build_file = Label("//third_party/cargo/remote:pin-project-1.0.1.BUILD.bazel"),
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
        name = "raze__pin_project_internal__1_0_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/pin-project-internal/pin-project-internal-1.0.1.crate",
        type = "tar.gz",
        strip_prefix = "pin-project-internal-1.0.1",
        build_file = Label("//third_party/cargo/remote:pin-project-internal-1.0.1.BUILD.bazel"),
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
        name = "raze__polling__1_0_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/polling/polling-1.0.2.crate",
        type = "tar.gz",
        strip_prefix = "polling-1.0.2",
        build_file = Label("//third_party/cargo/remote:polling-1.0.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__poly1305__0_6_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/poly1305/poly1305-0.6.1.crate",
        type = "tar.gz",
        strip_prefix = "poly1305-0.6.1",
        build_file = Label("//third_party/cargo/remote:poly1305-0.6.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__polyval__0_4_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/polyval/polyval-0.4.1.crate",
        type = "tar.gz",
        strip_prefix = "polyval-0.4.1",
        build_file = Label("//third_party/cargo/remote:polyval-0.4.1.BUILD.bazel"),
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
        strip_prefix = "proc-macro2-1.0.24",
        build_file = Label("//third_party/cargo/remote:proc-macro2-1.0.24.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__prost__0_6_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/prost/prost-0.6.1.crate",
        type = "tar.gz",
        strip_prefix = "prost-0.6.1",
        build_file = Label("//third_party/cargo/remote:prost-0.6.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__prost_build__0_6_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/prost-build/prost-build-0.6.1.crate",
        type = "tar.gz",
        strip_prefix = "prost-build-0.6.1",
        build_file = Label("//third_party/cargo/remote:prost-build-0.6.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__prost_derive__0_6_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/prost-derive/prost-derive-0.6.1.crate",
        type = "tar.gz",
        strip_prefix = "prost-derive-0.6.1",
        build_file = Label("//third_party/cargo/remote:prost-derive-0.6.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__prost_types__0_6_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/prost-types/prost-types-0.6.1.crate",
        type = "tar.gz",
        strip_prefix = "prost-types-0.6.1",
        build_file = Label("//third_party/cargo/remote:prost-types-0.6.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__quick_error__1_2_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/quick-error/quick-error-1.2.3.crate",
        type = "tar.gz",
        strip_prefix = "quick-error-1.2.3",
        build_file = Label("//third_party/cargo/remote:quick-error-1.2.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__quote__1_0_7",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/quote/quote-1.0.7.crate",
        type = "tar.gz",
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
        name = "raze__redox_syscall__0_1_57",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/redox_syscall/redox_syscall-0.1.57.crate",
        type = "tar.gz",
        strip_prefix = "redox_syscall-0.1.57",
        build_file = Label("//third_party/cargo/remote:redox_syscall-0.1.57.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__regex__1_4_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/regex/regex-1.4.1.crate",
        type = "tar.gz",
        strip_prefix = "regex-1.4.1",
        build_file = Label("//third_party/cargo/remote:regex-1.4.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__regex_syntax__0_6_20",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/regex-syntax/regex-syntax-0.6.20.crate",
        type = "tar.gz",
        strip_prefix = "regex-syntax-0.6.20",
        build_file = Label("//third_party/cargo/remote:regex-syntax-0.6.20.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__remove_dir_all__0_5_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/remove_dir_all/remove_dir_all-0.5.3.crate",
        type = "tar.gz",
        strip_prefix = "remove_dir_all-0.5.3",
        build_file = Label("//third_party/cargo/remote:remove_dir_all-0.5.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__resolv_conf__0_6_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/resolv-conf/resolv-conf-0.6.3.crate",
        type = "tar.gz",
        strip_prefix = "resolv-conf-0.6.3",
        build_file = Label("//third_party/cargo/remote:resolv-conf-0.6.3.BUILD.bazel"),
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
        name = "raze__rustc_version__0_2_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rustc_version/rustc_version-0.2.3.crate",
        type = "tar.gz",
        strip_prefix = "rustc_version-0.2.3",
        build_file = Label("//third_party/cargo/remote:rustc_version-0.2.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ryu__1_0_5",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/ryu/ryu-1.0.5.crate",
        type = "tar.gz",
        strip_prefix = "ryu-1.0.5",
        build_file = Label("//third_party/cargo/remote:ryu-1.0.5.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__salsa20__0_4_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/salsa20/salsa20-0.4.1.crate",
        type = "tar.gz",
        strip_prefix = "salsa20-0.4.1",
        build_file = Label("//third_party/cargo/remote:salsa20-0.4.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__scopeguard__1_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/scopeguard/scopeguard-1.1.0.crate",
        type = "tar.gz",
        strip_prefix = "scopeguard-1.1.0",
        build_file = Label("//third_party/cargo/remote:scopeguard-1.1.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__security_framework__0_4_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/security-framework/security-framework-0.4.4.crate",
        type = "tar.gz",
        strip_prefix = "security-framework-0.4.4",
        build_file = Label("//third_party/cargo/remote:security-framework-0.4.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__security_framework_sys__0_4_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/security-framework-sys/security-framework-sys-0.4.3.crate",
        type = "tar.gz",
        strip_prefix = "security-framework-sys-0.4.3",
        build_file = Label("//third_party/cargo/remote:security-framework-sys-0.4.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__semver__0_9_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/semver/semver-0.9.0.crate",
        type = "tar.gz",
        strip_prefix = "semver-0.9.0",
        build_file = Label("//third_party/cargo/remote:semver-0.9.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__semver_parser__0_7_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/semver-parser/semver-parser-0.7.0.crate",
        type = "tar.gz",
        strip_prefix = "semver-parser-0.7.0",
        build_file = Label("//third_party/cargo/remote:semver-parser-0.7.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde__1_0_116",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/serde/serde-1.0.116.crate",
        type = "tar.gz",
        strip_prefix = "serde-1.0.116",
        build_file = Label("//third_party/cargo/remote:serde-1.0.116.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_derive__1_0_116",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/serde_derive/serde_derive-1.0.116.crate",
        type = "tar.gz",
        strip_prefix = "serde_derive-1.0.116",
        build_file = Label("//third_party/cargo/remote:serde_derive-1.0.116.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_json__1_0_58",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/serde_json/serde_json-1.0.58.crate",
        type = "tar.gz",
        strip_prefix = "serde_json-1.0.58",
        build_file = Label("//third_party/cargo/remote:serde_json-1.0.58.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_urlencoded__0_6_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/serde_urlencoded/serde_urlencoded-0.6.1.crate",
        type = "tar.gz",
        strip_prefix = "serde_urlencoded-0.6.1",
        build_file = Label("//third_party/cargo/remote:serde_urlencoded-0.6.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sha_1__0_9_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/sha-1/sha-1-0.9.1.crate",
        type = "tar.gz",
        strip_prefix = "sha-1-0.9.1",
        build_file = Label("//third_party/cargo/remote:sha-1-0.9.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sha1__0_6_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/sha1/sha1-0.6.0.crate",
        type = "tar.gz",
        strip_prefix = "sha1-0.6.0",
        build_file = Label("//third_party/cargo/remote:sha1-0.6.0.BUILD.bazel"),
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
        name = "raze__sha2__0_9_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/sha2/sha2-0.9.1.crate",
        type = "tar.gz",
        strip_prefix = "sha2-0.9.1",
        build_file = Label("//third_party/cargo/remote:sha2-0.9.1.BUILD.bazel"),
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
        name = "raze__signal_hook_registry__1_2_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/signal-hook-registry/signal-hook-registry-1.2.1.crate",
        type = "tar.gz",
        strip_prefix = "signal-hook-registry-1.2.1",
        build_file = Label("//third_party/cargo/remote:signal-hook-registry-1.2.1.BUILD.bazel"),
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
        name = "raze__smallvec__1_4_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/smallvec/smallvec-1.4.2.crate",
        type = "tar.gz",
        strip_prefix = "smallvec-1.4.2",
        build_file = Label("//third_party/cargo/remote:smallvec-1.4.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__snow__0_7_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/snow/snow-0.7.2.crate",
        type = "tar.gz",
        strip_prefix = "snow-0.7.2",
        build_file = Label("//third_party/cargo/remote:snow-0.7.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__socket2__0_3_15",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/socket2/socket2-0.3.15.crate",
        type = "tar.gz",
        strip_prefix = "socket2-0.3.15",
        build_file = Label("//third_party/cargo/remote:socket2-0.3.15.BUILD.bazel"),
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
        name = "raze__standback__0_2_11",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/standback/standback-0.2.11.crate",
        type = "tar.gz",
        strip_prefix = "standback-0.2.11",
        build_file = Label("//third_party/cargo/remote:standback-0.2.11.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stdweb__0_4_20",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/stdweb/stdweb-0.4.20.crate",
        type = "tar.gz",
        strip_prefix = "stdweb-0.4.20",
        build_file = Label("//third_party/cargo/remote:stdweb-0.4.20.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stdweb_derive__0_5_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/stdweb-derive/stdweb-derive-0.5.3.crate",
        type = "tar.gz",
        strip_prefix = "stdweb-derive-0.5.3",
        build_file = Label("//third_party/cargo/remote:stdweb-derive-0.5.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stdweb_internal_macros__0_2_9",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/stdweb-internal-macros/stdweb-internal-macros-0.2.9.crate",
        type = "tar.gz",
        strip_prefix = "stdweb-internal-macros-0.2.9",
        build_file = Label("//third_party/cargo/remote:stdweb-internal-macros-0.2.9.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stdweb_internal_runtime__0_1_5",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/stdweb-internal-runtime/stdweb-internal-runtime-0.1.5.crate",
        type = "tar.gz",
        strip_prefix = "stdweb-internal-runtime-0.1.5",
        build_file = Label("//third_party/cargo/remote:stdweb-internal-runtime-0.1.5.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stream_cipher__0_3_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/stream-cipher/stream-cipher-0.3.2.crate",
        type = "tar.gz",
        strip_prefix = "stream-cipher-0.3.2",
        build_file = Label("//third_party/cargo/remote:stream-cipher-0.3.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stream_cipher__0_7_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/stream-cipher/stream-cipher-0.7.1.crate",
        type = "tar.gz",
        strip_prefix = "stream-cipher-0.7.1",
        build_file = Label("//third_party/cargo/remote:stream-cipher-0.7.1.BUILD.bazel"),
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
        name = "raze__syn__1_0_45",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/syn/syn-1.0.45.crate",
        type = "tar.gz",
        strip_prefix = "syn-1.0.45",
        build_file = Label("//third_party/cargo/remote:syn-1.0.45.BUILD.bazel"),
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
        name = "raze__tempfile__3_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/tempfile/tempfile-3.1.0.crate",
        type = "tar.gz",
        strip_prefix = "tempfile-3.1.0",
        build_file = Label("//third_party/cargo/remote:tempfile-3.1.0.BUILD.bazel"),
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
        name = "raze__thread_local__1_0_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/thread_local/thread_local-1.0.1.crate",
        type = "tar.gz",
        strip_prefix = "thread_local-1.0.1",
        build_file = Label("//third_party/cargo/remote:thread_local-1.0.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__threadpool__1_8_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/threadpool/threadpool-1.8.1.crate",
        type = "tar.gz",
        strip_prefix = "threadpool-1.8.1",
        build_file = Label("//third_party/cargo/remote:threadpool-1.8.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__time__0_2_22",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/time/time-0.2.22.crate",
        type = "tar.gz",
        strip_prefix = "time-0.2.22",
        build_file = Label("//third_party/cargo/remote:time-0.2.22.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__time_macros__0_1_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/time-macros/time-macros-0.1.1.crate",
        type = "tar.gz",
        strip_prefix = "time-macros-0.1.1",
        build_file = Label("//third_party/cargo/remote:time-macros-0.1.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__time_macros_impl__0_1_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/time-macros-impl/time-macros-impl-0.1.1.crate",
        type = "tar.gz",
        strip_prefix = "time-macros-impl-0.1.1",
        build_file = Label("//third_party/cargo/remote:time-macros-impl-0.1.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tinyvec__0_3_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/tinyvec/tinyvec-0.3.4.crate",
        type = "tar.gz",
        strip_prefix = "tinyvec-0.3.4",
        build_file = Label("//third_party/cargo/remote:tinyvec-0.3.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tinyvec__1_0_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/tinyvec/tinyvec-1.0.1.crate",
        type = "tar.gz",
        strip_prefix = "tinyvec-1.0.1",
        build_file = Label("//third_party/cargo/remote:tinyvec-1.0.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tinyvec_macros__0_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/tinyvec_macros/tinyvec_macros-0.1.0.crate",
        type = "tar.gz",
        strip_prefix = "tinyvec_macros-0.1.0",
        build_file = Label("//third_party/cargo/remote:tinyvec_macros-0.1.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tokio__0_2_22",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/tokio/tokio-0.2.22.crate",
        type = "tar.gz",
        strip_prefix = "tokio-0.2.22",
        build_file = Label("//third_party/cargo/remote:tokio-0.2.22.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tokio_util__0_3_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/tokio-util/tokio-util-0.3.1.crate",
        type = "tar.gz",
        strip_prefix = "tokio-util-0.3.1",
        build_file = Label("//third_party/cargo/remote:tokio-util-0.3.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tracing__0_1_21",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/tracing/tracing-0.1.21.crate",
        type = "tar.gz",
        strip_prefix = "tracing-0.1.21",
        build_file = Label("//third_party/cargo/remote:tracing-0.1.21.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tracing_core__0_1_17",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/tracing-core/tracing-core-0.1.17.crate",
        type = "tar.gz",
        strip_prefix = "tracing-core-0.1.17",
        build_file = Label("//third_party/cargo/remote:tracing-core-0.1.17.BUILD.bazel"),
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
        name = "raze__trust_dns_proto__0_19_5",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/trust-dns-proto/trust-dns-proto-0.19.5.crate",
        type = "tar.gz",
        strip_prefix = "trust-dns-proto-0.19.5",
        build_file = Label("//third_party/cargo/remote:trust-dns-proto-0.19.5.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__trust_dns_resolver__0_19_5",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/trust-dns-resolver/trust-dns-resolver-0.19.5.crate",
        type = "tar.gz",
        strip_prefix = "trust-dns-resolver-0.19.5",
        build_file = Label("//third_party/cargo/remote:trust-dns-resolver-0.19.5.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tungstenite__0_11_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/tungstenite/tungstenite-0.11.1.crate",
        type = "tar.gz",
        strip_prefix = "tungstenite-0.11.1",
        build_file = Label("//third_party/cargo/remote:tungstenite-0.11.1.BUILD.bazel"),
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
        name = "raze__unicode_bidi__0_3_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/unicode-bidi/unicode-bidi-0.3.4.crate",
        type = "tar.gz",
        strip_prefix = "unicode-bidi-0.3.4",
        build_file = Label("//third_party/cargo/remote:unicode-bidi-0.3.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_normalization__0_1_13",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/unicode-normalization/unicode-normalization-0.1.13.crate",
        type = "tar.gz",
        strip_prefix = "unicode-normalization-0.1.13",
        build_file = Label("//third_party/cargo/remote:unicode-normalization-0.1.13.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_segmentation__1_6_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/unicode-segmentation/unicode-segmentation-1.6.0.crate",
        type = "tar.gz",
        strip_prefix = "unicode-segmentation-1.6.0",
        build_file = Label("//third_party/cargo/remote:unicode-segmentation-1.6.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_xid__0_2_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/unicode-xid/unicode-xid-0.2.1.crate",
        type = "tar.gz",
        strip_prefix = "unicode-xid-0.2.1",
        build_file = Label("//third_party/cargo/remote:unicode-xid-0.2.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__universal_hash__0_4_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/universal-hash/universal-hash-0.4.0.crate",
        type = "tar.gz",
        strip_prefix = "universal-hash-0.4.0",
        build_file = Label("//third_party/cargo/remote:universal-hash-0.4.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__url__2_1_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/url/url-2.1.1.crate",
        type = "tar.gz",
        strip_prefix = "url-2.1.1",
        build_file = Label("//third_party/cargo/remote:url-2.1.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__utf_8__0_7_5",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/utf-8/utf-8-0.7.5.crate",
        type = "tar.gz",
        strip_prefix = "utf-8-0.7.5",
        build_file = Label("//third_party/cargo/remote:utf-8-0.7.5.BUILD.bazel"),
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
        name = "raze__version_check__0_9_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/version_check/version_check-0.9.2.crate",
        type = "tar.gz",
        strip_prefix = "version_check-0.9.2",
        build_file = Label("//third_party/cargo/remote:version_check-0.9.2.BUILD.bazel"),
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
        name = "raze__wepoll_sys_stjepang__1_0_8",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/wepoll-sys-stjepang/wepoll-sys-stjepang-1.0.8.crate",
        type = "tar.gz",
        strip_prefix = "wepoll-sys-stjepang-1.0.8",
        build_file = Label("//third_party/cargo/remote:wepoll-sys-stjepang-1.0.8.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__which__3_1_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/which/which-3.1.1.crate",
        type = "tar.gz",
        strip_prefix = "which-3.1.1",
        build_file = Label("//third_party/cargo/remote:which-3.1.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__widestring__0_4_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/widestring/widestring-0.4.3.crate",
        type = "tar.gz",
        strip_prefix = "widestring-0.4.3",
        build_file = Label("//third_party/cargo/remote:widestring-0.4.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__winapi__0_2_8",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/winapi/winapi-0.2.8.crate",
        type = "tar.gz",
        strip_prefix = "winapi-0.2.8",
        build_file = Label("//third_party/cargo/remote:winapi-0.2.8.BUILD.bazel"),
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
        name = "raze__winapi_build__0_1_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/winapi-build/winapi-build-0.1.1.crate",
        type = "tar.gz",
        strip_prefix = "winapi-build-0.1.1",
        build_file = Label("//third_party/cargo/remote:winapi-build-0.1.1.BUILD.bazel"),
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
        name = "raze__winreg__0_6_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/winreg/winreg-0.6.2.crate",
        type = "tar.gz",
        strip_prefix = "winreg-0.6.2",
        build_file = Label("//third_party/cargo/remote:winreg-0.6.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ws2_32_sys__0_2_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/ws2_32-sys/ws2_32-sys-0.2.1.crate",
        type = "tar.gz",
        strip_prefix = "ws2_32-sys-0.2.1",
        build_file = Label("//third_party/cargo/remote:ws2_32-sys-0.2.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__x25519_dalek__1_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/x25519-dalek/x25519-dalek-1.1.0.crate",
        type = "tar.gz",
        strip_prefix = "x25519-dalek-1.1.0",
        build_file = Label("//third_party/cargo/remote:x25519-dalek-1.1.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__zeroize__1_1_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/zeroize/zeroize-1.1.1.crate",
        type = "tar.gz",
        strip_prefix = "zeroize-1.1.1",
        build_file = Label("//third_party/cargo/remote:zeroize-1.1.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__zeroize_derive__1_0_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/zeroize_derive/zeroize_derive-1.0.1.crate",
        type = "tar.gz",
        strip_prefix = "zeroize_derive-1.0.1",
        build_file = Label("//third_party/cargo/remote:zeroize_derive-1.0.1.BUILD.bazel"),
    )
