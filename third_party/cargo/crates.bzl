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
        sha256 = "1b6a2d3371669ab3ca9797670853d61402b03d0b4b9ebf33d677dfa720203072",
        strip_prefix = "addr2line-0.13.0",
        build_file = Label("//third_party/cargo/remote:addr2line-0.13.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__adler__0_2_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/adler/adler-0.2.3.crate",
        type = "tar.gz",
        sha256 = "ee2a4ec343196209d6594e19543ae87a39f96d5534d7174822a3ad825dd6ed7e",
        strip_prefix = "adler-0.2.3",
        build_file = Label("//third_party/cargo/remote:adler-0.2.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aead__0_3_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/aead/aead-0.3.2.crate",
        type = "tar.gz",
        sha256 = "7fc95d1bdb8e6666b2b217308eeeb09f2d6728d104be3e31916cc74d15420331",
        strip_prefix = "aead-0.3.2",
        build_file = Label("//third_party/cargo/remote:aead-0.3.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aes__0_4_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/aes/aes-0.4.0.crate",
        type = "tar.gz",
        sha256 = "f7001367fde4c768a19d1029f0a8be5abd9308e1119846d5bd9ad26297b8faf5",
        strip_prefix = "aes-0.4.0",
        build_file = Label("//third_party/cargo/remote:aes-0.4.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aes__0_5_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/aes/aes-0.5.0.crate",
        type = "tar.gz",
        sha256 = "dd2bc6d3f370b5666245ff421e231cba4353df936e26986d2918e61a8fd6aef6",
        strip_prefix = "aes-0.5.0",
        build_file = Label("//third_party/cargo/remote:aes-0.5.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aes_gcm__0_6_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/aes-gcm/aes-gcm-0.6.0.crate",
        type = "tar.gz",
        sha256 = "86f5007801316299f922a6198d1d09a0bae95786815d066d5880d13f7c45ead1",
        strip_prefix = "aes-gcm-0.6.0",
        build_file = Label("//third_party/cargo/remote:aes-gcm-0.6.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aes_gcm__0_7_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/aes-gcm/aes-gcm-0.7.0.crate",
        type = "tar.gz",
        sha256 = "0301c9e9c443494d970a07885e8cf3e587bae8356a1d5abd0999068413f7205f",
        strip_prefix = "aes-gcm-0.7.0",
        build_file = Label("//third_party/cargo/remote:aes-gcm-0.7.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aes_soft__0_4_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/aes-soft/aes-soft-0.4.0.crate",
        type = "tar.gz",
        sha256 = "4925647ee64e5056cf231608957ce7c81e12d6d6e316b9ce1404778cc1d35fa7",
        strip_prefix = "aes-soft-0.4.0",
        build_file = Label("//third_party/cargo/remote:aes-soft-0.4.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aes_soft__0_5_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/aes-soft/aes-soft-0.5.0.crate",
        type = "tar.gz",
        sha256 = "63dd91889c49327ad7ef3b500fd1109dbd3c509a03db0d4a9ce413b79f575cb6",
        strip_prefix = "aes-soft-0.5.0",
        build_file = Label("//third_party/cargo/remote:aes-soft-0.5.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aesni__0_7_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/aesni/aesni-0.7.0.crate",
        type = "tar.gz",
        sha256 = "d050d39b0b7688b3a3254394c3e30a9d66c41dcf9b05b0e2dbdc623f6505d264",
        strip_prefix = "aesni-0.7.0",
        build_file = Label("//third_party/cargo/remote:aesni-0.7.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aesni__0_8_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/aesni/aesni-0.8.0.crate",
        type = "tar.gz",
        sha256 = "0a6fe808308bb07d393e2ea47780043ec47683fcf19cf5efc8ca51c50cc8c68a",
        strip_prefix = "aesni-0.8.0",
        build_file = Label("//third_party/cargo/remote:aesni-0.8.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__anyhow__1_0_33",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/anyhow/anyhow-1.0.33.crate",
        type = "tar.gz",
        sha256 = "a1fd36ffbb1fb7c834eac128ea8d0e310c5aeb635548f9d58861e1308d46e71c",
        strip_prefix = "anyhow-1.0.33",
        build_file = Label("//third_party/cargo/remote:anyhow-1.0.33.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__arrayref__0_3_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/arrayref/arrayref-0.3.6.crate",
        type = "tar.gz",
        sha256 = "a4c527152e37cf757a3f78aae5a06fbeefdb07ccc535c980a3208ee3060dd544",
        strip_prefix = "arrayref-0.3.6",
        build_file = Label("//third_party/cargo/remote:arrayref-0.3.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__arrayvec__0_4_12",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/arrayvec/arrayvec-0.4.12.crate",
        type = "tar.gz",
        sha256 = "cd9fd44efafa8690358b7408d253adf110036b88f55672a933f01d616ad9b1b9",
        strip_prefix = "arrayvec-0.4.12",
        build_file = Label("//third_party/cargo/remote:arrayvec-0.4.12.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__arrayvec__0_5_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/arrayvec/arrayvec-0.5.2.crate",
        type = "tar.gz",
        sha256 = "23b62fc65de8e4e7f52534fb52b0f3ed04746ae267519eef2a83941e8085068b",
        strip_prefix = "arrayvec-0.5.2",
        build_file = Label("//third_party/cargo/remote:arrayvec-0.5.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_channel__1_5_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-channel/async-channel-1.5.1.crate",
        type = "tar.gz",
        sha256 = "59740d83946db6a5af71ae25ddf9562c2b176b2ca42cf99a455f09f4a220d6b9",
        strip_prefix = "async-channel-1.5.1",
        build_file = Label("//third_party/cargo/remote:async-channel-1.5.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_executor__1_3_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-executor/async-executor-1.3.0.crate",
        type = "tar.gz",
        sha256 = "d373d78ded7d0b3fa8039375718cde0aace493f2e34fb60f51cbf567562ca801",
        strip_prefix = "async-executor-1.3.0",
        build_file = Label("//third_party/cargo/remote:async-executor-1.3.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_global_executor__1_4_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-global-executor/async-global-executor-1.4.2.crate",
        type = "tar.gz",
        sha256 = "124ac8c265e407641c3362b8f4d39cdb4e243885b71eef087be27199790f5a3a",
        strip_prefix = "async-global-executor-1.4.2",
        build_file = Label("//third_party/cargo/remote:async-global-executor-1.4.2.BUILD.bazel"),
    )

    maybe(
        new_git_repository,
        name = "raze__async_h1__2_1_3",
        remote = "https://github.com/ttiurani/async-h1.git",
        commit = "550a10d2de15267c0f5661dcebace30aff929546",
        build_file = Label("//third_party/cargo/remote:async-h1-2.1.3.BUILD.bazel"),
        init_submodules = True,
    )

    maybe(
        http_archive,
        name = "raze__async_io__1_1_10",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-io/async-io-1.1.10.crate",
        type = "tar.gz",
        sha256 = "d54bc4c1c7292475efb2253227dbcfad8fe1ca4c02bc62c510cc2f3da5c4704e",
        strip_prefix = "async-io-1.1.10",
        build_file = Label("//third_party/cargo/remote:async-io-1.1.10.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_mutex__1_4_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-mutex/async-mutex-1.4.0.crate",
        type = "tar.gz",
        sha256 = "479db852db25d9dbf6204e6cb6253698f175c15726470f78af0d918e99d6156e",
        strip_prefix = "async-mutex-1.4.0",
        build_file = Label("//third_party/cargo/remote:async-mutex-1.4.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_session__2_0_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-session/async-session-2.0.1.crate",
        type = "tar.gz",
        sha256 = "345022a2eed092cd105cc1b26fd61c341e100bd5fcbbd792df4baf31c2cc631f",
        strip_prefix = "async-session-2.0.1",
        build_file = Label("//third_party/cargo/remote:async-session-2.0.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_sse__4_0_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-sse/async-sse-4.0.1.crate",
        type = "tar.gz",
        sha256 = "2a127da64eb321f5b698a43fb9b976d1e5fc1fd3c2f961322d6cc06ce721b47b",
        strip_prefix = "async-sse-4.0.1",
        build_file = Label("//third_party/cargo/remote:async-sse-4.0.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_std__1_6_5",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-std/async-std-1.6.5.crate",
        type = "tar.gz",
        sha256 = "a9fa76751505e8df1c7a77762f60486f60c71bbd9b8557f4da6ad47d083732ed",
        strip_prefix = "async-std-1.6.5",
        build_file = Label("//third_party/cargo/remote:async-std-1.6.5.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_task__4_0_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-task/async-task-4.0.3.crate",
        type = "tar.gz",
        sha256 = "e91831deabf0d6d7ec49552e489aed63b7456a7a3c46cff62adad428110b0af0",
        strip_prefix = "async-task-4.0.3",
        build_file = Label("//third_party/cargo/remote:async-task-4.0.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_trait__0_1_41",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-trait/async-trait-0.1.41.crate",
        type = "tar.gz",
        sha256 = "b246867b8b3b6ae56035f1eb1ed557c1d8eae97f0d53696138a50fa0e3a3b8c0",
        strip_prefix = "async-trait-0.1.41",
        build_file = Label("//third_party/cargo/remote:async-trait-0.1.41.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_tungstenite__0_8_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-tungstenite/async-tungstenite-0.8.0.crate",
        type = "tar.gz",
        sha256 = "a5c45a0dd44b7e6533ac4e7acc38ead1a3b39885f5bbb738140d30ea528abc7c",
        strip_prefix = "async-tungstenite-0.8.0",
        build_file = Label("//third_party/cargo/remote:async-tungstenite-0.8.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_tungstenite__0_9_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/async-tungstenite/async-tungstenite-0.9.3.crate",
        type = "tar.gz",
        sha256 = "9ce503a5cb1e7450af7d211b86b84807791b251f335b2f43f1e26b85a416f315",
        strip_prefix = "async-tungstenite-0.9.3",
        build_file = Label("//third_party/cargo/remote:async-tungstenite-0.9.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__atomic_waker__1_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/atomic-waker/atomic-waker-1.0.0.crate",
        type = "tar.gz",
        sha256 = "065374052e7df7ee4047b1160cca5e1467a12351a40b3da123c870ba0b8eda2a",
        strip_prefix = "atomic-waker-1.0.0",
        build_file = Label("//third_party/cargo/remote:atomic-waker-1.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__atty__0_2_14",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/atty/atty-0.2.14.crate",
        type = "tar.gz",
        strip_prefix = "atty-0.2.14",
        build_file = Label("//third_party/cargo/remote:atty-0.2.14.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__autocfg__1_0_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/autocfg/autocfg-1.0.1.crate",
        type = "tar.gz",
        sha256 = "cdb031dd78e28731d87d56cc8ffef4a8f36ca26c38fe2de700543e627f8a464a",
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
        sha256 = "707b586e0e2f247cbde68cdd2c3ce69ea7b7be43e1c5b426e37c9319c4b9838e",
        strip_prefix = "backtrace-0.3.53",
        build_file = Label("//third_party/cargo/remote:backtrace-0.3.53.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__base_x__0_2_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/base-x/base-x-0.2.6.crate",
        type = "tar.gz",
        sha256 = "1b20b618342cf9891c292c4f5ac2cde7287cc5c87e87e9c769d617793607dec1",
        strip_prefix = "base-x-0.2.6",
        build_file = Label("//third_party/cargo/remote:base-x-0.2.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__base64__0_12_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/base64/base64-0.12.3.crate",
        type = "tar.gz",
        sha256 = "3441f0f7b02788e948e47f457ca01f1d7e6d92c693bc132c22b087d3141c03ff",
        strip_prefix = "base64-0.12.3",
        build_file = Label("//third_party/cargo/remote:base64-0.12.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__bincode__1_3_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/bincode/bincode-1.3.1.crate",
        type = "tar.gz",
        sha256 = "f30d3a39baa26f9651f17b375061f3233dde33424a8b72b0dbe93a68a0bc896d",
        strip_prefix = "bincode-1.3.1",
        build_file = Label("//third_party/cargo/remote:bincode-1.3.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__bitfield_rle__0_2_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/bitfield-rle/bitfield-rle-0.2.0.crate",
        type = "tar.gz",
        sha256 = "3f8acc105b7bd3ed61e4bb7ad3e3b3f2a8da72205b2e0408cf71a499e8f57dd0",
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
        name = "raze__blake2__0_9_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/blake2/blake2-0.9.1.crate",
        type = "tar.gz",
        sha256 = "10a5720225ef5daecf08657f23791354e1685a8c91a4c60c7f3d3b2892f978f4",
        strip_prefix = "blake2-0.9.1",
        build_file = Label("//third_party/cargo/remote:blake2-0.9.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__blake2_rfc__0_2_18",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/blake2-rfc/blake2-rfc-0.2.18.crate",
        type = "tar.gz",
        sha256 = "5d6d530bdd2d52966a6d03b7a964add7ae1a288d25214066fd4b600f0f796400",
        strip_prefix = "blake2-rfc-0.2.18",
        build_file = Label("//third_party/cargo/remote:blake2-rfc-0.2.18.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__blake3__0_3_7",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/blake3/blake3-0.3.7.crate",
        type = "tar.gz",
        sha256 = "e9ff35b701f3914bdb8fad3368d822c766ef2858b2583198e41639b936f09d3f",
        strip_prefix = "blake3-0.3.7",
        build_file = Label("//third_party/cargo/remote:blake3-0.3.7.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__block_buffer__0_7_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/block-buffer/block-buffer-0.7.3.crate",
        type = "tar.gz",
        sha256 = "c0940dc441f31689269e10ac70eb1002a3a1d3ad1390e030043662eb7fe4688b",
        strip_prefix = "block-buffer-0.7.3",
        build_file = Label("//third_party/cargo/remote:block-buffer-0.7.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__block_buffer__0_9_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/block-buffer/block-buffer-0.9.0.crate",
        type = "tar.gz",
        sha256 = "4152116fd6e9dadb291ae18fc1ec3575ed6d84c29642d97890f4b4a3417297e4",
        strip_prefix = "block-buffer-0.9.0",
        build_file = Label("//third_party/cargo/remote:block-buffer-0.9.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__block_cipher__0_7_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/block-cipher/block-cipher-0.7.1.crate",
        type = "tar.gz",
        sha256 = "fa136449e765dc7faa244561ccae839c394048667929af599b5d931ebe7b7f10",
        strip_prefix = "block-cipher-0.7.1",
        build_file = Label("//third_party/cargo/remote:block-cipher-0.7.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__block_cipher__0_8_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/block-cipher/block-cipher-0.8.0.crate",
        type = "tar.gz",
        sha256 = "f337a3e6da609650eb74e02bc9fac7b735049f7623ab12f2e4c719316fcc7e80",
        strip_prefix = "block-cipher-0.8.0",
        build_file = Label("//third_party/cargo/remote:block-cipher-0.8.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__block_padding__0_1_5",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/block-padding/block-padding-0.1.5.crate",
        type = "tar.gz",
        sha256 = "fa79dedbb091f449f1f39e53edf88d5dbe95f895dae6135a8d7b881fb5af73f5",
        strip_prefix = "block-padding-0.1.5",
        build_file = Label("//third_party/cargo/remote:block-padding-0.1.5.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__blocking__1_0_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/blocking/blocking-1.0.2.crate",
        type = "tar.gz",
        sha256 = "c5e170dbede1f740736619b776d7251cb1b9095c435c34d8ca9f57fcd2f335e9",
        strip_prefix = "blocking-1.0.2",
        build_file = Label("//third_party/cargo/remote:blocking-1.0.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__bumpalo__3_4_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/bumpalo/bumpalo-3.4.0.crate",
        type = "tar.gz",
        sha256 = "2e8c087f005730276d1096a652e92a8bacee2e2472bcc9715a74d2bec38b5820",
        strip_prefix = "bumpalo-3.4.0",
        build_file = Label("//third_party/cargo/remote:bumpalo-3.4.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__byte_pool__0_2_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/byte-pool/byte-pool-0.2.2.crate",
        type = "tar.gz",
        sha256 = "1e38e98299d518ec351ca016363e0cbfc77059dcd08dfa9700d15e405536097a",
        strip_prefix = "byte-pool-0.2.2",
        build_file = Label("//third_party/cargo/remote:byte-pool-0.2.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__byte_tools__0_3_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/byte-tools/byte-tools-0.3.1.crate",
        type = "tar.gz",
        sha256 = "e3b5ca7a04898ad4bcd41c90c5285445ff5b791899bb1b0abdd2a2aa791211d7",
        strip_prefix = "byte-tools-0.3.1",
        build_file = Label("//third_party/cargo/remote:byte-tools-0.3.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__byteorder__1_3_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/byteorder/byteorder-1.3.4.crate",
        type = "tar.gz",
        sha256 = "08c48aae112d48ed9f069b33538ea9e3e90aa263cfa3d1c24309612b1f7472de",
        strip_prefix = "byteorder-1.3.4",
        build_file = Label("//third_party/cargo/remote:byteorder-1.3.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__bytes__0_5_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/bytes/bytes-0.5.6.crate",
        type = "tar.gz",
        sha256 = "0e4cec68f03f32e44924783795810fa50a7035d8c8ebe78580ad7e6c703fba38",
        strip_prefix = "bytes-0.5.6",
        build_file = Label("//third_party/cargo/remote:bytes-0.5.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cache_padded__1_1_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/cache-padded/cache-padded-1.1.1.crate",
        type = "tar.gz",
        sha256 = "631ae5198c9be5e753e5cc215e1bd73c2b466a3565173db433f52bb9d3e66dba",
        strip_prefix = "cache-padded-1.1.1",
        build_file = Label("//third_party/cargo/remote:cache-padded-1.1.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cc__1_0_61",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/cc/cc-1.0.61.crate",
        type = "tar.gz",
        sha256 = "ed67cbde08356238e75fc4656be4749481eeffb09e19f320a25237d5221c985d",
        strip_prefix = "cc-1.0.61",
        build_file = Label("//third_party/cargo/remote:cc-1.0.61.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cfg_if__0_1_10",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/cfg-if/cfg-if-0.1.10.crate",
        type = "tar.gz",
        sha256 = "4785bdd1c96b2a846b2bd7cc02e86b6b3dbf14e7e53446c4f54c92a361040822",
        strip_prefix = "cfg-if-0.1.10",
        build_file = Label("//third_party/cargo/remote:cfg-if-0.1.10.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cfg_if__1_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/cfg-if/cfg-if-1.0.0.crate",
        type = "tar.gz",
        sha256 = "baf1de4339761588bc0619e3cbc0120ee582ebb74b53b4efbf79117bd2da40fd",
        strip_prefix = "cfg-if-1.0.0",
        build_file = Label("//third_party/cargo/remote:cfg-if-1.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__chacha20__0_5_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/chacha20/chacha20-0.5.0.crate",
        type = "tar.gz",
        sha256 = "244fbce0d47e97e8ef2f63b81d5e05882cb518c68531eb33194990d7b7e85845",
        strip_prefix = "chacha20-0.5.0",
        build_file = Label("//third_party/cargo/remote:chacha20-0.5.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__chacha20poly1305__0_6_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/chacha20poly1305/chacha20poly1305-0.6.0.crate",
        type = "tar.gz",
        sha256 = "9bf18d374d66df0c05cdddd528a7db98f78c28e2519b120855c4f84c5027b1f5",
        strip_prefix = "chacha20poly1305-0.6.0",
        build_file = Label("//third_party/cargo/remote:chacha20poly1305-0.6.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__chrono__0_4_19",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/chrono/chrono-0.4.19.crate",
        type = "tar.gz",
        sha256 = "670ad68c9088c2a963aaa298cb369688cf3f9465ce5e2d4ca10e6e0098a1ce73",
        strip_prefix = "chrono-0.4.19",
        build_file = Label("//third_party/cargo/remote:chrono-0.4.19.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__clap__3_0_0_beta_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/clap/clap-3.0.0-beta.2.crate",
        type = "tar.gz",
        strip_prefix = "clap-3.0.0-beta.2",
        build_file = Label("//third_party/cargo/remote:clap-3.0.0-beta.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__clap_derive__3_0_0_beta_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/clap_derive/clap_derive-3.0.0-beta.2.crate",
        type = "tar.gz",
        strip_prefix = "clap_derive-3.0.0-beta.2",
        build_file = Label("//third_party/cargo/remote:clap_derive-3.0.0-beta.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__clear_on_drop__0_2_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/clear_on_drop/clear_on_drop-0.2.4.crate",
        type = "tar.gz",
        sha256 = "c9cc5db465b294c3fa986d5bbb0f3017cd850bff6dd6c52f9ccff8b4d21b7b08",
        strip_prefix = "clear_on_drop-0.2.4",
        build_file = Label("//third_party/cargo/remote:clear_on_drop-0.2.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__concurrent_queue__1_2_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/concurrent-queue/concurrent-queue-1.2.2.crate",
        type = "tar.gz",
        sha256 = "30ed07550be01594c6026cff2a1d7fe9c8f683caa798e12b68694ac9e88286a3",
        strip_prefix = "concurrent-queue-1.2.2",
        build_file = Label("//third_party/cargo/remote:concurrent-queue-1.2.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__const_fn__0_4_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/const_fn/const_fn-0.4.2.crate",
        type = "tar.gz",
        sha256 = "ce90df4c658c62f12d78f7508cf92f9173e5184a539c10bfe54a3107b3ffd0f2",
        strip_prefix = "const_fn-0.4.2",
        build_file = Label("//third_party/cargo/remote:const_fn-0.4.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__constant_time_eq__0_1_5",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/constant_time_eq/constant_time_eq-0.1.5.crate",
        type = "tar.gz",
        sha256 = "245097e9a4535ee1e3e3931fcfcd55a796a44c643e8596ff6566d68f09b87bbc",
        strip_prefix = "constant_time_eq-0.1.5",
        build_file = Label("//third_party/cargo/remote:constant_time_eq-0.1.5.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cookie__0_14_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/cookie/cookie-0.14.2.crate",
        type = "tar.gz",
        sha256 = "1373a16a4937bc34efec7b391f9c1500c30b8478a701a4f44c9165cc0475a6e0",
        strip_prefix = "cookie-0.14.2",
        build_file = Label("//third_party/cargo/remote:cookie-0.14.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cpuid_bool__0_1_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/cpuid-bool/cpuid-bool-0.1.2.crate",
        type = "tar.gz",
        sha256 = "8aebca1129a03dc6dc2b127edd729435bbc4a37e1d5f4d7513165089ceb02634",
        strip_prefix = "cpuid-bool-0.1.2",
        build_file = Label("//third_party/cargo/remote:cpuid-bool-0.1.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__crossbeam_queue__0_2_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/crossbeam-queue/crossbeam-queue-0.2.3.crate",
        type = "tar.gz",
        sha256 = "774ba60a54c213d409d5353bda12d49cd68d14e45036a285234c8d6f91f92570",
        strip_prefix = "crossbeam-queue-0.2.3",
        build_file = Label("//third_party/cargo/remote:crossbeam-queue-0.2.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__crossbeam_utils__0_7_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/crossbeam-utils/crossbeam-utils-0.7.2.crate",
        type = "tar.gz",
        sha256 = "c3c7c73a2d1e9fc0886a08b93e98eb643461230d5f1925e4036204d5f2e261a8",
        strip_prefix = "crossbeam-utils-0.7.2",
        build_file = Label("//third_party/cargo/remote:crossbeam-utils-0.7.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__crypto_mac__0_8_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/crypto-mac/crypto-mac-0.8.0.crate",
        type = "tar.gz",
        sha256 = "b584a330336237c1eecd3e94266efb216c56ed91225d634cb2991c5f3fd1aeab",
        strip_prefix = "crypto-mac-0.8.0",
        build_file = Label("//third_party/cargo/remote:crypto-mac-0.8.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__curve25519_dalek__2_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/curve25519-dalek/curve25519-dalek-2.1.0.crate",
        type = "tar.gz",
        sha256 = "5d85653f070353a16313d0046f173f70d1aadd5b42600a14de626f0dfb3473a5",
        strip_prefix = "curve25519-dalek-2.1.0",
        build_file = Label("//third_party/cargo/remote:curve25519-dalek-2.1.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__curve25519_dalek__3_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/curve25519-dalek/curve25519-dalek-3.0.0.crate",
        type = "tar.gz",
        sha256 = "c8492de420e9e60bc9a1d66e2dbb91825390b738a388606600663fc529b4b307",
        strip_prefix = "curve25519-dalek-3.0.0",
        build_file = Label("//third_party/cargo/remote:curve25519-dalek-3.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__data_encoding__2_3_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/data-encoding/data-encoding-2.3.0.crate",
        type = "tar.gz",
        sha256 = "d4d0e2d24e5ee3b23a01de38eefdcd978907890701f08ffffd4cb457ca4ee8d6",
        strip_prefix = "data-encoding-2.3.0",
        build_file = Label("//third_party/cargo/remote:data-encoding-2.3.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__digest__0_8_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/digest/digest-0.8.1.crate",
        type = "tar.gz",
        sha256 = "f3d0c8c8752312f9713efd397ff63acb9f85585afbf179282e720e7704954dd5",
        strip_prefix = "digest-0.8.1",
        build_file = Label("//third_party/cargo/remote:digest-0.8.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__digest__0_9_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/digest/digest-0.9.0.crate",
        type = "tar.gz",
        sha256 = "d3dd60d1080a57a05ab032377049e0591415d2b31afd7028356dbf3cc6dcb066",
        strip_prefix = "digest-0.9.0",
        build_file = Label("//third_party/cargo/remote:digest-0.9.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__discard__1_0_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/discard/discard-1.0.4.crate",
        type = "tar.gz",
        sha256 = "212d0f5754cb6769937f4501cc0e67f4f4483c8d2c3e1e922ee9edbe4ab4c7c0",
        strip_prefix = "discard-1.0.4",
        build_file = Label("//third_party/cargo/remote:discard-1.0.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__duct__0_13_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/duct/duct-0.13.4.crate",
        type = "tar.gz",
        sha256 = "f90a9c3a25aafbd538c7d40a53f83c4487ee8216c12d1c8ef2c01eb2f6ea1553",
        strip_prefix = "duct-0.13.4",
        build_file = Label("//third_party/cargo/remote:duct-0.13.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ed25519_dalek__1_0_0_pre_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/ed25519-dalek/ed25519-dalek-1.0.0-pre.3.crate",
        type = "tar.gz",
        sha256 = "978710b352437433c97b2bff193f2fb1dfd58a093f863dd95e225a19baa599a2",
        strip_prefix = "ed25519-dalek-1.0.0-pre.3",
        build_file = Label("//third_party/cargo/remote:ed25519-dalek-1.0.0-pre.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__either__1_6_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/either/either-1.6.1.crate",
        type = "tar.gz",
        sha256 = "e78d4f1cc4ae33bbfc157ed5d5a5ef3bc29227303d595861deb238fcec4e9457",
        strip_prefix = "either-1.6.1",
        build_file = Label("//third_party/cargo/remote:either-1.6.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__event_listener__2_5_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/event-listener/event-listener-2.5.1.crate",
        type = "tar.gz",
        sha256 = "f7531096570974c3a9dcf9e4b8e1cede1ec26cf5046219fb3b9d897503b9be59",
        strip_prefix = "event-listener-2.5.1",
        build_file = Label("//third_party/cargo/remote:event-listener-2.5.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__failure__0_1_8",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/failure/failure-0.1.8.crate",
        type = "tar.gz",
        sha256 = "d32e9bd16cc02eae7db7ef620b392808b89f6a5e16bb3497d159c6b92a0f4f86",
        strip_prefix = "failure-0.1.8",
        build_file = Label("//third_party/cargo/remote:failure-0.1.8.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__failure_derive__0_1_8",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/failure_derive/failure_derive-0.1.8.crate",
        type = "tar.gz",
        sha256 = "aa4da3c766cd7a0db8242e326e9e4e081edd567072893ed320008189715366a4",
        strip_prefix = "failure_derive-0.1.8",
        build_file = Label("//third_party/cargo/remote:failure_derive-0.1.8.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fake_simd__0_1_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/fake-simd/fake-simd-0.1.2.crate",
        type = "tar.gz",
        sha256 = "e88a8acf291dafb59c2d96e8f59828f3838bb1a70398823ade51a84de6a6deed",
        strip_prefix = "fake-simd-0.1.2",
        build_file = Label("//third_party/cargo/remote:fake-simd-0.1.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fastrand__1_4_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/fastrand/fastrand-1.4.0.crate",
        type = "tar.gz",
        sha256 = "ca5faf057445ce5c9d4329e382b2ce7ca38550ef3b73a5348362d5f24e0c7fe3",
        strip_prefix = "fastrand-1.4.0",
        build_file = Label("//third_party/cargo/remote:fastrand-1.4.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__femme__2_1_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/femme/femme-2.1.1.crate",
        type = "tar.gz",
        sha256 = "2af1a24f391a5a94d756db5092c6576aad494b88a71a5a36b20c67b63e0df034",
        strip_prefix = "femme-2.1.1",
        build_file = Label("//third_party/cargo/remote:femme-2.1.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fern__0_6_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/fern/fern-0.6.0.crate",
        type = "tar.gz",
        sha256 = "8c9a4820f0ccc8a7afd67c39a0f1a0f4b07ca1725164271a64939d7aeb9af065",
        strip_prefix = "fern-0.6.0",
        build_file = Label("//third_party/cargo/remote:fern-0.6.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fixedbitset__0_2_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/fixedbitset/fixedbitset-0.2.0.crate",
        type = "tar.gz",
        sha256 = "37ab347416e802de484e4d03c7316c48f1ecb56574dfd4a46a80f173ce1de04d",
        strip_prefix = "fixedbitset-0.2.0",
        build_file = Label("//third_party/cargo/remote:fixedbitset-0.2.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__flat_tree__5_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/flat-tree/flat-tree-5.0.0.crate",
        type = "tar.gz",
        sha256 = "f55d280d4b6d9585f3d1458eb082fb30f541ad227b2102965e4c7aa239a5e9e4",
        strip_prefix = "flat-tree-5.0.0",
        build_file = Label("//third_party/cargo/remote:flat-tree-5.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fnv__1_0_7",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/fnv/fnv-1.0.7.crate",
        type = "tar.gz",
        sha256 = "3f9eec918d3f24069decb9af1554cad7c880e2da24a9afd88aca000531ab82c1",
        strip_prefix = "fnv-1.0.7",
        build_file = Label("//third_party/cargo/remote:fnv-1.0.7.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__form_urlencoded__1_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/form_urlencoded/form_urlencoded-1.0.0.crate",
        type = "tar.gz",
        sha256 = "ece68d15c92e84fa4f19d3780f1294e5ca82a78a6d515f1efaabcc144688be00",
        strip_prefix = "form_urlencoded-1.0.0",
        build_file = Label("//third_party/cargo/remote:form_urlencoded-1.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fuchsia_cprng__0_1_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/fuchsia-cprng/fuchsia-cprng-0.1.1.crate",
        type = "tar.gz",
        sha256 = "a06f77d526c1a601b7c4cdd98f54b5eaabffc14d5f2f0296febdc7f357c6d3ba",
        strip_prefix = "fuchsia-cprng-0.1.1",
        build_file = Label("//third_party/cargo/remote:fuchsia-cprng-0.1.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures__0_3_7",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures/futures-0.3.7.crate",
        type = "tar.gz",
        sha256 = "95314d38584ffbfda215621d723e0a3906f032e03ae5551e650058dac83d4797",
        strip_prefix = "futures-0.3.7",
        build_file = Label("//third_party/cargo/remote:futures-0.3.7.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_channel__0_3_7",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-channel/futures-channel-0.3.7.crate",
        type = "tar.gz",
        sha256 = "0448174b01148032eed37ac4aed28963aaaa8cfa93569a08e5b479bbc6c2c151",
        strip_prefix = "futures-channel-0.3.7",
        build_file = Label("//third_party/cargo/remote:futures-channel-0.3.7.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_core__0_3_7",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-core/futures-core-0.3.7.crate",
        type = "tar.gz",
        sha256 = "18eaa56102984bed2c88ea39026cff3ce3b4c7f508ca970cedf2450ea10d4e46",
        strip_prefix = "futures-core-0.3.7",
        build_file = Label("//third_party/cargo/remote:futures-core-0.3.7.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_executor__0_3_7",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-executor/futures-executor-0.3.7.crate",
        type = "tar.gz",
        sha256 = "f5f8e0c9258abaea85e78ebdda17ef9666d390e987f006be6080dfe354b708cb",
        strip_prefix = "futures-executor-0.3.7",
        build_file = Label("//third_party/cargo/remote:futures-executor-0.3.7.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_io__0_3_7",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-io/futures-io-0.3.7.crate",
        type = "tar.gz",
        sha256 = "6e1798854a4727ff944a7b12aa999f58ce7aa81db80d2dfaaf2ba06f065ddd2b",
        strip_prefix = "futures-io-0.3.7",
        build_file = Label("//third_party/cargo/remote:futures-io-0.3.7.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_lite__1_11_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-lite/futures-lite-1.11.2.crate",
        type = "tar.gz",
        sha256 = "5e6c079abfac3ab269e2927ec048dabc89d009ebfdda6b8ee86624f30c689658",
        strip_prefix = "futures-lite-1.11.2",
        build_file = Label("//third_party/cargo/remote:futures-lite-1.11.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_macro__0_3_7",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-macro/futures-macro-0.3.7.crate",
        type = "tar.gz",
        sha256 = "e36fccf3fc58563b4a14d265027c627c3b665d7fed489427e88e7cc929559efe",
        strip_prefix = "futures-macro-0.3.7",
        build_file = Label("//third_party/cargo/remote:futures-macro-0.3.7.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_sink__0_3_7",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-sink/futures-sink-0.3.7.crate",
        type = "tar.gz",
        sha256 = "0e3ca3f17d6e8804ae5d3df7a7d35b2b3a6fe89dac84b31872720fc3060a0b11",
        strip_prefix = "futures-sink-0.3.7",
        build_file = Label("//third_party/cargo/remote:futures-sink-0.3.7.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_task__0_3_7",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-task/futures-task-0.3.7.crate",
        type = "tar.gz",
        sha256 = "96d502af37186c4fef99453df03e374683f8a1eec9dcc1e66b3b82dc8278ce3c",
        strip_prefix = "futures-task-0.3.7",
        build_file = Label("//third_party/cargo/remote:futures-task-0.3.7.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_timer__3_0_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-timer/futures-timer-3.0.2.crate",
        type = "tar.gz",
        sha256 = "e64b03909df88034c26dc1547e8970b91f98bdb65165d6a4e9110d94263dbb2c",
        strip_prefix = "futures-timer-3.0.2",
        build_file = Label("//third_party/cargo/remote:futures-timer-3.0.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_util__0_3_7",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/futures-util/futures-util-0.3.7.crate",
        type = "tar.gz",
        sha256 = "abcb44342f62e6f3e8ac427b8aa815f724fd705dfad060b18ac7866c15bb8e34",
        strip_prefix = "futures-util-0.3.7",
        build_file = Label("//third_party/cargo/remote:futures-util-0.3.7.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__generic_array__0_12_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/generic-array/generic-array-0.12.3.crate",
        type = "tar.gz",
        sha256 = "c68f0274ae0e023facc3c97b2e00f076be70e254bc851d972503b328db79b2ec",
        strip_prefix = "generic-array-0.12.3",
        build_file = Label("//third_party/cargo/remote:generic-array-0.12.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__generic_array__0_14_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/generic-array/generic-array-0.14.4.crate",
        type = "tar.gz",
        sha256 = "501466ecc8a30d1d3b7fc9229b122b2ce8ed6e9d9223f1138d4babb253e51817",
        strip_prefix = "generic-array-0.14.4",
        build_file = Label("//third_party/cargo/remote:generic-array-0.14.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__getrandom__0_1_15",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/getrandom/getrandom-0.1.15.crate",
        type = "tar.gz",
        sha256 = "fc587bc0ec293155d5bfa6b9891ec18a1e330c234f896ea47fbada4cadbe47e6",
        strip_prefix = "getrandom-0.1.15",
        build_file = Label("//third_party/cargo/remote:getrandom-0.1.15.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ghash__0_3_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/ghash/ghash-0.3.0.crate",
        type = "tar.gz",
        sha256 = "d6e27f0689a6e15944bdce7e45425efb87eaa8ab0c6e87f11d0987a9133e2531",
        strip_prefix = "ghash-0.3.0",
        build_file = Label("//third_party/cargo/remote:ghash-0.3.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__gimli__0_22_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/gimli/gimli-0.22.0.crate",
        type = "tar.gz",
        sha256 = "aaf91faf136cb47367fa430cd46e37a788775e7fa104f8b4bcb3861dc389b724",
        strip_prefix = "gimli-0.22.0",
        build_file = Label("//third_party/cargo/remote:gimli-0.22.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__gloo_timers__0_2_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/gloo-timers/gloo-timers-0.2.1.crate",
        type = "tar.gz",
        sha256 = "47204a46aaff920a1ea58b11d03dec6f704287d27561724a4631e450654a891f",
        strip_prefix = "gloo-timers-0.2.1",
        build_file = Label("//third_party/cargo/remote:gloo-timers-0.2.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__hashbrown__0_9_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/hashbrown/hashbrown-0.9.1.crate",
        type = "tar.gz",
        sha256 = "d7afe4a420e3fe79967a00898cc1f4db7c8a49a9333a29f8a4bd76a253d5cd04",
        strip_prefix = "hashbrown-0.9.1",
        build_file = Label("//third_party/cargo/remote:hashbrown-0.9.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__heck__0_3_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/heck/heck-0.3.1.crate",
        type = "tar.gz",
        sha256 = "20564e78d53d2bb135c343b3f47714a56af2061f1c928fdb541dc7b9fdd94205",
        strip_prefix = "heck-0.3.1",
        build_file = Label("//third_party/cargo/remote:heck-0.3.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__hermit_abi__0_1_17",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/hermit-abi/hermit-abi-0.1.17.crate",
        type = "tar.gz",
        sha256 = "5aca5565f760fb5b220e499d72710ed156fdb74e631659e99377d9ebfbd13ae8",
        strip_prefix = "hermit-abi-0.1.17",
        build_file = Label("//third_party/cargo/remote:hermit-abi-0.1.17.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__hex__0_4_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/hex/hex-0.4.2.crate",
        type = "tar.gz",
        sha256 = "644f9158b2f133fd50f5fb3242878846d9eb792e445c893805ff0e3824006e35",
        strip_prefix = "hex-0.4.2",
        build_file = Label("//third_party/cargo/remote:hex-0.4.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__hkdf__0_9_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/hkdf/hkdf-0.9.0.crate",
        type = "tar.gz",
        sha256 = "fe1149865383e4526a43aee8495f9a325f0b806c63ce6427d06336a590abbbc9",
        strip_prefix = "hkdf-0.9.0",
        build_file = Label("//third_party/cargo/remote:hkdf-0.9.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__hmac__0_8_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/hmac/hmac-0.8.1.crate",
        type = "tar.gz",
        sha256 = "126888268dcc288495a26bf004b38c5fdbb31682f992c84ceb046a1f0fe38840",
        strip_prefix = "hmac-0.8.1",
        build_file = Label("//third_party/cargo/remote:hmac-0.8.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__http__0_2_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/http/http-0.2.1.crate",
        type = "tar.gz",
        sha256 = "28d569972648b2c512421b5f2a405ad6ac9666547189d0c5477a3f200f3e02f9",
        strip_prefix = "http-0.2.1",
        build_file = Label("//third_party/cargo/remote:http-0.2.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__http_client__6_2_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/http-client/http-client-6.2.0.crate",
        type = "tar.gz",
        sha256 = "010092b71b94ee49293995625ce7a607778b8b4099c8088fa84fd66bd3e0f21c",
        strip_prefix = "http-client-6.2.0",
        build_file = Label("//third_party/cargo/remote:http-client-6.2.0.BUILD.bazel"),
    )

    maybe(
        new_git_repository,
        name = "raze__http_types__2_6_0",
        remote = "https://github.com/ttiurani/http-types.git",
        commit = "910c3a299756a17fce36176839af3bd3463c7ffe",
        build_file = Label("//third_party/cargo/remote:http-types-2.6.0.BUILD.bazel"),
        init_submodules = True,
    )

    maybe(
        http_archive,
        name = "raze__httparse__1_3_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/httparse/httparse-1.3.4.crate",
        type = "tar.gz",
        sha256 = "cd179ae861f0c2e53da70d892f5f3029f9594be0c41dc5269cd371691b1dc2f9",
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
        sha256 = "02e2673c30ee86b5b96a9cb52ad15718aa1f966f5ab9ad54a8b95d5ca33120a9",
        strip_prefix = "idna-0.2.0",
        build_file = Label("//third_party/cargo/remote:idna-0.2.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__indexmap__1_6_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/indexmap/indexmap-1.6.0.crate",
        type = "tar.gz",
        sha256 = "55e2e4c765aa53a0424761bf9f41aa7a6ac1efa87238f59560640e27fca028f2",
        strip_prefix = "indexmap-1.6.0",
        build_file = Label("//third_party/cargo/remote:indexmap-1.6.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__infer__0_2_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/infer/infer-0.2.3.crate",
        type = "tar.gz",
        sha256 = "64e9829a50b42bb782c1df523f78d332fe371b10c661e78b7a3c34b0198e9fac",
        strip_prefix = "infer-0.2.3",
        build_file = Label("//third_party/cargo/remote:infer-0.2.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__input_buffer__0_3_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/input_buffer/input_buffer-0.3.1.crate",
        type = "tar.gz",
        sha256 = "19a8a95243d5a0398cae618ec29477c6e3cb631152be5c19481f80bc71559754",
        strip_prefix = "input_buffer-0.3.1",
        build_file = Label("//third_party/cargo/remote:input_buffer-0.3.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__instant__0_1_8",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/instant/instant-0.1.8.crate",
        type = "tar.gz",
        sha256 = "cb1fc4429a33e1f80d41dc9fea4d108a88bec1de8053878898ae448a0b52f613",
        strip_prefix = "instant-0.1.8",
        build_file = Label("//third_party/cargo/remote:instant-0.1.8.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__itertools__0_8_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/itertools/itertools-0.8.2.crate",
        type = "tar.gz",
        sha256 = "f56a2d0bc861f9165be4eb3442afd3c236d8a98afd426f65d92324ae1091a484",
        strip_prefix = "itertools-0.8.2",
        build_file = Label("//third_party/cargo/remote:itertools-0.8.2.BUILD.bazel"),
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
        sha256 = "ca059e81d9486668f12d455a4ea6daa600bd408134cd17e3d3fb5a32d1f016f8",
        strip_prefix = "js-sys-0.3.45",
        build_file = Label("//third_party/cargo/remote:js-sys-0.3.45.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__kv_log_macro__1_0_7",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/kv-log-macro/kv-log-macro-1.0.7.crate",
        type = "tar.gz",
        sha256 = "0de8b303297635ad57c9f5059fd9cee7a47f8e8daa09df0fcd07dd39fb22977f",
        strip_prefix = "kv-log-macro-1.0.7",
        build_file = Label("//third_party/cargo/remote:kv-log-macro-1.0.7.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__lazy_static__1_4_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/lazy_static/lazy_static-1.4.0.crate",
        type = "tar.gz",
        sha256 = "e2abad23fbc42b3700f2f279844dc832adb2b2eb069b2df918f455c4e18cc646",
        strip_prefix = "lazy_static-1.4.0",
        build_file = Label("//third_party/cargo/remote:lazy_static-1.4.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__libc__0_2_80",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/libc/libc-0.2.80.crate",
        type = "tar.gz",
        sha256 = "4d58d1b70b004888f764dfbf6a26a3b0342a1632d33968e4a179d8011c760614",
        strip_prefix = "libc-0.2.80",
        build_file = Label("//third_party/cargo/remote:libc-0.2.80.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__log__0_4_11",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/log/log-0.4.11.crate",
        type = "tar.gz",
        sha256 = "4fabed175da42fed1fa0746b0ea71f412aa9d35e76e95e59b192c64b9dc2bf8b",
        strip_prefix = "log-0.4.11",
        build_file = Label("//third_party/cargo/remote:log-0.4.11.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__maplit__1_0_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/maplit/maplit-1.0.2.crate",
        type = "tar.gz",
        sha256 = "3e2e65a1a2e43cfcb47a895c4c8b10d1f4a61097f9f254f183aee60cad9c651d",
        strip_prefix = "maplit-1.0.2",
        build_file = Label("//third_party/cargo/remote:maplit-1.0.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__matches__0_1_8",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/matches/matches-0.1.8.crate",
        type = "tar.gz",
        sha256 = "7ffc5c5338469d4d3ea17d269fa8ea3512ad247247c30bd2df69e68309ed0a08",
        strip_prefix = "matches-0.1.8",
        build_file = Label("//third_party/cargo/remote:matches-0.1.8.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__maybe_uninit__2_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/maybe-uninit/maybe-uninit-2.0.0.crate",
        type = "tar.gz",
        sha256 = "60302e4db3a61da70c0cb7991976248362f30319e88850c487b9b95bbf059e00",
        strip_prefix = "maybe-uninit-2.0.0",
        build_file = Label("//third_party/cargo/remote:maybe-uninit-2.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__memchr__2_3_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/memchr/memchr-2.3.3.crate",
        type = "tar.gz",
        sha256 = "3728d817d99e5ac407411fa471ff9800a778d88a24685968b36824eaf4bee400",
        strip_prefix = "memchr-2.3.3",
        build_file = Label("//third_party/cargo/remote:memchr-2.3.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__memory_pager__0_9_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/memory-pager/memory-pager-0.9.0.crate",
        type = "tar.gz",
        sha256 = "ad05e53b413682ea2aa20b027babc7316d5c637f5f52cff4b042f825fb76f9bb",
        strip_prefix = "memory-pager-0.9.0",
        build_file = Label("//third_party/cargo/remote:memory-pager-0.9.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__merkle_tree_stream__0_12_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/merkle-tree-stream/merkle-tree-stream-0.12.1.crate",
        type = "tar.gz",
        sha256 = "97c0d20e0a20306809c742af7cc5c0da05ac742580ec88d804cbfa509d9bbaf7",
        strip_prefix = "merkle-tree-stream-0.12.1",
        build_file = Label("//third_party/cargo/remote:merkle-tree-stream-0.12.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__miniz_oxide__0_4_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/miniz_oxide/miniz_oxide-0.4.3.crate",
        type = "tar.gz",
        sha256 = "0f2d26ec3309788e423cfbf68ad1800f061638098d76a83681af979dc4eda19d",
        strip_prefix = "miniz_oxide-0.4.3",
        build_file = Label("//third_party/cargo/remote:miniz_oxide-0.4.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__mkdirp__1_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/mkdirp/mkdirp-1.0.0.crate",
        type = "tar.gz",
        sha256 = "864e1de64c29b386d2dc7822aea156a7e4d45d4393ac748878dc21c9c41037f0",
        strip_prefix = "mkdirp-1.0.0",
        build_file = Label("//third_party/cargo/remote:mkdirp-1.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__multimap__0_8_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/multimap/multimap-0.8.2.crate",
        type = "tar.gz",
        sha256 = "1255076139a83bb467426e7f8d0134968a8118844faa755985e077cf31850333",
        strip_prefix = "multimap-0.8.2",
        build_file = Label("//third_party/cargo/remote:multimap-0.8.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__nb_connect__1_0_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/nb-connect/nb-connect-1.0.2.crate",
        type = "tar.gz",
        sha256 = "8123a81538e457d44b933a02faf885d3fe8408806b23fa700e8f01c6c3a98998",
        strip_prefix = "nb-connect-1.0.2",
        build_file = Label("//third_party/cargo/remote:nb-connect-1.0.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__nodrop__0_1_14",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/nodrop/nodrop-0.1.14.crate",
        type = "tar.gz",
        sha256 = "72ef4a56884ca558e5ddb05a1d1e7e1bfd9a68d9ed024c21704cc98872dae1bb",
        strip_prefix = "nodrop-0.1.14",
        build_file = Label("//third_party/cargo/remote:nodrop-0.1.14.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__num_integer__0_1_43",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/num-integer/num-integer-0.1.43.crate",
        type = "tar.gz",
        sha256 = "8d59457e662d541ba17869cf51cf177c0b5f0cbf476c66bdc90bf1edac4f875b",
        strip_prefix = "num-integer-0.1.43",
        build_file = Label("//third_party/cargo/remote:num-integer-0.1.43.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__num_traits__0_2_12",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/num-traits/num-traits-0.2.12.crate",
        type = "tar.gz",
        sha256 = "ac267bcc07f48ee5f8935ab0d24f316fb722d7a1292e2913f0cc196b29ffd611",
        strip_prefix = "num-traits-0.2.12",
        build_file = Label("//third_party/cargo/remote:num-traits-0.2.12.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__num_cpus__1_13_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/num_cpus/num_cpus-1.13.0.crate",
        type = "tar.gz",
        sha256 = "05499f3756671c15885fee9034446956fff3f243d6077b91e5767df161f766b3",
        strip_prefix = "num_cpus-1.13.0",
        build_file = Label("//third_party/cargo/remote:num_cpus-1.13.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__object__0_21_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/object/object-0.21.1.crate",
        type = "tar.gz",
        sha256 = "37fd5004feb2ce328a52b0b3d01dbf4ffff72583493900ed15f22d4111c51693",
        strip_prefix = "object-0.21.1",
        build_file = Label("//third_party/cargo/remote:object-0.21.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__once_cell__1_4_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/once_cell/once_cell-1.4.1.crate",
        type = "tar.gz",
        sha256 = "260e51e7efe62b592207e9e13a68e43692a7a279171d6ba57abd208bf23645ad",
        strip_prefix = "once_cell-1.4.1",
        build_file = Label("//third_party/cargo/remote:once_cell-1.4.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__opaque_debug__0_2_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/opaque-debug/opaque-debug-0.2.3.crate",
        type = "tar.gz",
        sha256 = "2839e79665f131bdb5782e51f2c6c9599c133c6098982a54c794358bf432529c",
        strip_prefix = "opaque-debug-0.2.3",
        build_file = Label("//third_party/cargo/remote:opaque-debug-0.2.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__opaque_debug__0_3_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/opaque-debug/opaque-debug-0.3.0.crate",
        type = "tar.gz",
        sha256 = "624a8340c38c1b80fd549087862da4ba43e08858af025b236e509b6649fc13d5",
        strip_prefix = "opaque-debug-0.3.0",
        build_file = Label("//third_party/cargo/remote:opaque-debug-0.3.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__os_pipe__0_9_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/os_pipe/os_pipe-0.9.2.crate",
        type = "tar.gz",
        sha256 = "fb233f06c2307e1f5ce2ecad9f8121cffbbee2c95428f44ea85222e460d0d213",
        strip_prefix = "os_pipe-0.9.2",
        build_file = Label("//third_party/cargo/remote:os_pipe-0.9.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__os_str_bytes__2_3_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/os_str_bytes/os_str_bytes-2.3.2.crate",
        type = "tar.gz",
        strip_prefix = "os_str_bytes-2.3.2",
        build_file = Label("//third_party/cargo/remote:os_str_bytes-2.3.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__parking__2_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/parking/parking-2.0.0.crate",
        type = "tar.gz",
        sha256 = "427c3892f9e783d91cc128285287e70a59e206ca452770ece88a76f7a3eddd72",
        strip_prefix = "parking-2.0.0",
        build_file = Label("//third_party/cargo/remote:parking-2.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__percent_encoding__2_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/percent-encoding/percent-encoding-2.1.0.crate",
        type = "tar.gz",
        sha256 = "d4fd5641d01c8f18a23da7b6fe29298ff4b55afcccdf78973b24cf3175fee32e",
        strip_prefix = "percent-encoding-2.1.0",
        build_file = Label("//third_party/cargo/remote:percent-encoding-2.1.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__petgraph__0_5_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/petgraph/petgraph-0.5.1.crate",
        type = "tar.gz",
        sha256 = "467d164a6de56270bd7c4d070df81d07beace25012d5103ced4e9ff08d6afdb7",
        strip_prefix = "petgraph-0.5.1",
        build_file = Label("//third_party/cargo/remote:petgraph-0.5.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pin_project__0_4_27",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/pin-project/pin-project-0.4.27.crate",
        type = "tar.gz",
        sha256 = "2ffbc8e94b38ea3d2d8ba92aea2983b503cd75d0888d75b86bb37970b5698e15",
        strip_prefix = "pin-project-0.4.27",
        build_file = Label("//third_party/cargo/remote:pin-project-0.4.27.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pin_project__1_0_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/pin-project/pin-project-1.0.1.crate",
        type = "tar.gz",
        sha256 = "ee41d838744f60d959d7074e3afb6b35c7456d0f61cad38a24e35e6553f73841",
        strip_prefix = "pin-project-1.0.1",
        build_file = Label("//third_party/cargo/remote:pin-project-1.0.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pin_project_internal__0_4_27",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/pin-project-internal/pin-project-internal-0.4.27.crate",
        type = "tar.gz",
        sha256 = "65ad2ae56b6abe3a1ee25f15ee605bacadb9a764edaba9c2bf4103800d4a1895",
        strip_prefix = "pin-project-internal-0.4.27",
        build_file = Label("//third_party/cargo/remote:pin-project-internal-0.4.27.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pin_project_internal__1_0_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/pin-project-internal/pin-project-internal-1.0.1.crate",
        type = "tar.gz",
        sha256 = "81a4ffa594b66bff340084d4081df649a7dc049ac8d7fc458d8e628bfbbb2f86",
        strip_prefix = "pin-project-internal-1.0.1",
        build_file = Label("//third_party/cargo/remote:pin-project-internal-1.0.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pin_project_lite__0_1_11",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/pin-project-lite/pin-project-lite-0.1.11.crate",
        type = "tar.gz",
        sha256 = "c917123afa01924fc84bb20c4c03f004d9c38e5127e3c039bbf7f4b9c76a2f6b",
        strip_prefix = "pin-project-lite-0.1.11",
        build_file = Label("//third_party/cargo/remote:pin-project-lite-0.1.11.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pin_utils__0_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/pin-utils/pin-utils-0.1.0.crate",
        type = "tar.gz",
        sha256 = "8b870d8c151b6f2fb93e84a13146138f05d02ed11c7e7c54f8826aaaf7c9f184",
        strip_prefix = "pin-utils-0.1.0",
        build_file = Label("//third_party/cargo/remote:pin-utils-0.1.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__polling__2_0_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/polling/polling-2.0.2.crate",
        type = "tar.gz",
        sha256 = "a2a7bc6b2a29e632e45451c941832803a18cce6781db04de8a04696cdca8bde4",
        strip_prefix = "polling-2.0.2",
        build_file = Label("//third_party/cargo/remote:polling-2.0.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__poly1305__0_6_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/poly1305/poly1305-0.6.1.crate",
        type = "tar.gz",
        sha256 = "22ce46de8e53ee414ca4d02bfefac75d8c12fba948b76622a40b4be34dfce980",
        strip_prefix = "poly1305-0.6.1",
        build_file = Label("//third_party/cargo/remote:poly1305-0.6.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__polyval__0_4_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/polyval/polyval-0.4.1.crate",
        type = "tar.gz",
        sha256 = "a5884790f1ce3553ad55fec37b5aaac5882e0e845a2612df744d6c85c9bf046c",
        strip_prefix = "polyval-0.4.1",
        build_file = Label("//third_party/cargo/remote:polyval-0.4.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ppv_lite86__0_2_9",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/ppv-lite86/ppv-lite86-0.2.9.crate",
        type = "tar.gz",
        sha256 = "c36fa947111f5c62a733b652544dd0016a43ce89619538a8ef92724a6f501a20",
        strip_prefix = "ppv-lite86-0.2.9",
        build_file = Label("//third_party/cargo/remote:ppv-lite86-0.2.9.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pretty_hash__0_4_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/pretty-hash/pretty-hash-0.4.1.crate",
        type = "tar.gz",
        sha256 = "d387ff148b27cb404e6a0d137ed5ffc520684384266be99210920e09643b5602",
        strip_prefix = "pretty-hash-0.4.1",
        build_file = Label("//third_party/cargo/remote:pretty-hash-0.4.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__proc_macro_error__1_0_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/proc-macro-error/proc-macro-error-1.0.4.crate",
        type = "tar.gz",
        strip_prefix = "proc-macro-error-1.0.4",
        build_file = Label("//third_party/cargo/remote:proc-macro-error-1.0.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__proc_macro_error_attr__1_0_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/proc-macro-error-attr/proc-macro-error-attr-1.0.4.crate",
        type = "tar.gz",
        strip_prefix = "proc-macro-error-attr-1.0.4",
        build_file = Label("//third_party/cargo/remote:proc-macro-error-attr-1.0.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__proc_macro_hack__0_5_19",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/proc-macro-hack/proc-macro-hack-0.5.19.crate",
        type = "tar.gz",
        sha256 = "dbf0c48bc1d91375ae5c3cd81e3722dff1abcf81a30960240640d223f59fe0e5",
        strip_prefix = "proc-macro-hack-0.5.19",
        build_file = Label("//third_party/cargo/remote:proc-macro-hack-0.5.19.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__proc_macro_nested__0_1_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/proc-macro-nested/proc-macro-nested-0.1.6.crate",
        type = "tar.gz",
        sha256 = "eba180dafb9038b050a4c280019bbedf9f2467b61e5d892dcad585bb57aadc5a",
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
        name = "raze__prost__0_6_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/prost/prost-0.6.1.crate",
        type = "tar.gz",
        sha256 = "ce49aefe0a6144a45de32927c77bd2859a5f7677b55f220ae5b744e87389c212",
        strip_prefix = "prost-0.6.1",
        build_file = Label("//third_party/cargo/remote:prost-0.6.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__prost_build__0_6_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/prost-build/prost-build-0.6.1.crate",
        type = "tar.gz",
        sha256 = "02b10678c913ecbd69350e8535c3aef91a8676c0773fc1d7b95cdd196d7f2f26",
        strip_prefix = "prost-build-0.6.1",
        build_file = Label("//third_party/cargo/remote:prost-build-0.6.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__prost_derive__0_6_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/prost-derive/prost-derive-0.6.1.crate",
        type = "tar.gz",
        sha256 = "537aa19b95acde10a12fec4301466386f757403de4cd4e5b4fa78fb5ecb18f72",
        strip_prefix = "prost-derive-0.6.1",
        build_file = Label("//third_party/cargo/remote:prost-derive-0.6.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__prost_types__0_6_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/prost-types/prost-types-0.6.1.crate",
        type = "tar.gz",
        sha256 = "1834f67c0697c001304b75be76f67add9c89742eda3a085ad8ee0bb38c3417aa",
        strip_prefix = "prost-types-0.6.1",
        build_file = Label("//third_party/cargo/remote:prost-types-0.6.1.BUILD.bazel"),
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
        sha256 = "64ac302d8f83c0c1974bf758f6b041c6c8ada916fbb44a609158ca8b064cc76c",
        strip_prefix = "rand-0.3.23",
        build_file = Label("//third_party/cargo/remote:rand-0.3.23.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand__0_4_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rand/rand-0.4.6.crate",
        type = "tar.gz",
        sha256 = "552840b97013b1a26992c11eac34bdd778e464601a4c2054b5f0bff7c6761293",
        strip_prefix = "rand-0.4.6",
        build_file = Label("//third_party/cargo/remote:rand-0.4.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand__0_7_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rand/rand-0.7.3.crate",
        type = "tar.gz",
        sha256 = "6a6b1679d49b24bbfe0c803429aa1874472f50d9b363131f0e89fc356b544d03",
        strip_prefix = "rand-0.7.3",
        build_file = Label("//third_party/cargo/remote:rand-0.7.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand_chacha__0_2_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rand_chacha/rand_chacha-0.2.2.crate",
        type = "tar.gz",
        sha256 = "f4c8ed856279c9737206bf725bf36935d8666ead7aa69b52be55af369d193402",
        strip_prefix = "rand_chacha-0.2.2",
        build_file = Label("//third_party/cargo/remote:rand_chacha-0.2.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand_core__0_3_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rand_core/rand_core-0.3.1.crate",
        type = "tar.gz",
        sha256 = "7a6fdeb83b075e8266dcc8762c22776f6877a63111121f5f8c7411e5be7eed4b",
        strip_prefix = "rand_core-0.3.1",
        build_file = Label("//third_party/cargo/remote:rand_core-0.3.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand_core__0_4_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rand_core/rand_core-0.4.2.crate",
        type = "tar.gz",
        sha256 = "9c33a3c44ca05fa6f1807d8e6743f3824e8509beca625669633be0acbdf509dc",
        strip_prefix = "rand_core-0.4.2",
        build_file = Label("//third_party/cargo/remote:rand_core-0.4.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand_core__0_5_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rand_core/rand_core-0.5.1.crate",
        type = "tar.gz",
        sha256 = "90bde5296fc891b0cef12a6d03ddccc162ce7b2aff54160af9338f8d40df6d19",
        strip_prefix = "rand_core-0.5.1",
        build_file = Label("//third_party/cargo/remote:rand_core-0.5.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand_hc__0_2_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rand_hc/rand_hc-0.2.0.crate",
        type = "tar.gz",
        sha256 = "ca3129af7b92a17112d59ad498c6f81eaf463253766b90396d39ea7a39d6613c",
        strip_prefix = "rand_hc-0.2.0",
        build_file = Label("//third_party/cargo/remote:rand_hc-0.2.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__random_access_disk__2_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/random-access-disk/random-access-disk-2.0.0.crate",
        type = "tar.gz",
        sha256 = "246bbdb354ccec46547e33d113411e95dfe28af66c32ab6b38ce897fc8816a42",
        strip_prefix = "random-access-disk-2.0.0",
        build_file = Label("//third_party/cargo/remote:random-access-disk-2.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__random_access_memory__2_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/random-access-memory/random-access-memory-2.0.0.crate",
        type = "tar.gz",
        sha256 = "9194febd5cecca959b411f5f397269dcc0a7928ffbeb85c33d16d70b8a5d8107",
        strip_prefix = "random-access-memory-2.0.0",
        build_file = Label("//third_party/cargo/remote:random-access-memory-2.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__random_access_storage__4_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/random-access-storage/random-access-storage-4.0.0.crate",
        type = "tar.gz",
        sha256 = "9d27bac8187e6f11f361c36af0ff2ee11a9aecad55b64c5e48470f28fdb3feac",
        strip_prefix = "random-access-storage-4.0.0",
        build_file = Label("//third_party/cargo/remote:random-access-storage-4.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rdrand__0_4_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rdrand/rdrand-0.4.0.crate",
        type = "tar.gz",
        sha256 = "678054eb77286b51581ba43620cc911abf02758c91f93f479767aed0f90458b2",
        strip_prefix = "rdrand-0.4.0",
        build_file = Label("//third_party/cargo/remote:rdrand-0.4.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__redox_syscall__0_1_57",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/redox_syscall/redox_syscall-0.1.57.crate",
        type = "tar.gz",
        sha256 = "41cc0f7e4d5d4544e8861606a285bb08d3e70712ccc7d2b84d7c0ccfaf4b05ce",
        strip_prefix = "redox_syscall-0.1.57",
        build_file = Label("//third_party/cargo/remote:redox_syscall-0.1.57.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__remove_dir_all__0_5_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/remove_dir_all/remove_dir_all-0.5.3.crate",
        type = "tar.gz",
        sha256 = "3acd125665422973a33ac9d3dd2df85edad0f4ae9b00dafb1a05e43a9f5ef8e7",
        strip_prefix = "remove_dir_all-0.5.3",
        build_file = Label("//third_party/cargo/remote:remove_dir_all-0.5.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__route_recognizer__0_2_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/route-recognizer/route-recognizer-0.2.0.crate",
        type = "tar.gz",
        sha256 = "56770675ebc04927ded3e60633437841581c285dc6236109ea25fbf3beb7b59e",
        strip_prefix = "route-recognizer-0.2.0",
        build_file = Label("//third_party/cargo/remote:route-recognizer-0.2.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rustc_demangle__0_1_18",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rustc-demangle/rustc-demangle-0.1.18.crate",
        type = "tar.gz",
        sha256 = "6e3bad0ee36814ca07d7968269dd4b7ec89ec2da10c4bb613928d3077083c232",
        strip_prefix = "rustc-demangle-0.1.18",
        build_file = Label("//third_party/cargo/remote:rustc-demangle-0.1.18.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rustc_version__0_2_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/rustc_version/rustc_version-0.2.3.crate",
        type = "tar.gz",
        sha256 = "138e3e0acb6c9fb258b19b67cb8abd63c00679d2851805ea151465464fe9030a",
        strip_prefix = "rustc_version-0.2.3",
        build_file = Label("//third_party/cargo/remote:rustc_version-0.2.3.BUILD.bazel"),
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
        name = "raze__salsa20__0_4_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/salsa20/salsa20-0.4.1.crate",
        type = "tar.gz",
        sha256 = "becffecaad76c7ff25f0ba16387721b48e7cfe0b04cd290478d338f4203eff3c",
        strip_prefix = "salsa20-0.4.1",
        build_file = Label("//third_party/cargo/remote:salsa20-0.4.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__semver__0_9_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/semver/semver-0.9.0.crate",
        type = "tar.gz",
        sha256 = "1d7eb9ef2c18661902cc47e535f9bc51b78acd254da71d375c2f6720d9a40403",
        strip_prefix = "semver-0.9.0",
        build_file = Label("//third_party/cargo/remote:semver-0.9.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__semver_parser__0_7_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/semver-parser/semver-parser-0.7.0.crate",
        type = "tar.gz",
        sha256 = "388a1df253eca08550bef6c72392cfe7c30914bf41df5269b68cbd6ff8f570a3",
        strip_prefix = "semver-parser-0.7.0",
        build_file = Label("//third_party/cargo/remote:semver-parser-0.7.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde__1_0_117",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/serde/serde-1.0.117.crate",
        type = "tar.gz",
        sha256 = "b88fa983de7720629c9387e9f517353ed404164b1e482c970a90c1a4aaf7dc1a",
        strip_prefix = "serde-1.0.117",
        build_file = Label("//third_party/cargo/remote:serde-1.0.117.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_derive__1_0_117",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/serde_derive/serde_derive-1.0.117.crate",
        type = "tar.gz",
        sha256 = "cbd1ae72adb44aab48f325a02444a5fc079349a8d804c1fc922aed3f7454c74e",
        strip_prefix = "serde_derive-1.0.117",
        build_file = Label("//third_party/cargo/remote:serde_derive-1.0.117.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_json__1_0_59",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/serde_json/serde_json-1.0.59.crate",
        type = "tar.gz",
        sha256 = "dcac07dbffa1c65e7f816ab9eba78eb142c6d44410f4eeba1e26e4f5dfa56b95",
        strip_prefix = "serde_json-1.0.59",
        build_file = Label("//third_party/cargo/remote:serde_json-1.0.59.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_qs__0_7_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/serde_qs/serde_qs-0.7.0.crate",
        type = "tar.gz",
        sha256 = "9408a61dabe404c76cec504ec510f7d92f41dc0a9362a0db8ab73d141cfbf93f",
        strip_prefix = "serde_qs-0.7.0",
        build_file = Label("//third_party/cargo/remote:serde_qs-0.7.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_urlencoded__0_7_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/serde_urlencoded/serde_urlencoded-0.7.0.crate",
        type = "tar.gz",
        sha256 = "edfa57a7f8d9c1d260a549e7224100f6c43d43f9103e06dd8b4095a9b2b43ce9",
        strip_prefix = "serde_urlencoded-0.7.0",
        build_file = Label("//third_party/cargo/remote:serde_urlencoded-0.7.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sha_1__0_8_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/sha-1/sha-1-0.8.2.crate",
        type = "tar.gz",
        sha256 = "f7d94d0bede923b3cea61f3f1ff57ff8cdfd77b400fb8f9998949e0cf04163df",
        strip_prefix = "sha-1-0.8.2",
        build_file = Label("//third_party/cargo/remote:sha-1-0.8.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sha_1__0_9_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/sha-1/sha-1-0.9.1.crate",
        type = "tar.gz",
        sha256 = "170a36ea86c864a3f16dd2687712dd6646f7019f301e57537c7f4dc9f5916770",
        strip_prefix = "sha-1-0.9.1",
        build_file = Label("//third_party/cargo/remote:sha-1-0.9.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sha1__0_6_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/sha1/sha1-0.6.0.crate",
        type = "tar.gz",
        sha256 = "2579985fda508104f7587689507983eadd6a6e84dd35d6d115361f530916fa0d",
        strip_prefix = "sha1-0.6.0",
        build_file = Label("//third_party/cargo/remote:sha1-0.6.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sha2__0_8_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/sha2/sha2-0.8.2.crate",
        type = "tar.gz",
        sha256 = "a256f46ea78a0c0d9ff00077504903ac881a1dafdc20da66545699e7776b3e69",
        strip_prefix = "sha2-0.8.2",
        build_file = Label("//third_party/cargo/remote:sha2-0.8.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sha2__0_9_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/sha2/sha2-0.9.1.crate",
        type = "tar.gz",
        sha256 = "2933378ddfeda7ea26f48c555bdad8bb446bf8a3d17832dc83e380d444cfb8c1",
        strip_prefix = "sha2-0.9.1",
        build_file = Label("//third_party/cargo/remote:sha2-0.9.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__shared_child__0_3_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/shared_child/shared_child-0.3.4.crate",
        type = "tar.gz",
        sha256 = "8cebcf3a403e4deafaf34dc882c4a1b6a648b43e5670aa2e4bb985914eaeb2d2",
        strip_prefix = "shared_child-0.3.4",
        build_file = Label("//third_party/cargo/remote:shared_child-0.3.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__slab__0_4_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/slab/slab-0.4.2.crate",
        type = "tar.gz",
        sha256 = "c111b5bd5695e56cffe5129854aa230b39c93a305372fdbb2668ca2394eea9f8",
        strip_prefix = "slab-0.4.2",
        build_file = Label("//third_party/cargo/remote:slab-0.4.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sleep_parser__0_8_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/sleep-parser/sleep-parser-0.8.0.crate",
        type = "tar.gz",
        sha256 = "b77744f73b2cee34255eccbac43289b960e412d926477d73375fe52a016fa774",
        strip_prefix = "sleep-parser-0.8.0",
        build_file = Label("//third_party/cargo/remote:sleep-parser-0.8.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__snow__0_7_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/snow/snow-0.7.2.crate",
        type = "tar.gz",
        sha256 = "795dd7aeeee24468e5a32661f6d27f7b5cbed802031b2d7640c7b10f8fb2dd50",
        strip_prefix = "snow-0.7.2",
        build_file = Label("//third_party/cargo/remote:snow-0.7.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sparse_bitfield__0_11_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/sparse-bitfield/sparse-bitfield-0.11.0.crate",
        type = "tar.gz",
        sha256 = "f98e2a9d642ccbbd1b67dff822a7d3115f18f133bf840ca3e551567eabdee074",
        strip_prefix = "sparse-bitfield-0.11.0",
        build_file = Label("//third_party/cargo/remote:sparse-bitfield-0.11.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stable_deref_trait__1_2_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/stable_deref_trait/stable_deref_trait-1.2.0.crate",
        type = "tar.gz",
        sha256 = "a8f112729512f8e442d81f95a8a7ddf2b7c6b8a1a6f509a95864142b30cab2d3",
        strip_prefix = "stable_deref_trait-1.2.0",
        build_file = Label("//third_party/cargo/remote:stable_deref_trait-1.2.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__standback__0_2_11",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/standback/standback-0.2.11.crate",
        type = "tar.gz",
        sha256 = "f4e0831040d2cf2bdfd51b844be71885783d489898a192f254ae25d57cce725c",
        strip_prefix = "standback-0.2.11",
        build_file = Label("//third_party/cargo/remote:standback-0.2.11.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stdweb__0_4_20",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/stdweb/stdweb-0.4.20.crate",
        type = "tar.gz",
        sha256 = "d022496b16281348b52d0e30ae99e01a73d737b2f45d38fed4edf79f9325a1d5",
        strip_prefix = "stdweb-0.4.20",
        build_file = Label("//third_party/cargo/remote:stdweb-0.4.20.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stdweb_derive__0_5_3",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/stdweb-derive/stdweb-derive-0.5.3.crate",
        type = "tar.gz",
        sha256 = "c87a60a40fccc84bef0652345bbbbbe20a605bf5d0ce81719fc476f5c03b50ef",
        strip_prefix = "stdweb-derive-0.5.3",
        build_file = Label("//third_party/cargo/remote:stdweb-derive-0.5.3.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stdweb_internal_macros__0_2_9",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/stdweb-internal-macros/stdweb-internal-macros-0.2.9.crate",
        type = "tar.gz",
        sha256 = "58fa5ff6ad0d98d1ffa8cb115892b6e69d67799f6763e162a1c9db421dc22e11",
        strip_prefix = "stdweb-internal-macros-0.2.9",
        build_file = Label("//third_party/cargo/remote:stdweb-internal-macros-0.2.9.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stdweb_internal_runtime__0_1_5",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/stdweb-internal-runtime/stdweb-internal-runtime-0.1.5.crate",
        type = "tar.gz",
        sha256 = "213701ba3370744dcd1a12960caa4843b3d68b4d1c0a5d575e0d65b2ee9d16c0",
        strip_prefix = "stdweb-internal-runtime-0.1.5",
        build_file = Label("//third_party/cargo/remote:stdweb-internal-runtime-0.1.5.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stream_cipher__0_3_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/stream-cipher/stream-cipher-0.3.2.crate",
        type = "tar.gz",
        sha256 = "8131256a5896cabcf5eb04f4d6dacbe1aefda854b0d9896e09cb58829ec5638c",
        strip_prefix = "stream-cipher-0.3.2",
        build_file = Label("//third_party/cargo/remote:stream-cipher-0.3.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stream_cipher__0_7_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/stream-cipher/stream-cipher-0.7.1.crate",
        type = "tar.gz",
        sha256 = "c80e15f898d8d8f25db24c253ea615cc14acf418ff307822995814e7d42cfa89",
        strip_prefix = "stream-cipher-0.7.1",
        build_file = Label("//third_party/cargo/remote:stream-cipher-0.7.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__strsim__0_10_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/strsim/strsim-0.10.0.crate",
        type = "tar.gz",
        strip_prefix = "strsim-0.10.0",
        build_file = Label("//third_party/cargo/remote:strsim-0.10.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__subtle__2_3_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/subtle/subtle-2.3.0.crate",
        type = "tar.gz",
        sha256 = "343f3f510c2915908f155e94f17220b19ccfacf2a64a2a5d8004f2c3e311e7fd",
        strip_prefix = "subtle-2.3.0",
        build_file = Label("//third_party/cargo/remote:subtle-2.3.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__syn__1_0_48",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/syn/syn-1.0.48.crate",
        type = "tar.gz",
        sha256 = "cc371affeffc477f42a221a1e4297aedcea33d47d19b61455588bd9d8f6b19ac",
        strip_prefix = "syn-1.0.48",
        build_file = Label("//third_party/cargo/remote:syn-1.0.48.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__synstructure__0_12_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/synstructure/synstructure-0.12.4.crate",
        type = "tar.gz",
        sha256 = "b834f2d66f734cb897113e34aaff2f1ab4719ca946f9a7358dba8f8064148701",
        strip_prefix = "synstructure-0.12.4",
        build_file = Label("//third_party/cargo/remote:synstructure-0.12.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tempfile__3_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/tempfile/tempfile-3.1.0.crate",
        type = "tar.gz",
        sha256 = "7a6e24d9338a0a5be79593e2fa15a648add6138caa803e2d5bc782c371732ca9",
        strip_prefix = "tempfile-3.1.0",
        build_file = Label("//third_party/cargo/remote:tempfile-3.1.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__termcolor__1_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/termcolor/termcolor-1.1.0.crate",
        type = "tar.gz",
        strip_prefix = "termcolor-1.1.0",
        build_file = Label("//third_party/cargo/remote:termcolor-1.1.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__textwrap__0_12_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/textwrap/textwrap-0.12.1.crate",
        type = "tar.gz",
        strip_prefix = "textwrap-0.12.1",
        build_file = Label("//third_party/cargo/remote:textwrap-0.12.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__thiserror__1_0_21",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/thiserror/thiserror-1.0.21.crate",
        type = "tar.gz",
        sha256 = "318234ffa22e0920fe9a40d7b8369b5f649d490980cf7aadcf1eb91594869b42",
        strip_prefix = "thiserror-1.0.21",
        build_file = Label("//third_party/cargo/remote:thiserror-1.0.21.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__thiserror_impl__1_0_21",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/thiserror-impl/thiserror-impl-1.0.21.crate",
        type = "tar.gz",
        sha256 = "cae2447b6282786c3493999f40a9be2a6ad20cb8bd268b0a0dbf5a065535c0ab",
        strip_prefix = "thiserror-impl-1.0.21",
        build_file = Label("//third_party/cargo/remote:thiserror-impl-1.0.21.BUILD.bazel"),
    )

    maybe(
        new_git_repository,
        name = "raze__tide__0_14_0",
        remote = "https://github.com/ttiurani/tide.git",
        commit = "8c5d5184a70c44061a0f146ec11118345d1e52a9",
        build_file = Label("//third_party/cargo/remote:tide-0.14.0.BUILD.bazel"),
        init_submodules = True,
    )

    maybe(
        http_archive,
        name = "raze__time__0_1_44",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/time/time-0.1.44.crate",
        type = "tar.gz",
        sha256 = "6db9e6914ab8b1ae1c260a4ae7a49b6c5611b40328a735b21862567685e73255",
        strip_prefix = "time-0.1.44",
        build_file = Label("//third_party/cargo/remote:time-0.1.44.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__time__0_2_22",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/time/time-0.2.22.crate",
        type = "tar.gz",
        sha256 = "55b7151c9065e80917fbf285d9a5d1432f60db41d170ccafc749a136b41a93af",
        strip_prefix = "time-0.2.22",
        build_file = Label("//third_party/cargo/remote:time-0.2.22.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__time_macros__0_1_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/time-macros/time-macros-0.1.1.crate",
        type = "tar.gz",
        sha256 = "957e9c6e26f12cb6d0dd7fc776bb67a706312e7299aed74c8dd5b17ebb27e2f1",
        strip_prefix = "time-macros-0.1.1",
        build_file = Label("//third_party/cargo/remote:time-macros-0.1.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__time_macros_impl__0_1_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/time-macros-impl/time-macros-impl-0.1.1.crate",
        type = "tar.gz",
        sha256 = "e5c3be1edfad6027c69f5491cf4cb310d1a71ecd6af742788c6ff8bced86b8fa",
        strip_prefix = "time-macros-impl-0.1.1",
        build_file = Label("//third_party/cargo/remote:time-macros-impl-0.1.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tinyvec__0_3_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/tinyvec/tinyvec-0.3.4.crate",
        type = "tar.gz",
        sha256 = "238ce071d267c5710f9d31451efec16c5ee22de34df17cc05e56cbc92e967117",
        strip_prefix = "tinyvec-0.3.4",
        build_file = Label("//third_party/cargo/remote:tinyvec-0.3.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tree_index__0_6_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/tree-index/tree-index-0.6.1.crate",
        type = "tar.gz",
        sha256 = "c8cccd9e5400719d4676d810725f4a48e6923fcedb670adba39cfb4fde7d01a3",
        strip_prefix = "tree-index-0.6.1",
        build_file = Label("//third_party/cargo/remote:tree-index-0.6.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tungstenite__0_11_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/tungstenite/tungstenite-0.11.1.crate",
        type = "tar.gz",
        sha256 = "f0308d80d86700c5878b9ef6321f020f29b1bb9d5ff3cab25e75e23f3a492a23",
        strip_prefix = "tungstenite-0.11.1",
        build_file = Label("//third_party/cargo/remote:tungstenite-0.11.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__typenum__1_12_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/typenum/typenum-1.12.0.crate",
        type = "tar.gz",
        sha256 = "373c8a200f9e67a0c95e62a4f52fbf80c23b4381c05a17845531982fa99e6b33",
        strip_prefix = "typenum-1.12.0",
        build_file = Label("//third_party/cargo/remote:typenum-1.12.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_bidi__0_3_4",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/unicode-bidi/unicode-bidi-0.3.4.crate",
        type = "tar.gz",
        sha256 = "49f2bd0c6468a8230e1db229cff8029217cf623c767ea5d60bfbd42729ea54d5",
        strip_prefix = "unicode-bidi-0.3.4",
        build_file = Label("//third_party/cargo/remote:unicode-bidi-0.3.4.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_normalization__0_1_13",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/unicode-normalization/unicode-normalization-0.1.13.crate",
        type = "tar.gz",
        sha256 = "6fb19cf769fa8c6a80a162df694621ebeb4dafb606470b2b2fce0be40a98a977",
        strip_prefix = "unicode-normalization-0.1.13",
        build_file = Label("//third_party/cargo/remote:unicode-normalization-0.1.13.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_segmentation__1_6_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/unicode-segmentation/unicode-segmentation-1.6.0.crate",
        type = "tar.gz",
        sha256 = "e83e153d1053cbb5a118eeff7fd5be06ed99153f00dbcd8ae310c5fb2b22edc0",
        strip_prefix = "unicode-segmentation-1.6.0",
        build_file = Label("//third_party/cargo/remote:unicode-segmentation-1.6.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_width__0_1_8",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/unicode-width/unicode-width-0.1.8.crate",
        type = "tar.gz",
        strip_prefix = "unicode-width-0.1.8",
        build_file = Label("//third_party/cargo/remote:unicode-width-0.1.8.BUILD.bazel"),
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
        name = "raze__universal_hash__0_4_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/universal-hash/universal-hash-0.4.0.crate",
        type = "tar.gz",
        sha256 = "8326b2c654932e3e4f9196e69d08fdf7cfd718e1dc6f66b347e6024a0c961402",
        strip_prefix = "universal-hash-0.4.0",
        build_file = Label("//third_party/cargo/remote:universal-hash-0.4.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__url__2_1_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/url/url-2.1.1.crate",
        type = "tar.gz",
        sha256 = "829d4a8476c35c9bf0bbce5a3b23f4106f79728039b726d292bb93bc106787cb",
        strip_prefix = "url-2.1.1",
        build_file = Label("//third_party/cargo/remote:url-2.1.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__utf_8__0_7_5",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/utf-8/utf-8-0.7.5.crate",
        type = "tar.gz",
        sha256 = "05e42f7c18b8f902290b009cde6d651262f956c98bc51bca4cd1d511c9cd85c7",
        strip_prefix = "utf-8-0.7.5",
        build_file = Label("//third_party/cargo/remote:utf-8-0.7.5.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__uuid__0_5_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/uuid/uuid-0.5.1.crate",
        type = "tar.gz",
        sha256 = "bcc7e3b898aa6f6c08e5295b6c89258d1331e9ac578cc992fb818759951bdc22",
        strip_prefix = "uuid-0.5.1",
        build_file = Label("//third_party/cargo/remote:uuid-0.5.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__varinteger__1_0_6",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/varinteger/varinteger-1.0.6.crate",
        type = "tar.gz",
        sha256 = "7ea29db9f94ff08bb619656b8120878f280526f71dc88b5262c958a510181812",
        strip_prefix = "varinteger-1.0.6",
        build_file = Label("//third_party/cargo/remote:varinteger-1.0.6.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__vec_arena__1_0_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/vec-arena/vec-arena-1.0.0.crate",
        type = "tar.gz",
        sha256 = "eafc1b9b2dfc6f5529177b62cf806484db55b32dc7c9658a118e11bbeb33061d",
        strip_prefix = "vec-arena-1.0.0",
        build_file = Label("//third_party/cargo/remote:vec-arena-1.0.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__vec_map__0_8_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/vec_map/vec_map-0.8.2.crate",
        type = "tar.gz",
        strip_prefix = "vec_map-0.8.2",
        build_file = Label("//third_party/cargo/remote:vec_map-0.8.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__version_check__0_9_2",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/version_check/version_check-0.9.2.crate",
        type = "tar.gz",
        sha256 = "b5a972e5669d67ba988ce3dc826706fb0a8b01471c088cb0b6110b805cc36aed",
        strip_prefix = "version_check-0.9.2",
        build_file = Label("//third_party/cargo/remote:version_check-0.9.2.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__waker_fn__1_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/waker-fn/waker-fn-1.1.0.crate",
        type = "tar.gz",
        sha256 = "9d5b2c62b4012a3e1eca5a7e077d13b3bf498c4073e33ccd58626607748ceeca",
        strip_prefix = "waker-fn-1.1.0",
        build_file = Label("//third_party/cargo/remote:waker-fn-1.1.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasi__0_10_0_wasi_snapshot_preview1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/wasi/wasi-0.10.0+wasi-snapshot-preview1.crate",
        type = "tar.gz",
        sha256 = "1a143597ca7c7793eff794def352d41792a93c481eb1042423ff7ff72ba2c31f",
        strip_prefix = "wasi-0.10.0+wasi-snapshot-preview1",
        build_file = Label("//third_party/cargo/remote:wasi-0.10.0+wasi-snapshot-preview1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasi__0_9_0_wasi_snapshot_preview1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/wasi/wasi-0.9.0+wasi-snapshot-preview1.crate",
        type = "tar.gz",
        sha256 = "cccddf32554fecc6acb585f82a32a72e28b48f8c4c1883ddfeeeaa96f7d8e519",
        strip_prefix = "wasi-0.9.0+wasi-snapshot-preview1",
        build_file = Label("//third_party/cargo/remote:wasi-0.9.0+wasi-snapshot-preview1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen__0_2_68",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/wasm-bindgen/wasm-bindgen-0.2.68.crate",
        type = "tar.gz",
        sha256 = "1ac64ead5ea5f05873d7c12b545865ca2b8d28adfc50a49b84770a3a97265d42",
        strip_prefix = "wasm-bindgen-0.2.68",
        build_file = Label("//third_party/cargo/remote:wasm-bindgen-0.2.68.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_backend__0_2_68",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/wasm-bindgen-backend/wasm-bindgen-backend-0.2.68.crate",
        type = "tar.gz",
        sha256 = "f22b422e2a757c35a73774860af8e112bff612ce6cb604224e8e47641a9e4f68",
        strip_prefix = "wasm-bindgen-backend-0.2.68",
        build_file = Label("//third_party/cargo/remote:wasm-bindgen-backend-0.2.68.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_futures__0_4_18",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/wasm-bindgen-futures/wasm-bindgen-futures-0.4.18.crate",
        type = "tar.gz",
        sha256 = "b7866cab0aa01de1edf8b5d7936938a7e397ee50ce24119aef3e1eaa3b6171da",
        strip_prefix = "wasm-bindgen-futures-0.4.18",
        build_file = Label("//third_party/cargo/remote:wasm-bindgen-futures-0.4.18.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_macro__0_2_68",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/wasm-bindgen-macro/wasm-bindgen-macro-0.2.68.crate",
        type = "tar.gz",
        sha256 = "6b13312a745c08c469f0b292dd2fcd6411dba5f7160f593da6ef69b64e407038",
        strip_prefix = "wasm-bindgen-macro-0.2.68",
        build_file = Label("//third_party/cargo/remote:wasm-bindgen-macro-0.2.68.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_macro_support__0_2_68",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/wasm-bindgen-macro-support/wasm-bindgen-macro-support-0.2.68.crate",
        type = "tar.gz",
        sha256 = "f249f06ef7ee334cc3b8ff031bfc11ec99d00f34d86da7498396dc1e3b1498fe",
        strip_prefix = "wasm-bindgen-macro-support-0.2.68",
        build_file = Label("//third_party/cargo/remote:wasm-bindgen-macro-support-0.2.68.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_shared__0_2_68",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/wasm-bindgen-shared/wasm-bindgen-shared-0.2.68.crate",
        type = "tar.gz",
        sha256 = "1d649a3145108d7d3fbcde896a468d1bd636791823c9921135218ad89be08307",
        strip_prefix = "wasm-bindgen-shared-0.2.68",
        build_file = Label("//third_party/cargo/remote:wasm-bindgen-shared-0.2.68.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__web_sys__0_3_45",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/web-sys/web-sys-0.3.45.crate",
        type = "tar.gz",
        sha256 = "4bf6ef87ad7ae8008e15a355ce696bed26012b7caa21605188cfd8214ab51e2d",
        strip_prefix = "web-sys-0.3.45",
        build_file = Label("//third_party/cargo/remote:web-sys-0.3.45.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__websocket_handshake__0_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/websocket_handshake/websocket_handshake-0.1.0.crate",
        type = "tar.gz",
        sha256 = "60819034828ff40be2a945856282ed27b6412a58d0849225f2ae05d9d3fd9f83",
        strip_prefix = "websocket_handshake-0.1.0",
        build_file = Label("//third_party/cargo/remote:websocket_handshake-0.1.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wepoll_sys__3_0_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/wepoll-sys/wepoll-sys-3.0.1.crate",
        type = "tar.gz",
        sha256 = "0fcb14dea929042224824779fbc82d9fab8d2e6d3cbc0ac404de8edf489e77ff",
        strip_prefix = "wepoll-sys-3.0.1",
        build_file = Label("//third_party/cargo/remote:wepoll-sys-3.0.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__which__3_1_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/which/which-3.1.1.crate",
        type = "tar.gz",
        sha256 = "d011071ae14a2f6671d0b74080ae0cd8ebf3a6f8c9589a2cd45f23126fe29724",
        strip_prefix = "which-3.1.1",
        build_file = Label("//third_party/cargo/remote:which-3.1.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__winapi__0_3_9",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/winapi/winapi-0.3.9.crate",
        type = "tar.gz",
        sha256 = "5c839a674fcd7a98952e593242ea400abe93992746761e38641405d28b00f419",
        strip_prefix = "winapi-0.3.9",
        build_file = Label("//third_party/cargo/remote:winapi-0.3.9.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__winapi_i686_pc_windows_gnu__0_4_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/winapi-i686-pc-windows-gnu/winapi-i686-pc-windows-gnu-0.4.0.crate",
        type = "tar.gz",
        sha256 = "ac3b87c63620426dd9b991e5ce0329eff545bccbbb34f3be09ff6fb6ab51b7b6",
        strip_prefix = "winapi-i686-pc-windows-gnu-0.4.0",
        build_file = Label("//third_party/cargo/remote:winapi-i686-pc-windows-gnu-0.4.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__winapi_util__0_1_5",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/winapi-util/winapi-util-0.1.5.crate",
        type = "tar.gz",
        strip_prefix = "winapi-util-0.1.5",
        build_file = Label("//third_party/cargo/remote:winapi-util-0.1.5.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__winapi_x86_64_pc_windows_gnu__0_4_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/winapi-x86_64-pc-windows-gnu/winapi-x86_64-pc-windows-gnu-0.4.0.crate",
        type = "tar.gz",
        sha256 = "712e227841d057c1ee1cd2fb22fa7e5a5461ae8e48fa2ca79ec42cfc1931183f",
        strip_prefix = "winapi-x86_64-pc-windows-gnu-0.4.0",
        build_file = Label("//third_party/cargo/remote:winapi-x86_64-pc-windows-gnu-0.4.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__x25519_dalek__1_1_0",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/x25519-dalek/x25519-dalek-1.1.0.crate",
        type = "tar.gz",
        sha256 = "bc614d95359fd7afc321b66d2107ede58b246b844cf5d8a0adcca413e439f088",
        strip_prefix = "x25519-dalek-1.1.0",
        build_file = Label("//third_party/cargo/remote:x25519-dalek-1.1.0.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__zeroize__1_1_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/zeroize/zeroize-1.1.1.crate",
        type = "tar.gz",
        sha256 = "05f33972566adbd2d3588b0491eb94b98b43695c4ef897903470ede4f3f5a28a",
        strip_prefix = "zeroize-1.1.1",
        build_file = Label("//third_party/cargo/remote:zeroize-1.1.1.BUILD.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__zeroize_derive__1_0_1",
        url = "https://crates-io.s3-us-west-1.amazonaws.com/crates/zeroize_derive/zeroize_derive-1.0.1.crate",
        type = "tar.gz",
        sha256 = "c3f369ddb18862aba61aa49bf31e74d29f0f162dec753063200e1dc084345d16",
        strip_prefix = "zeroize_derive-1.0.1",
        build_file = Label("//third_party/cargo/remote:zeroize_derive-1.0.1.BUILD.bazel"),
    )
