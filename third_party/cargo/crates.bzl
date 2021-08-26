"""
@generated
cargo-raze generated Bazel file.

DO NOT EDIT! Replaced on runs of cargo-raze
"""

load("@bazel_tools//tools/build_defs/repo:git.bzl", "new_git_repository")  # buildifier: disable=load
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")  # buildifier: disable=load
load("@bazel_tools//tools/build_defs/repo:utils.bzl", "maybe")  # buildifier: disable=load

def raze_fetch_remote_crates():
    """This function defines a collection of repos and should be called in a WORKSPACE file"""
    maybe(
        http_archive,
        name = "raze__addr2line__0_16_0",
        url = "https://crates.io/api/v1/crates/addr2line/0.16.0/download",
        type = "tar.gz",
        sha256 = "3e61f2b7f93d2c7d2b08263acaa4a363b3e276806c68af6134c44f523bf1aacd",
        strip_prefix = "addr2line-0.16.0",
        build_file = Label("//third_party/cargo/remote:BUILD.addr2line-0.16.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__adler__1_0_2",
        url = "https://crates.io/api/v1/crates/adler/1.0.2/download",
        type = "tar.gz",
        sha256 = "f26201604c87b1e01bd3d98f8d5d9a8fcbb815e8cedb41ffccbeb4bf593a35fe",
        strip_prefix = "adler-1.0.2",
        build_file = Label("//third_party/cargo/remote:BUILD.adler-1.0.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aead__0_3_2",
        url = "https://crates.io/api/v1/crates/aead/0.3.2/download",
        type = "tar.gz",
        sha256 = "7fc95d1bdb8e6666b2b217308eeeb09f2d6728d104be3e31916cc74d15420331",
        strip_prefix = "aead-0.3.2",
        build_file = Label("//third_party/cargo/remote:BUILD.aead-0.3.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aes__0_5_0",
        url = "https://crates.io/api/v1/crates/aes/0.5.0/download",
        type = "tar.gz",
        sha256 = "dd2bc6d3f370b5666245ff421e231cba4353df936e26986d2918e61a8fd6aef6",
        strip_prefix = "aes-0.5.0",
        build_file = Label("//third_party/cargo/remote:BUILD.aes-0.5.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aes__0_6_0",
        url = "https://crates.io/api/v1/crates/aes/0.6.0/download",
        type = "tar.gz",
        sha256 = "884391ef1066acaa41e766ba8f596341b96e93ce34f9a43e7d24bf0a0eaf0561",
        strip_prefix = "aes-0.6.0",
        build_file = Label("//third_party/cargo/remote:BUILD.aes-0.6.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aes_gcm__0_7_0",
        url = "https://crates.io/api/v1/crates/aes-gcm/0.7.0/download",
        type = "tar.gz",
        sha256 = "0301c9e9c443494d970a07885e8cf3e587bae8356a1d5abd0999068413f7205f",
        strip_prefix = "aes-gcm-0.7.0",
        build_file = Label("//third_party/cargo/remote:BUILD.aes-gcm-0.7.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aes_gcm__0_8_0",
        url = "https://crates.io/api/v1/crates/aes-gcm/0.8.0/download",
        type = "tar.gz",
        sha256 = "5278b5fabbb9bd46e24aa69b2fdea62c99088e0a950a9be40e3e0101298f88da",
        strip_prefix = "aes-gcm-0.8.0",
        build_file = Label("//third_party/cargo/remote:BUILD.aes-gcm-0.8.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aes_soft__0_5_0",
        url = "https://crates.io/api/v1/crates/aes-soft/0.5.0/download",
        type = "tar.gz",
        sha256 = "63dd91889c49327ad7ef3b500fd1109dbd3c509a03db0d4a9ce413b79f575cb6",
        strip_prefix = "aes-soft-0.5.0",
        build_file = Label("//third_party/cargo/remote:BUILD.aes-soft-0.5.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aes_soft__0_6_4",
        url = "https://crates.io/api/v1/crates/aes-soft/0.6.4/download",
        type = "tar.gz",
        sha256 = "be14c7498ea50828a38d0e24a765ed2effe92a705885b57d029cd67d45744072",
        strip_prefix = "aes-soft-0.6.4",
        build_file = Label("//third_party/cargo/remote:BUILD.aes-soft-0.6.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aesni__0_10_0",
        url = "https://crates.io/api/v1/crates/aesni/0.10.0/download",
        type = "tar.gz",
        sha256 = "ea2e11f5e94c2f7d386164cc2aa1f97823fed6f259e486940a71c174dd01b0ce",
        strip_prefix = "aesni-0.10.0",
        build_file = Label("//third_party/cargo/remote:BUILD.aesni-0.10.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aesni__0_8_0",
        url = "https://crates.io/api/v1/crates/aesni/0.8.0/download",
        type = "tar.gz",
        sha256 = "0a6fe808308bb07d393e2ea47780043ec47683fcf19cf5efc8ca51c50cc8c68a",
        strip_prefix = "aesni-0.8.0",
        build_file = Label("//third_party/cargo/remote:BUILD.aesni-0.8.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__anyhow__1_0_43",
        url = "https://crates.io/api/v1/crates/anyhow/1.0.43/download",
        type = "tar.gz",
        sha256 = "28ae2b3dec75a406790005a200b1bd89785afc02517a00ca99ecfe093ee9e6cf",
        strip_prefix = "anyhow-1.0.43",
        build_file = Label("//third_party/cargo/remote:BUILD.anyhow-1.0.43.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__arrayref__0_3_6",
        url = "https://crates.io/api/v1/crates/arrayref/0.3.6/download",
        type = "tar.gz",
        sha256 = "a4c527152e37cf757a3f78aae5a06fbeefdb07ccc535c980a3208ee3060dd544",
        strip_prefix = "arrayref-0.3.6",
        build_file = Label("//third_party/cargo/remote:BUILD.arrayref-0.3.6.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__arrayvec__0_4_12",
        url = "https://crates.io/api/v1/crates/arrayvec/0.4.12/download",
        type = "tar.gz",
        sha256 = "cd9fd44efafa8690358b7408d253adf110036b88f55672a933f01d616ad9b1b9",
        strip_prefix = "arrayvec-0.4.12",
        build_file = Label("//third_party/cargo/remote:BUILD.arrayvec-0.4.12.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__arrayvec__0_5_2",
        url = "https://crates.io/api/v1/crates/arrayvec/0.5.2/download",
        type = "tar.gz",
        sha256 = "23b62fc65de8e4e7f52534fb52b0f3ed04746ae267519eef2a83941e8085068b",
        strip_prefix = "arrayvec-0.5.2",
        build_file = Label("//third_party/cargo/remote:BUILD.arrayvec-0.5.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_channel__1_6_1",
        url = "https://crates.io/api/v1/crates/async-channel/1.6.1/download",
        type = "tar.gz",
        sha256 = "2114d64672151c0c5eaa5e131ec84a74f06e1e559830dabba01ca30605d66319",
        strip_prefix = "async-channel-1.6.1",
        build_file = Label("//third_party/cargo/remote:BUILD.async-channel-1.6.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_ctrlc__1_2_0",
        url = "https://crates.io/api/v1/crates/async-ctrlc/1.2.0/download",
        type = "tar.gz",
        sha256 = "907279f6e91a51c8ec7cac24711e8308f21da7c10c7700ca2f7e125694ed2df1",
        strip_prefix = "async-ctrlc-1.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-ctrlc-1.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_dup__1_2_2",
        url = "https://crates.io/api/v1/crates/async-dup/1.2.2/download",
        type = "tar.gz",
        sha256 = "7427a12b8dc09291528cfb1da2447059adb4a257388c2acd6497a79d55cf6f7c",
        strip_prefix = "async-dup-1.2.2",
        build_file = Label("//third_party/cargo/remote:BUILD.async-dup-1.2.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_executor__1_4_1",
        url = "https://crates.io/api/v1/crates/async-executor/1.4.1/download",
        type = "tar.gz",
        sha256 = "871f9bb5e0a22eeb7e8cf16641feb87c9dc67032ccf8ff49e772eb9941d3a965",
        strip_prefix = "async-executor-1.4.1",
        build_file = Label("//third_party/cargo/remote:BUILD.async-executor-1.4.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_global_executor__2_0_2",
        url = "https://crates.io/api/v1/crates/async-global-executor/2.0.2/download",
        type = "tar.gz",
        sha256 = "9586ec52317f36de58453159d48351bc244bc24ced3effc1fce22f3d48664af6",
        strip_prefix = "async-global-executor-2.0.2",
        build_file = Label("//third_party/cargo/remote:BUILD.async-global-executor-2.0.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_h1__2_3_2",
        url = "https://crates.io/api/v1/crates/async-h1/2.3.2/download",
        type = "tar.gz",
        sha256 = "cc5142de15b549749cce62923a50714b0d7b77f5090ced141599e78899865451",
        strip_prefix = "async-h1-2.3.2",
        build_file = Label("//third_party/cargo/remote:BUILD.async-h1-2.3.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_io__1_6_0",
        url = "https://crates.io/api/v1/crates/async-io/1.6.0/download",
        type = "tar.gz",
        sha256 = "a811e6a479f2439f0c04038796b5cfb3d2ad56c230e0f2d3f7b04d68cfee607b",
        strip_prefix = "async-io-1.6.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-io-1.6.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_lock__2_4_0",
        url = "https://crates.io/api/v1/crates/async-lock/2.4.0/download",
        type = "tar.gz",
        sha256 = "e6a8ea61bf9947a1007c5cada31e647dbc77b103c679858150003ba697ea798b",
        strip_prefix = "async-lock-2.4.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-lock-2.4.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_mutex__1_4_0",
        url = "https://crates.io/api/v1/crates/async-mutex/1.4.0/download",
        type = "tar.gz",
        sha256 = "479db852db25d9dbf6204e6cb6253698f175c15726470f78af0d918e99d6156e",
        strip_prefix = "async-mutex-1.4.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-mutex-1.4.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_process__1_2_0",
        url = "https://crates.io/api/v1/crates/async-process/1.2.0/download",
        type = "tar.gz",
        sha256 = "b21b63ab5a0db0369deb913540af2892750e42d949faacc7a61495ac418a1692",
        strip_prefix = "async-process-1.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-process-1.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_session__2_0_1",
        url = "https://crates.io/api/v1/crates/async-session/2.0.1/download",
        type = "tar.gz",
        sha256 = "345022a2eed092cd105cc1b26fd61c341e100bd5fcbbd792df4baf31c2cc631f",
        strip_prefix = "async-session-2.0.1",
        build_file = Label("//third_party/cargo/remote:BUILD.async-session-2.0.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_sse__4_1_0",
        url = "https://crates.io/api/v1/crates/async-sse/4.1.0/download",
        type = "tar.gz",
        sha256 = "53bba003996b8fd22245cd0c59b869ba764188ed435392cf2796d03b805ade10",
        strip_prefix = "async-sse-4.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-sse-4.1.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_std__1_9_0",
        url = "https://crates.io/api/v1/crates/async-std/1.9.0/download",
        type = "tar.gz",
        sha256 = "d9f06685bad74e0570f5213741bea82158279a4103d988e57bfada11ad230341",
        strip_prefix = "async-std-1.9.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-std-1.9.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_task__4_0_3",
        url = "https://crates.io/api/v1/crates/async-task/4.0.3/download",
        type = "tar.gz",
        sha256 = "e91831deabf0d6d7ec49552e489aed63b7456a7a3c46cff62adad428110b0af0",
        strip_prefix = "async-task-4.0.3",
        build_file = Label("//third_party/cargo/remote:BUILD.async-task-4.0.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_trait__0_1_51",
        url = "https://crates.io/api/v1/crates/async-trait/0.1.51/download",
        type = "tar.gz",
        sha256 = "44318e776df68115a881de9a8fd1b9e53368d7a4a5ce4cc48517da3393233a5e",
        strip_prefix = "async-trait-0.1.51",
        build_file = Label("//third_party/cargo/remote:BUILD.async-trait-0.1.51.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_tungstenite__0_13_1",
        url = "https://crates.io/api/v1/crates/async-tungstenite/0.13.1/download",
        type = "tar.gz",
        sha256 = "07b30ef0ea5c20caaa54baea49514a206308989c68be7ecd86c7f956e4da6378",
        strip_prefix = "async-tungstenite-0.13.1",
        build_file = Label("//third_party/cargo/remote:BUILD.async-tungstenite-0.13.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__atomic_waker__1_0_0",
        url = "https://crates.io/api/v1/crates/atomic-waker/1.0.0/download",
        type = "tar.gz",
        sha256 = "065374052e7df7ee4047b1160cca5e1467a12351a40b3da123c870ba0b8eda2a",
        strip_prefix = "atomic-waker-1.0.0",
        build_file = Label("//third_party/cargo/remote:BUILD.atomic-waker-1.0.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__atty__0_2_14",
        url = "https://crates.io/api/v1/crates/atty/0.2.14/download",
        type = "tar.gz",
        sha256 = "d9b39be18770d11421cdb1b9947a45dd3f37e93092cbf377614828a319d5fee8",
        strip_prefix = "atty-0.2.14",
        build_file = Label("//third_party/cargo/remote:BUILD.atty-0.2.14.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__autocfg__1_0_1",
        url = "https://crates.io/api/v1/crates/autocfg/1.0.1/download",
        type = "tar.gz",
        sha256 = "cdb031dd78e28731d87d56cc8ffef4a8f36ca26c38fe2de700543e627f8a464a",
        strip_prefix = "autocfg-1.0.1",
        build_file = Label("//third_party/cargo/remote:BUILD.autocfg-1.0.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__backtrace__0_3_61",
        url = "https://crates.io/api/v1/crates/backtrace/0.3.61/download",
        type = "tar.gz",
        sha256 = "e7a905d892734eea339e896738c14b9afce22b5318f64b951e70bf3844419b01",
        strip_prefix = "backtrace-0.3.61",
        build_file = Label("//third_party/cargo/remote:BUILD.backtrace-0.3.61.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__base_x__0_2_8",
        url = "https://crates.io/api/v1/crates/base-x/0.2.8/download",
        type = "tar.gz",
        sha256 = "a4521f3e3d031370679b3b140beb36dfe4801b09ac77e30c61941f97df3ef28b",
        strip_prefix = "base-x-0.2.8",
        build_file = Label("//third_party/cargo/remote:BUILD.base-x-0.2.8.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__base64__0_12_3",
        url = "https://crates.io/api/v1/crates/base64/0.12.3/download",
        type = "tar.gz",
        sha256 = "3441f0f7b02788e948e47f457ca01f1d7e6d92c693bc132c22b087d3141c03ff",
        strip_prefix = "base64-0.12.3",
        build_file = Label("//third_party/cargo/remote:BUILD.base64-0.12.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__base64__0_13_0",
        url = "https://crates.io/api/v1/crates/base64/0.13.0/download",
        type = "tar.gz",
        sha256 = "904dfeac50f3cdaba28fc6f57fdcddb75f49ed61346676a78c4ffe55877802fd",
        strip_prefix = "base64-0.13.0",
        build_file = Label("//third_party/cargo/remote:BUILD.base64-0.13.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__bincode__1_3_3",
        url = "https://crates.io/api/v1/crates/bincode/1.3.3/download",
        type = "tar.gz",
        sha256 = "b1f45e9417d87227c7a56d22e471c6206462cba514c7590c09aff4cf6d1ddcad",
        strip_prefix = "bincode-1.3.3",
        build_file = Label("//third_party/cargo/remote:BUILD.bincode-1.3.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__bitfield_rle__0_2_0",
        url = "https://crates.io/api/v1/crates/bitfield-rle/0.2.0/download",
        type = "tar.gz",
        sha256 = "3f8acc105b7bd3ed61e4bb7ad3e3b3f2a8da72205b2e0408cf71a499e8f57dd0",
        strip_prefix = "bitfield-rle-0.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.bitfield-rle-0.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__bitflags__1_3_2",
        url = "https://crates.io/api/v1/crates/bitflags/1.3.2/download",
        type = "tar.gz",
        sha256 = "bef38d45163c2f1dde094a7dfd33ccf595c92905c8f8f4fdc18d06fb1037718a",
        strip_prefix = "bitflags-1.3.2",
        build_file = Label("//third_party/cargo/remote:BUILD.bitflags-1.3.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__blake2__0_9_2",
        url = "https://crates.io/api/v1/crates/blake2/0.9.2/download",
        type = "tar.gz",
        sha256 = "0a4e37d16930f5459780f5621038b6382b9bb37c19016f39fb6b5808d831f174",
        strip_prefix = "blake2-0.9.2",
        build_file = Label("//third_party/cargo/remote:BUILD.blake2-0.9.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__blake2_rfc__0_2_18",
        url = "https://crates.io/api/v1/crates/blake2-rfc/0.2.18/download",
        type = "tar.gz",
        sha256 = "5d6d530bdd2d52966a6d03b7a964add7ae1a288d25214066fd4b600f0f796400",
        strip_prefix = "blake2-rfc-0.2.18",
        build_file = Label("//third_party/cargo/remote:BUILD.blake2-rfc-0.2.18.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__blake3__0_3_8",
        url = "https://crates.io/api/v1/crates/blake3/0.3.8/download",
        type = "tar.gz",
        sha256 = "b64485778c4f16a6a5a9d335e80d449ac6c70cdd6a06d2af18a6f6f775a125b3",
        strip_prefix = "blake3-0.3.8",
        build_file = Label("//third_party/cargo/remote:BUILD.blake3-0.3.8.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__block_buffer__0_9_0",
        url = "https://crates.io/api/v1/crates/block-buffer/0.9.0/download",
        type = "tar.gz",
        sha256 = "4152116fd6e9dadb291ae18fc1ec3575ed6d84c29642d97890f4b4a3417297e4",
        strip_prefix = "block-buffer-0.9.0",
        build_file = Label("//third_party/cargo/remote:BUILD.block-buffer-0.9.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__block_cipher__0_8_0",
        url = "https://crates.io/api/v1/crates/block-cipher/0.8.0/download",
        type = "tar.gz",
        sha256 = "f337a3e6da609650eb74e02bc9fac7b735049f7623ab12f2e4c719316fcc7e80",
        strip_prefix = "block-cipher-0.8.0",
        build_file = Label("//third_party/cargo/remote:BUILD.block-cipher-0.8.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__blocking__1_0_2",
        url = "https://crates.io/api/v1/crates/blocking/1.0.2/download",
        type = "tar.gz",
        sha256 = "c5e170dbede1f740736619b776d7251cb1b9095c435c34d8ca9f57fcd2f335e9",
        strip_prefix = "blocking-1.0.2",
        build_file = Label("//third_party/cargo/remote:BUILD.blocking-1.0.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__bumpalo__3_7_0",
        url = "https://crates.io/api/v1/crates/bumpalo/3.7.0/download",
        type = "tar.gz",
        sha256 = "9c59e7af012c713f529e7a3ee57ce9b31ddd858d4b512923602f74608b009631",
        strip_prefix = "bumpalo-3.7.0",
        build_file = Label("//third_party/cargo/remote:BUILD.bumpalo-3.7.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__byte_pool__0_2_3",
        url = "https://crates.io/api/v1/crates/byte-pool/0.2.3/download",
        type = "tar.gz",
        sha256 = "f8c7230ddbb427b1094d477d821a99f3f54d36333178eeb806e279bcdcecf0ca",
        strip_prefix = "byte-pool-0.2.3",
        build_file = Label("//third_party/cargo/remote:BUILD.byte-pool-0.2.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__byteorder__1_4_3",
        url = "https://crates.io/api/v1/crates/byteorder/1.4.3/download",
        type = "tar.gz",
        sha256 = "14c189c53d098945499cdfa7ecc63567cf3886b3332b312a5b4585d8d3a6a610",
        strip_prefix = "byteorder-1.4.3",
        build_file = Label("//third_party/cargo/remote:BUILD.byteorder-1.4.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__bytes__0_5_6",
        url = "https://crates.io/api/v1/crates/bytes/0.5.6/download",
        type = "tar.gz",
        sha256 = "0e4cec68f03f32e44924783795810fa50a7035d8c8ebe78580ad7e6c703fba38",
        strip_prefix = "bytes-0.5.6",
        build_file = Label("//third_party/cargo/remote:BUILD.bytes-0.5.6.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__bytes__1_1_0",
        url = "https://crates.io/api/v1/crates/bytes/1.1.0/download",
        type = "tar.gz",
        sha256 = "c4872d67bab6358e59559027aa3b9157c53d9358c51423c17554809a8858e0f8",
        strip_prefix = "bytes-1.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.bytes-1.1.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cache_padded__1_1_1",
        url = "https://crates.io/api/v1/crates/cache-padded/1.1.1/download",
        type = "tar.gz",
        sha256 = "631ae5198c9be5e753e5cc215e1bd73c2b466a3565173db433f52bb9d3e66dba",
        strip_prefix = "cache-padded-1.1.1",
        build_file = Label("//third_party/cargo/remote:BUILD.cache-padded-1.1.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cc__1_0_69",
        url = "https://crates.io/api/v1/crates/cc/1.0.69/download",
        type = "tar.gz",
        sha256 = "e70cc2f62c6ce1868963827bd677764c62d07c3d9a3e1fb1177ee1a9ab199eb2",
        strip_prefix = "cc-1.0.69",
        build_file = Label("//third_party/cargo/remote:BUILD.cc-1.0.69.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cfg_if__0_1_10",
        url = "https://crates.io/api/v1/crates/cfg-if/0.1.10/download",
        type = "tar.gz",
        sha256 = "4785bdd1c96b2a846b2bd7cc02e86b6b3dbf14e7e53446c4f54c92a361040822",
        strip_prefix = "cfg-if-0.1.10",
        build_file = Label("//third_party/cargo/remote:BUILD.cfg-if-0.1.10.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cfg_if__1_0_0",
        url = "https://crates.io/api/v1/crates/cfg-if/1.0.0/download",
        type = "tar.gz",
        sha256 = "baf1de4339761588bc0619e3cbc0120ee582ebb74b53b4efbf79117bd2da40fd",
        strip_prefix = "cfg-if-1.0.0",
        build_file = Label("//third_party/cargo/remote:BUILD.cfg-if-1.0.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__chacha20__0_5_0",
        url = "https://crates.io/api/v1/crates/chacha20/0.5.0/download",
        type = "tar.gz",
        sha256 = "244fbce0d47e97e8ef2f63b81d5e05882cb518c68531eb33194990d7b7e85845",
        strip_prefix = "chacha20-0.5.0",
        build_file = Label("//third_party/cargo/remote:BUILD.chacha20-0.5.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__chacha20poly1305__0_6_0",
        url = "https://crates.io/api/v1/crates/chacha20poly1305/0.6.0/download",
        type = "tar.gz",
        sha256 = "9bf18d374d66df0c05cdddd528a7db98f78c28e2519b120855c4f84c5027b1f5",
        strip_prefix = "chacha20poly1305-0.6.0",
        build_file = Label("//third_party/cargo/remote:BUILD.chacha20poly1305-0.6.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__chrono__0_4_19",
        url = "https://crates.io/api/v1/crates/chrono/0.4.19/download",
        type = "tar.gz",
        sha256 = "670ad68c9088c2a963aaa298cb369688cf3f9465ce5e2d4ca10e6e0098a1ce73",
        strip_prefix = "chrono-0.4.19",
        build_file = Label("//third_party/cargo/remote:BUILD.chrono-0.4.19.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cipher__0_2_5",
        url = "https://crates.io/api/v1/crates/cipher/0.2.5/download",
        type = "tar.gz",
        sha256 = "12f8e7987cbd042a63249497f41aed09f8e65add917ea6566effbc56578d6801",
        strip_prefix = "cipher-0.2.5",
        build_file = Label("//third_party/cargo/remote:BUILD.cipher-0.2.5.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__clap__3_0_0_beta_4",
        url = "https://crates.io/api/v1/crates/clap/3.0.0-beta.4/download",
        type = "tar.gz",
        sha256 = "fcd70aa5597dbc42f7217a543f9ef2768b2ef823ba29036072d30e1d88e98406",
        strip_prefix = "clap-3.0.0-beta.4",
        build_file = Label("//third_party/cargo/remote:BUILD.clap-3.0.0-beta.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__clap_derive__3_0_0_beta_4",
        url = "https://crates.io/api/v1/crates/clap_derive/3.0.0-beta.4/download",
        type = "tar.gz",
        sha256 = "0b5bb0d655624a0b8770d1c178fb8ffcb1f91cc722cb08f451e3dc72465421ac",
        strip_prefix = "clap_derive-3.0.0-beta.4",
        build_file = Label("//third_party/cargo/remote:BUILD.clap_derive-3.0.0-beta.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__concurrent_queue__1_2_2",
        url = "https://crates.io/api/v1/crates/concurrent-queue/1.2.2/download",
        type = "tar.gz",
        sha256 = "30ed07550be01594c6026cff2a1d7fe9c8f683caa798e12b68694ac9e88286a3",
        strip_prefix = "concurrent-queue-1.2.2",
        build_file = Label("//third_party/cargo/remote:BUILD.concurrent-queue-1.2.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__const_fn__0_4_8",
        url = "https://crates.io/api/v1/crates/const_fn/0.4.8/download",
        type = "tar.gz",
        sha256 = "f92cfa0fd5690b3cf8c1ef2cabbd9b7ef22fa53cf5e1f92b05103f6d5d1cf6e7",
        strip_prefix = "const_fn-0.4.8",
        build_file = Label("//third_party/cargo/remote:BUILD.const_fn-0.4.8.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__constant_time_eq__0_1_5",
        url = "https://crates.io/api/v1/crates/constant_time_eq/0.1.5/download",
        type = "tar.gz",
        sha256 = "245097e9a4535ee1e3e3931fcfcd55a796a44c643e8596ff6566d68f09b87bbc",
        strip_prefix = "constant_time_eq-0.1.5",
        build_file = Label("//third_party/cargo/remote:BUILD.constant_time_eq-0.1.5.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cookie__0_14_4",
        url = "https://crates.io/api/v1/crates/cookie/0.14.4/download",
        type = "tar.gz",
        sha256 = "03a5d7b21829bc7b4bf4754a978a241ae54ea55a40f92bb20216e54096f4b951",
        strip_prefix = "cookie-0.14.4",
        build_file = Label("//third_party/cargo/remote:BUILD.cookie-0.14.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cpufeatures__0_1_5",
        url = "https://crates.io/api/v1/crates/cpufeatures/0.1.5/download",
        type = "tar.gz",
        sha256 = "66c99696f6c9dd7f35d486b9d04d7e6e202aa3e8c40d553f2fdf5e7e0c6a71ef",
        strip_prefix = "cpufeatures-0.1.5",
        build_file = Label("//third_party/cargo/remote:BUILD.cpufeatures-0.1.5.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cpuid_bool__0_2_0",
        url = "https://crates.io/api/v1/crates/cpuid-bool/0.2.0/download",
        type = "tar.gz",
        sha256 = "dcb25d077389e53838a8158c8e99174c5a9d902dee4904320db714f3c653ffba",
        strip_prefix = "cpuid-bool-0.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.cpuid-bool-0.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__crossbeam_queue__0_3_2",
        url = "https://crates.io/api/v1/crates/crossbeam-queue/0.3.2/download",
        type = "tar.gz",
        sha256 = "9b10ddc024425c88c2ad148c1b0fd53f4c6d38db9697c9f1588381212fa657c9",
        strip_prefix = "crossbeam-queue-0.3.2",
        build_file = Label("//third_party/cargo/remote:BUILD.crossbeam-queue-0.3.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__crossbeam_utils__0_8_5",
        url = "https://crates.io/api/v1/crates/crossbeam-utils/0.8.5/download",
        type = "tar.gz",
        sha256 = "d82cfc11ce7f2c3faef78d8a684447b40d503d9681acebed6cb728d45940c4db",
        strip_prefix = "crossbeam-utils-0.8.5",
        build_file = Label("//third_party/cargo/remote:BUILD.crossbeam-utils-0.8.5.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__crypto_mac__0_10_1",
        url = "https://crates.io/api/v1/crates/crypto-mac/0.10.1/download",
        type = "tar.gz",
        sha256 = "bff07008ec701e8028e2ceb8f83f0e4274ee62bd2dbdc4fefff2e9a91824081a",
        strip_prefix = "crypto-mac-0.10.1",
        build_file = Label("//third_party/cargo/remote:BUILD.crypto-mac-0.10.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__crypto_mac__0_8_0",
        url = "https://crates.io/api/v1/crates/crypto-mac/0.8.0/download",
        type = "tar.gz",
        sha256 = "b584a330336237c1eecd3e94266efb216c56ed91225d634cb2991c5f3fd1aeab",
        strip_prefix = "crypto-mac-0.8.0",
        build_file = Label("//third_party/cargo/remote:BUILD.crypto-mac-0.8.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ctor__0_1_20",
        url = "https://crates.io/api/v1/crates/ctor/0.1.20/download",
        type = "tar.gz",
        sha256 = "5e98e2ad1a782e33928b96fc3948e7c355e5af34ba4de7670fe8bac2a3b2006d",
        strip_prefix = "ctor-0.1.20",
        build_file = Label("//third_party/cargo/remote:BUILD.ctor-0.1.20.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ctr__0_6_0",
        url = "https://crates.io/api/v1/crates/ctr/0.6.0/download",
        type = "tar.gz",
        sha256 = "fb4a30d54f7443bf3d6191dcd486aca19e67cb3c49fa7a06a319966346707e7f",
        strip_prefix = "ctr-0.6.0",
        build_file = Label("//third_party/cargo/remote:BUILD.ctr-0.6.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ctrlc__3_2_0",
        url = "https://crates.io/api/v1/crates/ctrlc/3.2.0/download",
        type = "tar.gz",
        sha256 = "377c9b002a72a0b2c1a18c62e2f3864bdfea4a015e3683a96e24aa45dd6c02d1",
        strip_prefix = "ctrlc-3.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.ctrlc-3.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__curve25519_dalek__3_2_0",
        url = "https://crates.io/api/v1/crates/curve25519-dalek/3.2.0/download",
        type = "tar.gz",
        sha256 = "0b9fdf9972b2bd6af2d913799d9ebc165ea4d2e65878e329d9c6b372c4491b61",
        strip_prefix = "curve25519-dalek-3.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.curve25519-dalek-3.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__dashmap__4_0_2",
        url = "https://crates.io/api/v1/crates/dashmap/4.0.2/download",
        type = "tar.gz",
        sha256 = "e77a43b28d0668df09411cb0bc9a8c2adc40f9a048afe863e05fd43251e8e39c",
        strip_prefix = "dashmap-4.0.2",
        build_file = Label("//third_party/cargo/remote:BUILD.dashmap-4.0.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__digest__0_9_0",
        url = "https://crates.io/api/v1/crates/digest/0.9.0/download",
        type = "tar.gz",
        sha256 = "d3dd60d1080a57a05ab032377049e0591415d2b31afd7028356dbf3cc6dcb066",
        strip_prefix = "digest-0.9.0",
        build_file = Label("//third_party/cargo/remote:BUILD.digest-0.9.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__discard__1_0_4",
        url = "https://crates.io/api/v1/crates/discard/1.0.4/download",
        type = "tar.gz",
        sha256 = "212d0f5754cb6769937f4501cc0e67f4f4483c8d2c3e1e922ee9edbe4ab4c7c0",
        strip_prefix = "discard-1.0.4",
        build_file = Label("//third_party/cargo/remote:BUILD.discard-1.0.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__duct__0_13_4",
        url = "https://crates.io/api/v1/crates/duct/0.13.4/download",
        type = "tar.gz",
        sha256 = "f90a9c3a25aafbd538c7d40a53f83c4487ee8216c12d1c8ef2c01eb2f6ea1553",
        strip_prefix = "duct-0.13.4",
        build_file = Label("//third_party/cargo/remote:BUILD.duct-0.13.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ed25519__1_2_0",
        url = "https://crates.io/api/v1/crates/ed25519/1.2.0/download",
        type = "tar.gz",
        sha256 = "4620d40f6d2601794401d6dd95a5cf69b6c157852539470eeda433a99b3c0efc",
        strip_prefix = "ed25519-1.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.ed25519-1.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ed25519_dalek__1_0_1",
        url = "https://crates.io/api/v1/crates/ed25519-dalek/1.0.1/download",
        type = "tar.gz",
        sha256 = "c762bae6dcaf24c4c84667b8579785430908723d5c889f469d76a41d59cc7a9d",
        strip_prefix = "ed25519-dalek-1.0.1",
        build_file = Label("//third_party/cargo/remote:BUILD.ed25519-dalek-1.0.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__either__1_6_1",
        url = "https://crates.io/api/v1/crates/either/1.6.1/download",
        type = "tar.gz",
        sha256 = "e78d4f1cc4ae33bbfc157ed5d5a5ef3bc29227303d595861deb238fcec4e9457",
        strip_prefix = "either-1.6.1",
        build_file = Label("//third_party/cargo/remote:BUILD.either-1.6.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__event_listener__2_5_1",
        url = "https://crates.io/api/v1/crates/event-listener/2.5.1/download",
        type = "tar.gz",
        sha256 = "f7531096570974c3a9dcf9e4b8e1cede1ec26cf5046219fb3b9d897503b9be59",
        strip_prefix = "event-listener-2.5.1",
        build_file = Label("//third_party/cargo/remote:BUILD.event-listener-2.5.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__failure__0_1_8",
        url = "https://crates.io/api/v1/crates/failure/0.1.8/download",
        type = "tar.gz",
        sha256 = "d32e9bd16cc02eae7db7ef620b392808b89f6a5e16bb3497d159c6b92a0f4f86",
        strip_prefix = "failure-0.1.8",
        build_file = Label("//third_party/cargo/remote:BUILD.failure-0.1.8.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__failure_derive__0_1_8",
        url = "https://crates.io/api/v1/crates/failure_derive/0.1.8/download",
        type = "tar.gz",
        sha256 = "aa4da3c766cd7a0db8242e326e9e4e081edd567072893ed320008189715366a4",
        strip_prefix = "failure_derive-0.1.8",
        build_file = Label("//third_party/cargo/remote:BUILD.failure_derive-0.1.8.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fastrand__1_5_0",
        url = "https://crates.io/api/v1/crates/fastrand/1.5.0/download",
        type = "tar.gz",
        sha256 = "b394ed3d285a429378d3b384b9eb1285267e7df4b166df24b7a6939a04dc392e",
        strip_prefix = "fastrand-1.5.0",
        build_file = Label("//third_party/cargo/remote:BUILD.fastrand-1.5.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__femme__2_1_1",
        url = "https://crates.io/api/v1/crates/femme/2.1.1/download",
        type = "tar.gz",
        sha256 = "2af1a24f391a5a94d756db5092c6576aad494b88a71a5a36b20c67b63e0df034",
        strip_prefix = "femme-2.1.1",
        build_file = Label("//third_party/cargo/remote:BUILD.femme-2.1.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fern__0_6_0",
        url = "https://crates.io/api/v1/crates/fern/0.6.0/download",
        type = "tar.gz",
        sha256 = "8c9a4820f0ccc8a7afd67c39a0f1a0f4b07ca1725164271a64939d7aeb9af065",
        strip_prefix = "fern-0.6.0",
        build_file = Label("//third_party/cargo/remote:BUILD.fern-0.6.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fixedbitset__0_2_0",
        url = "https://crates.io/api/v1/crates/fixedbitset/0.2.0/download",
        type = "tar.gz",
        sha256 = "37ab347416e802de484e4d03c7316c48f1ecb56574dfd4a46a80f173ce1de04d",
        strip_prefix = "fixedbitset-0.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.fixedbitset-0.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__flat_tree__5_0_0",
        url = "https://crates.io/api/v1/crates/flat-tree/5.0.0/download",
        type = "tar.gz",
        sha256 = "f55d280d4b6d9585f3d1458eb082fb30f541ad227b2102965e4c7aa239a5e9e4",
        strip_prefix = "flat-tree-5.0.0",
        build_file = Label("//third_party/cargo/remote:BUILD.flat-tree-5.0.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fnv__1_0_7",
        url = "https://crates.io/api/v1/crates/fnv/1.0.7/download",
        type = "tar.gz",
        sha256 = "3f9eec918d3f24069decb9af1554cad7c880e2da24a9afd88aca000531ab82c1",
        strip_prefix = "fnv-1.0.7",
        build_file = Label("//third_party/cargo/remote:BUILD.fnv-1.0.7.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__form_urlencoded__1_0_1",
        url = "https://crates.io/api/v1/crates/form_urlencoded/1.0.1/download",
        type = "tar.gz",
        sha256 = "5fc25a87fa4fd2094bffb06925852034d90a17f0d1e05197d4956d3555752191",
        strip_prefix = "form_urlencoded-1.0.1",
        build_file = Label("//third_party/cargo/remote:BUILD.form_urlencoded-1.0.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures__0_3_16",
        url = "https://crates.io/api/v1/crates/futures/0.3.16/download",
        type = "tar.gz",
        sha256 = "1adc00f486adfc9ce99f77d717836f0c5aa84965eb0b4f051f4e83f7cab53f8b",
        strip_prefix = "futures-0.3.16",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-0.3.16.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_channel__0_3_16",
        url = "https://crates.io/api/v1/crates/futures-channel/0.3.16/download",
        type = "tar.gz",
        sha256 = "74ed2411805f6e4e3d9bc904c95d5d423b89b3b25dc0250aa74729de20629ff9",
        strip_prefix = "futures-channel-0.3.16",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-channel-0.3.16.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_core__0_3_16",
        url = "https://crates.io/api/v1/crates/futures-core/0.3.16/download",
        type = "tar.gz",
        sha256 = "af51b1b4a7fdff033703db39de8802c673eb91855f2e0d47dcf3bf2c0ef01f99",
        strip_prefix = "futures-core-0.3.16",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-core-0.3.16.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_executor__0_3_16",
        url = "https://crates.io/api/v1/crates/futures-executor/0.3.16/download",
        type = "tar.gz",
        sha256 = "4d0d535a57b87e1ae31437b892713aee90cd2d7b0ee48727cd11fc72ef54761c",
        strip_prefix = "futures-executor-0.3.16",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-executor-0.3.16.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_io__0_3_16",
        url = "https://crates.io/api/v1/crates/futures-io/0.3.16/download",
        type = "tar.gz",
        sha256 = "0b0e06c393068f3a6ef246c75cdca793d6a46347e75286933e5e75fd2fd11582",
        strip_prefix = "futures-io-0.3.16",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-io-0.3.16.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_lite__1_12_0",
        url = "https://crates.io/api/v1/crates/futures-lite/1.12.0/download",
        type = "tar.gz",
        sha256 = "7694489acd39452c77daa48516b894c153f192c3578d5a839b62c58099fcbf48",
        strip_prefix = "futures-lite-1.12.0",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-lite-1.12.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_macro__0_3_16",
        url = "https://crates.io/api/v1/crates/futures-macro/0.3.16/download",
        type = "tar.gz",
        sha256 = "c54913bae956fb8df7f4dc6fc90362aa72e69148e3f39041fbe8742d21e0ac57",
        strip_prefix = "futures-macro-0.3.16",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-macro-0.3.16.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_sink__0_3_16",
        url = "https://crates.io/api/v1/crates/futures-sink/0.3.16/download",
        type = "tar.gz",
        sha256 = "c0f30aaa67363d119812743aa5f33c201a7a66329f97d1a887022971feea4b53",
        strip_prefix = "futures-sink-0.3.16",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-sink-0.3.16.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_task__0_3_16",
        url = "https://crates.io/api/v1/crates/futures-task/0.3.16/download",
        type = "tar.gz",
        sha256 = "bbe54a98670017f3be909561f6ad13e810d9a51f3f061b902062ca3da80799f2",
        strip_prefix = "futures-task-0.3.16",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-task-0.3.16.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_timer__3_0_2",
        url = "https://crates.io/api/v1/crates/futures-timer/3.0.2/download",
        type = "tar.gz",
        sha256 = "e64b03909df88034c26dc1547e8970b91f98bdb65165d6a4e9110d94263dbb2c",
        strip_prefix = "futures-timer-3.0.2",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-timer-3.0.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_util__0_3_16",
        url = "https://crates.io/api/v1/crates/futures-util/0.3.16/download",
        type = "tar.gz",
        sha256 = "67eb846bfd58e44a8481a00049e82c43e0ccb5d61f8dc071057cb19249dd4d78",
        strip_prefix = "futures-util-0.3.16",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-util-0.3.16.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__generic_array__0_14_4",
        url = "https://crates.io/api/v1/crates/generic-array/0.14.4/download",
        type = "tar.gz",
        sha256 = "501466ecc8a30d1d3b7fc9229b122b2ce8ed6e9d9223f1138d4babb253e51817",
        strip_prefix = "generic-array-0.14.4",
        build_file = Label("//third_party/cargo/remote:BUILD.generic-array-0.14.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__getrandom__0_1_16",
        url = "https://crates.io/api/v1/crates/getrandom/0.1.16/download",
        type = "tar.gz",
        sha256 = "8fc3cb4d91f53b50155bdcfd23f6a4c39ae1969c2ae85982b135750cccaf5fce",
        strip_prefix = "getrandom-0.1.16",
        build_file = Label("//third_party/cargo/remote:BUILD.getrandom-0.1.16.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__getrandom__0_2_3",
        url = "https://crates.io/api/v1/crates/getrandom/0.2.3/download",
        type = "tar.gz",
        sha256 = "7fcd999463524c52659517fe2cea98493cfe485d10565e7b0fb07dbba7ad2753",
        strip_prefix = "getrandom-0.2.3",
        build_file = Label("//third_party/cargo/remote:BUILD.getrandom-0.2.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ghash__0_3_1",
        url = "https://crates.io/api/v1/crates/ghash/0.3.1/download",
        type = "tar.gz",
        sha256 = "97304e4cd182c3846f7575ced3890c53012ce534ad9114046b0a9e00bb30a375",
        strip_prefix = "ghash-0.3.1",
        build_file = Label("//third_party/cargo/remote:BUILD.ghash-0.3.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__gimli__0_25_0",
        url = "https://crates.io/api/v1/crates/gimli/0.25.0/download",
        type = "tar.gz",
        sha256 = "f0a01e0497841a3b2db4f8afa483cce65f7e96a3498bd6c541734792aeac8fe7",
        strip_prefix = "gimli-0.25.0",
        build_file = Label("//third_party/cargo/remote:BUILD.gimli-0.25.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__gloo_timers__0_2_1",
        url = "https://crates.io/api/v1/crates/gloo-timers/0.2.1/download",
        type = "tar.gz",
        sha256 = "47204a46aaff920a1ea58b11d03dec6f704287d27561724a4631e450654a891f",
        strip_prefix = "gloo-timers-0.2.1",
        build_file = Label("//third_party/cargo/remote:BUILD.gloo-timers-0.2.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__hashbrown__0_11_2",
        url = "https://crates.io/api/v1/crates/hashbrown/0.11.2/download",
        type = "tar.gz",
        sha256 = "ab5ef0d4909ef3724cc8cce6ccc8572c5c817592e9285f5464f8e86f8bd3726e",
        strip_prefix = "hashbrown-0.11.2",
        build_file = Label("//third_party/cargo/remote:BUILD.hashbrown-0.11.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__heck__0_3_3",
        url = "https://crates.io/api/v1/crates/heck/0.3.3/download",
        type = "tar.gz",
        sha256 = "6d621efb26863f0e9924c6ac577e8275e5e6b77455db64ffa6c65c904e9e132c",
        strip_prefix = "heck-0.3.3",
        build_file = Label("//third_party/cargo/remote:BUILD.heck-0.3.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__hermit_abi__0_1_19",
        url = "https://crates.io/api/v1/crates/hermit-abi/0.1.19/download",
        type = "tar.gz",
        sha256 = "62b467343b94ba476dcb2500d242dadbb39557df889310ac77c5d99100aaac33",
        strip_prefix = "hermit-abi-0.1.19",
        build_file = Label("//third_party/cargo/remote:BUILD.hermit-abi-0.1.19.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__hex__0_4_3",
        url = "https://crates.io/api/v1/crates/hex/0.4.3/download",
        type = "tar.gz",
        sha256 = "7f24254aa9a54b5c858eaee2f5bccdb46aaf0e486a595ed5fd8f86ba55232a70",
        strip_prefix = "hex-0.4.3",
        build_file = Label("//third_party/cargo/remote:BUILD.hex-0.4.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__hkdf__0_10_0",
        url = "https://crates.io/api/v1/crates/hkdf/0.10.0/download",
        type = "tar.gz",
        sha256 = "51ab2f639c231793c5f6114bdb9bbe50a7dbbfcd7c7c6bd8475dec2d991e964f",
        strip_prefix = "hkdf-0.10.0",
        build_file = Label("//third_party/cargo/remote:BUILD.hkdf-0.10.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__hmac__0_10_1",
        url = "https://crates.io/api/v1/crates/hmac/0.10.1/download",
        type = "tar.gz",
        sha256 = "c1441c6b1e930e2817404b5046f1f989899143a12bf92de603b69f4e0aee1e15",
        strip_prefix = "hmac-0.10.1",
        build_file = Label("//third_party/cargo/remote:BUILD.hmac-0.10.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__hmac__0_8_1",
        url = "https://crates.io/api/v1/crates/hmac/0.8.1/download",
        type = "tar.gz",
        sha256 = "126888268dcc288495a26bf004b38c5fdbb31682f992c84ceb046a1f0fe38840",
        strip_prefix = "hmac-0.8.1",
        build_file = Label("//third_party/cargo/remote:BUILD.hmac-0.8.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__http__0_2_4",
        url = "https://crates.io/api/v1/crates/http/0.2.4/download",
        type = "tar.gz",
        sha256 = "527e8c9ac747e28542699a951517aa9a6945af506cd1f2e1b53a576c17b6cc11",
        strip_prefix = "http-0.2.4",
        build_file = Label("//third_party/cargo/remote:BUILD.http-0.2.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__http_client__6_5_1",
        url = "https://crates.io/api/v1/crates/http-client/6.5.1/download",
        type = "tar.gz",
        sha256 = "ea880b03c18a7e981d7fb3608b8904a98425d53c440758fcebf7d934aa56547c",
        strip_prefix = "http-client-6.5.1",
        build_file = Label("//third_party/cargo/remote:BUILD.http-client-6.5.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__http_types__2_12_0",
        url = "https://crates.io/api/v1/crates/http-types/2.12.0/download",
        type = "tar.gz",
        sha256 = "6e9b187a72d63adbfba487f48095306ac823049cb504ee195541e91c7775f5ad",
        strip_prefix = "http-types-2.12.0",
        build_file = Label("//third_party/cargo/remote:BUILD.http-types-2.12.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__httparse__1_5_1",
        url = "https://crates.io/api/v1/crates/httparse/1.5.1/download",
        type = "tar.gz",
        sha256 = "acd94fdbe1d4ff688b67b04eee2e17bd50995534a61539e45adfefb45e5e5503",
        strip_prefix = "httparse-1.5.1",
        build_file = Label("//third_party/cargo/remote:BUILD.httparse-1.5.1.bazel"),
    )

    maybe(
        new_git_repository,
        name = "raze__hypercore__0_11_1_beta_10",
        remote = "https://github.com/datrs/hypercore",
        commit = "8d8cbef8a884a70e8d12d80968c1d97be2ceea0b",
        build_file = Label("//third_party/cargo/remote:BUILD.hypercore-0.11.1-beta.10.bazel"),
        init_submodules = True,
    )

    maybe(
        new_git_repository,
        name = "raze__hypercore_protocol__0_3_1",
        remote = "https://github.com/ttiurani/hypercore-protocol-rs",
        commit = "7208fda866b8235992e988b0e9ed3e4edf6787d4",
        build_file = Label("//third_party/cargo/remote:BUILD.hypercore-protocol-0.3.1.bazel"),
        init_submodules = True,
    )

    maybe(
        http_archive,
        name = "raze__idna__0_2_3",
        url = "https://crates.io/api/v1/crates/idna/0.2.3/download",
        type = "tar.gz",
        sha256 = "418a0a6fab821475f634efe3ccc45c013f742efe03d853e8d3355d5cb850ecf8",
        strip_prefix = "idna-0.2.3",
        build_file = Label("//third_party/cargo/remote:BUILD.idna-0.2.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__indexmap__1_7_0",
        url = "https://crates.io/api/v1/crates/indexmap/1.7.0/download",
        type = "tar.gz",
        sha256 = "bc633605454125dec4b66843673f01c7df2b89479b32e0ed634e43a91cff62a5",
        strip_prefix = "indexmap-1.7.0",
        build_file = Label("//third_party/cargo/remote:BUILD.indexmap-1.7.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__infer__0_2_3",
        url = "https://crates.io/api/v1/crates/infer/0.2.3/download",
        type = "tar.gz",
        sha256 = "64e9829a50b42bb782c1df523f78d332fe371b10c661e78b7a3c34b0198e9fac",
        strip_prefix = "infer-0.2.3",
        build_file = Label("//third_party/cargo/remote:BUILD.infer-0.2.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__input_buffer__0_4_0",
        url = "https://crates.io/api/v1/crates/input_buffer/0.4.0/download",
        type = "tar.gz",
        sha256 = "f97967975f448f1a7ddb12b0bc41069d09ed6a1c161a92687e057325db35d413",
        strip_prefix = "input_buffer-0.4.0",
        build_file = Label("//third_party/cargo/remote:BUILD.input_buffer-0.4.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__instant__0_1_10",
        url = "https://crates.io/api/v1/crates/instant/0.1.10/download",
        type = "tar.gz",
        sha256 = "bee0328b1209d157ef001c94dd85b4f8f64139adb0eac2659f4b08382b2f474d",
        strip_prefix = "instant-0.1.10",
        build_file = Label("//third_party/cargo/remote:BUILD.instant-0.1.10.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__itertools__0_8_2",
        url = "https://crates.io/api/v1/crates/itertools/0.8.2/download",
        type = "tar.gz",
        sha256 = "f56a2d0bc861f9165be4eb3442afd3c236d8a98afd426f65d92324ae1091a484",
        strip_prefix = "itertools-0.8.2",
        build_file = Label("//third_party/cargo/remote:BUILD.itertools-0.8.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__itertools__0_9_0",
        url = "https://crates.io/api/v1/crates/itertools/0.9.0/download",
        type = "tar.gz",
        sha256 = "284f18f85651fe11e8a991b2adb42cb078325c996ed026d994719efcfca1d54b",
        strip_prefix = "itertools-0.9.0",
        build_file = Label("//third_party/cargo/remote:BUILD.itertools-0.9.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__itoa__0_4_8",
        url = "https://crates.io/api/v1/crates/itoa/0.4.8/download",
        type = "tar.gz",
        sha256 = "b71991ff56294aa922b450139ee08b3bfc70982c6b2c7562771375cf73542dd4",
        strip_prefix = "itoa-0.4.8",
        build_file = Label("//third_party/cargo/remote:BUILD.itoa-0.4.8.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__js_sys__0_3_53",
        url = "https://crates.io/api/v1/crates/js-sys/0.3.53/download",
        type = "tar.gz",
        sha256 = "e4bf49d50e2961077d9c99f4b7997d770a1114f087c3c2e0069b36c13fc2979d",
        strip_prefix = "js-sys-0.3.53",
        build_file = Label("//third_party/cargo/remote:BUILD.js-sys-0.3.53.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__kv_log_macro__1_0_7",
        url = "https://crates.io/api/v1/crates/kv-log-macro/1.0.7/download",
        type = "tar.gz",
        sha256 = "0de8b303297635ad57c9f5059fd9cee7a47f8e8daa09df0fcd07dd39fb22977f",
        strip_prefix = "kv-log-macro-1.0.7",
        build_file = Label("//third_party/cargo/remote:BUILD.kv-log-macro-1.0.7.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__lazy_static__1_4_0",
        url = "https://crates.io/api/v1/crates/lazy_static/1.4.0/download",
        type = "tar.gz",
        sha256 = "e2abad23fbc42b3700f2f279844dc832adb2b2eb069b2df918f455c4e18cc646",
        strip_prefix = "lazy_static-1.4.0",
        build_file = Label("//third_party/cargo/remote:BUILD.lazy_static-1.4.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__libc__0_2_101",
        url = "https://crates.io/api/v1/crates/libc/0.2.101/download",
        type = "tar.gz",
        sha256 = "3cb00336871be5ed2c8ed44b60ae9959dc5b9f08539422ed43f09e34ecaeba21",
        strip_prefix = "libc-0.2.101",
        build_file = Label("//third_party/cargo/remote:BUILD.libc-0.2.101.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__log__0_4_14",
        url = "https://crates.io/api/v1/crates/log/0.4.14/download",
        type = "tar.gz",
        sha256 = "51b9bbe6c47d51fc3e1a9b945965946b4c44142ab8792c50835a980d362c2710",
        strip_prefix = "log-0.4.14",
        build_file = Label("//third_party/cargo/remote:BUILD.log-0.4.14.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__matches__0_1_9",
        url = "https://crates.io/api/v1/crates/matches/0.1.9/download",
        type = "tar.gz",
        sha256 = "a3e378b66a060d48947b590737b30a1be76706c8dd7b8ba0f2fe3989c68a853f",
        strip_prefix = "matches-0.1.9",
        build_file = Label("//third_party/cargo/remote:BUILD.matches-0.1.9.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__memchr__2_4_1",
        url = "https://crates.io/api/v1/crates/memchr/2.4.1/download",
        type = "tar.gz",
        sha256 = "308cc39be01b73d0d18f82a0e7b2a3df85245f84af96fdddc5d202d27e47b86a",
        strip_prefix = "memchr-2.4.1",
        build_file = Label("//third_party/cargo/remote:BUILD.memchr-2.4.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__memoffset__0_6_4",
        url = "https://crates.io/api/v1/crates/memoffset/0.6.4/download",
        type = "tar.gz",
        sha256 = "59accc507f1338036a0477ef61afdae33cde60840f4dfe481319ce3ad116ddf9",
        strip_prefix = "memoffset-0.6.4",
        build_file = Label("//third_party/cargo/remote:BUILD.memoffset-0.6.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__memory_pager__0_9_0",
        url = "https://crates.io/api/v1/crates/memory-pager/0.9.0/download",
        type = "tar.gz",
        sha256 = "ad05e53b413682ea2aa20b027babc7316d5c637f5f52cff4b042f825fb76f9bb",
        strip_prefix = "memory-pager-0.9.0",
        build_file = Label("//third_party/cargo/remote:BUILD.memory-pager-0.9.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__merkle_tree_stream__0_12_1",
        url = "https://crates.io/api/v1/crates/merkle-tree-stream/0.12.1/download",
        type = "tar.gz",
        sha256 = "97c0d20e0a20306809c742af7cc5c0da05ac742580ec88d804cbfa509d9bbaf7",
        strip_prefix = "merkle-tree-stream-0.12.1",
        build_file = Label("//third_party/cargo/remote:BUILD.merkle-tree-stream-0.12.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__miniz_oxide__0_4_4",
        url = "https://crates.io/api/v1/crates/miniz_oxide/0.4.4/download",
        type = "tar.gz",
        sha256 = "a92518e98c078586bc6c934028adcca4c92a53d6a958196de835170a01d84e4b",
        strip_prefix = "miniz_oxide-0.4.4",
        build_file = Label("//third_party/cargo/remote:BUILD.miniz_oxide-0.4.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__mkdirp__1_0_0",
        url = "https://crates.io/api/v1/crates/mkdirp/1.0.0/download",
        type = "tar.gz",
        sha256 = "864e1de64c29b386d2dc7822aea156a7e4d45d4393ac748878dc21c9c41037f0",
        strip_prefix = "mkdirp-1.0.0",
        build_file = Label("//third_party/cargo/remote:BUILD.mkdirp-1.0.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__multimap__0_8_3",
        url = "https://crates.io/api/v1/crates/multimap/0.8.3/download",
        type = "tar.gz",
        sha256 = "e5ce46fe64a9d73be07dcbe690a38ce1b293be448fd8ce1e6c1b8062c9f72c6a",
        strip_prefix = "multimap-0.8.3",
        build_file = Label("//third_party/cargo/remote:BUILD.multimap-0.8.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__nix__0_22_0",
        url = "https://crates.io/api/v1/crates/nix/0.22.0/download",
        type = "tar.gz",
        sha256 = "cf1e25ee6b412c2a1e3fcb6a4499a5c1bfe7f43e014bdce9a6b6666e5aa2d187",
        strip_prefix = "nix-0.22.0",
        build_file = Label("//third_party/cargo/remote:BUILD.nix-0.22.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__nodrop__0_1_14",
        url = "https://crates.io/api/v1/crates/nodrop/0.1.14/download",
        type = "tar.gz",
        sha256 = "72ef4a56884ca558e5ddb05a1d1e7e1bfd9a68d9ed024c21704cc98872dae1bb",
        strip_prefix = "nodrop-0.1.14",
        build_file = Label("//third_party/cargo/remote:BUILD.nodrop-0.1.14.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__num_integer__0_1_44",
        url = "https://crates.io/api/v1/crates/num-integer/0.1.44/download",
        type = "tar.gz",
        sha256 = "d2cc698a63b549a70bc047073d2949cce27cd1c7b0a4a862d08a8031bc2801db",
        strip_prefix = "num-integer-0.1.44",
        build_file = Label("//third_party/cargo/remote:BUILD.num-integer-0.1.44.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__num_traits__0_2_14",
        url = "https://crates.io/api/v1/crates/num-traits/0.2.14/download",
        type = "tar.gz",
        sha256 = "9a64b1ec5cda2586e284722486d802acf1f7dbdc623e2bfc57e65ca1cd099290",
        strip_prefix = "num-traits-0.2.14",
        build_file = Label("//third_party/cargo/remote:BUILD.num-traits-0.2.14.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__num_cpus__1_13_0",
        url = "https://crates.io/api/v1/crates/num_cpus/1.13.0/download",
        type = "tar.gz",
        sha256 = "05499f3756671c15885fee9034446956fff3f243d6077b91e5767df161f766b3",
        strip_prefix = "num_cpus-1.13.0",
        build_file = Label("//third_party/cargo/remote:BUILD.num_cpus-1.13.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__object__0_26_1",
        url = "https://crates.io/api/v1/crates/object/0.26.1/download",
        type = "tar.gz",
        sha256 = "ee2766204889d09937d00bfbb7fec56bb2a199e2ade963cab19185d8a6104c7c",
        strip_prefix = "object-0.26.1",
        build_file = Label("//third_party/cargo/remote:BUILD.object-0.26.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__once_cell__1_8_0",
        url = "https://crates.io/api/v1/crates/once_cell/1.8.0/download",
        type = "tar.gz",
        sha256 = "692fcb63b64b1758029e0a96ee63e049ce8c5948587f2f7208df04625e5f6b56",
        strip_prefix = "once_cell-1.8.0",
        build_file = Label("//third_party/cargo/remote:BUILD.once_cell-1.8.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__opaque_debug__0_3_0",
        url = "https://crates.io/api/v1/crates/opaque-debug/0.3.0/download",
        type = "tar.gz",
        sha256 = "624a8340c38c1b80fd549087862da4ba43e08858af025b236e509b6649fc13d5",
        strip_prefix = "opaque-debug-0.3.0",
        build_file = Label("//third_party/cargo/remote:BUILD.opaque-debug-0.3.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__os_pipe__0_9_2",
        url = "https://crates.io/api/v1/crates/os_pipe/0.9.2/download",
        type = "tar.gz",
        sha256 = "fb233f06c2307e1f5ce2ecad9f8121cffbbee2c95428f44ea85222e460d0d213",
        strip_prefix = "os_pipe-0.9.2",
        build_file = Label("//third_party/cargo/remote:BUILD.os_pipe-0.9.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__os_str_bytes__3_1_0",
        url = "https://crates.io/api/v1/crates/os_str_bytes/3.1.0/download",
        type = "tar.gz",
        sha256 = "6acbef58a60fe69ab50510a55bc8cdd4d6cf2283d27ad338f54cb52747a9cf2d",
        strip_prefix = "os_str_bytes-3.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.os_str_bytes-3.1.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__parking__2_0_0",
        url = "https://crates.io/api/v1/crates/parking/2.0.0/download",
        type = "tar.gz",
        sha256 = "427c3892f9e783d91cc128285287e70a59e206ca452770ece88a76f7a3eddd72",
        strip_prefix = "parking-2.0.0",
        build_file = Label("//third_party/cargo/remote:BUILD.parking-2.0.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__percent_encoding__2_1_0",
        url = "https://crates.io/api/v1/crates/percent-encoding/2.1.0/download",
        type = "tar.gz",
        sha256 = "d4fd5641d01c8f18a23da7b6fe29298ff4b55afcccdf78973b24cf3175fee32e",
        strip_prefix = "percent-encoding-2.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.percent-encoding-2.1.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__petgraph__0_5_1",
        url = "https://crates.io/api/v1/crates/petgraph/0.5.1/download",
        type = "tar.gz",
        sha256 = "467d164a6de56270bd7c4d070df81d07beace25012d5103ced4e9ff08d6afdb7",
        strip_prefix = "petgraph-0.5.1",
        build_file = Label("//third_party/cargo/remote:BUILD.petgraph-0.5.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pin_project__1_0_8",
        url = "https://crates.io/api/v1/crates/pin-project/1.0.8/download",
        type = "tar.gz",
        sha256 = "576bc800220cc65dac09e99e97b08b358cfab6e17078de8dc5fee223bd2d0c08",
        strip_prefix = "pin-project-1.0.8",
        build_file = Label("//third_party/cargo/remote:BUILD.pin-project-1.0.8.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pin_project_internal__1_0_8",
        url = "https://crates.io/api/v1/crates/pin-project-internal/1.0.8/download",
        type = "tar.gz",
        sha256 = "6e8fe8163d14ce7f0cdac2e040116f22eac817edabff0be91e8aff7e9accf389",
        strip_prefix = "pin-project-internal-1.0.8",
        build_file = Label("//third_party/cargo/remote:BUILD.pin-project-internal-1.0.8.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pin_project_lite__0_1_12",
        url = "https://crates.io/api/v1/crates/pin-project-lite/0.1.12/download",
        type = "tar.gz",
        sha256 = "257b64915a082f7811703966789728173279bdebb956b143dbcd23f6f970a777",
        strip_prefix = "pin-project-lite-0.1.12",
        build_file = Label("//third_party/cargo/remote:BUILD.pin-project-lite-0.1.12.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pin_project_lite__0_2_7",
        url = "https://crates.io/api/v1/crates/pin-project-lite/0.2.7/download",
        type = "tar.gz",
        sha256 = "8d31d11c69a6b52a174b42bdc0c30e5e11670f90788b2c471c31c1d17d449443",
        strip_prefix = "pin-project-lite-0.2.7",
        build_file = Label("//third_party/cargo/remote:BUILD.pin-project-lite-0.2.7.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pin_utils__0_1_0",
        url = "https://crates.io/api/v1/crates/pin-utils/0.1.0/download",
        type = "tar.gz",
        sha256 = "8b870d8c151b6f2fb93e84a13146138f05d02ed11c7e7c54f8826aaaf7c9f184",
        strip_prefix = "pin-utils-0.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.pin-utils-0.1.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__polling__2_1_0",
        url = "https://crates.io/api/v1/crates/polling/2.1.0/download",
        type = "tar.gz",
        sha256 = "92341d779fa34ea8437ef4d82d440d5e1ce3f3ff7f824aa64424cd481f9a1f25",
        strip_prefix = "polling-2.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.polling-2.1.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__poly1305__0_6_2",
        url = "https://crates.io/api/v1/crates/poly1305/0.6.2/download",
        type = "tar.gz",
        sha256 = "4b7456bc1ad2d4cf82b3a016be4c2ac48daf11bf990c1603ebd447fe6f30fca8",
        strip_prefix = "poly1305-0.6.2",
        build_file = Label("//third_party/cargo/remote:BUILD.poly1305-0.6.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__polyval__0_4_5",
        url = "https://crates.io/api/v1/crates/polyval/0.4.5/download",
        type = "tar.gz",
        sha256 = "eebcc4aa140b9abd2bc40d9c3f7ccec842679cd79045ac3a7ac698c1a064b7cd",
        strip_prefix = "polyval-0.4.5",
        build_file = Label("//third_party/cargo/remote:BUILD.polyval-0.4.5.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ppv_lite86__0_2_10",
        url = "https://crates.io/api/v1/crates/ppv-lite86/0.2.10/download",
        type = "tar.gz",
        sha256 = "ac74c624d6b2d21f425f752262f42188365d7b8ff1aff74c82e45136510a4857",
        strip_prefix = "ppv-lite86-0.2.10",
        build_file = Label("//third_party/cargo/remote:BUILD.ppv-lite86-0.2.10.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pretty_hash__0_4_1",
        url = "https://crates.io/api/v1/crates/pretty-hash/0.4.1/download",
        type = "tar.gz",
        sha256 = "d387ff148b27cb404e6a0d137ed5ffc520684384266be99210920e09643b5602",
        strip_prefix = "pretty-hash-0.4.1",
        build_file = Label("//third_party/cargo/remote:BUILD.pretty-hash-0.4.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__proc_macro_error__1_0_4",
        url = "https://crates.io/api/v1/crates/proc-macro-error/1.0.4/download",
        type = "tar.gz",
        sha256 = "da25490ff9892aab3fcf7c36f08cfb902dd3e71ca0f9f9517bea02a73a5ce38c",
        strip_prefix = "proc-macro-error-1.0.4",
        build_file = Label("//third_party/cargo/remote:BUILD.proc-macro-error-1.0.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__proc_macro_error_attr__1_0_4",
        url = "https://crates.io/api/v1/crates/proc-macro-error-attr/1.0.4/download",
        type = "tar.gz",
        sha256 = "a1be40180e52ecc98ad80b184934baf3d0d29f979574e439af5a55274b35f869",
        strip_prefix = "proc-macro-error-attr-1.0.4",
        build_file = Label("//third_party/cargo/remote:BUILD.proc-macro-error-attr-1.0.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__proc_macro_hack__0_5_19",
        url = "https://crates.io/api/v1/crates/proc-macro-hack/0.5.19/download",
        type = "tar.gz",
        sha256 = "dbf0c48bc1d91375ae5c3cd81e3722dff1abcf81a30960240640d223f59fe0e5",
        strip_prefix = "proc-macro-hack-0.5.19",
        build_file = Label("//third_party/cargo/remote:BUILD.proc-macro-hack-0.5.19.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__proc_macro_nested__0_1_7",
        url = "https://crates.io/api/v1/crates/proc-macro-nested/0.1.7/download",
        type = "tar.gz",
        sha256 = "bc881b2c22681370c6a780e47af9840ef841837bc98118431d4e1868bd0c1086",
        strip_prefix = "proc-macro-nested-0.1.7",
        build_file = Label("//third_party/cargo/remote:BUILD.proc-macro-nested-0.1.7.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__proc_macro2__1_0_28",
        url = "https://crates.io/api/v1/crates/proc-macro2/1.0.28/download",
        type = "tar.gz",
        sha256 = "5c7ed8b8c7b886ea3ed7dde405212185f423ab44682667c8c6dd14aa1d9f6612",
        strip_prefix = "proc-macro2-1.0.28",
        build_file = Label("//third_party/cargo/remote:BUILD.proc-macro2-1.0.28.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__prost__0_6_1",
        url = "https://crates.io/api/v1/crates/prost/0.6.1/download",
        type = "tar.gz",
        sha256 = "ce49aefe0a6144a45de32927c77bd2859a5f7677b55f220ae5b744e87389c212",
        strip_prefix = "prost-0.6.1",
        build_file = Label("//third_party/cargo/remote:BUILD.prost-0.6.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__prost__0_7_0",
        url = "https://crates.io/api/v1/crates/prost/0.7.0/download",
        type = "tar.gz",
        sha256 = "9e6984d2f1a23009bd270b8bb56d0926810a3d483f59c987d77969e9d8e840b2",
        strip_prefix = "prost-0.7.0",
        build_file = Label("//third_party/cargo/remote:BUILD.prost-0.7.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__prost_build__0_6_1",
        url = "https://crates.io/api/v1/crates/prost-build/0.6.1/download",
        type = "tar.gz",
        sha256 = "02b10678c913ecbd69350e8535c3aef91a8676c0773fc1d7b95cdd196d7f2f26",
        strip_prefix = "prost-build-0.6.1",
        build_file = Label("//third_party/cargo/remote:BUILD.prost-build-0.6.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__prost_derive__0_6_1",
        url = "https://crates.io/api/v1/crates/prost-derive/0.6.1/download",
        type = "tar.gz",
        sha256 = "537aa19b95acde10a12fec4301466386f757403de4cd4e5b4fa78fb5ecb18f72",
        strip_prefix = "prost-derive-0.6.1",
        build_file = Label("//third_party/cargo/remote:BUILD.prost-derive-0.6.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__prost_derive__0_7_0",
        url = "https://crates.io/api/v1/crates/prost-derive/0.7.0/download",
        type = "tar.gz",
        sha256 = "169a15f3008ecb5160cba7d37bcd690a7601b6d30cfb87a117d45e59d52af5d4",
        strip_prefix = "prost-derive-0.7.0",
        build_file = Label("//third_party/cargo/remote:BUILD.prost-derive-0.7.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__prost_types__0_6_1",
        url = "https://crates.io/api/v1/crates/prost-types/0.6.1/download",
        type = "tar.gz",
        sha256 = "1834f67c0697c001304b75be76f67add9c89742eda3a085ad8ee0bb38c3417aa",
        strip_prefix = "prost-types-0.6.1",
        build_file = Label("//third_party/cargo/remote:BUILD.prost-types-0.6.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__quote__1_0_9",
        url = "https://crates.io/api/v1/crates/quote/1.0.9/download",
        type = "tar.gz",
        sha256 = "c3d0b9745dc2debf507c8422de05d7226cc1f0644216dfdfead988f9b1ab32a7",
        strip_prefix = "quote-1.0.9",
        build_file = Label("//third_party/cargo/remote:BUILD.quote-1.0.9.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand__0_7_3",
        url = "https://crates.io/api/v1/crates/rand/0.7.3/download",
        type = "tar.gz",
        sha256 = "6a6b1679d49b24bbfe0c803429aa1874472f50d9b363131f0e89fc356b544d03",
        strip_prefix = "rand-0.7.3",
        build_file = Label("//third_party/cargo/remote:BUILD.rand-0.7.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand__0_8_4",
        url = "https://crates.io/api/v1/crates/rand/0.8.4/download",
        type = "tar.gz",
        sha256 = "2e7573632e6454cf6b99d7aac4ccca54be06da05aca2ef7423d22d27d4d4bcd8",
        strip_prefix = "rand-0.8.4",
        build_file = Label("//third_party/cargo/remote:BUILD.rand-0.8.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand_chacha__0_2_2",
        url = "https://crates.io/api/v1/crates/rand_chacha/0.2.2/download",
        type = "tar.gz",
        sha256 = "f4c8ed856279c9737206bf725bf36935d8666ead7aa69b52be55af369d193402",
        strip_prefix = "rand_chacha-0.2.2",
        build_file = Label("//third_party/cargo/remote:BUILD.rand_chacha-0.2.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand_chacha__0_3_1",
        url = "https://crates.io/api/v1/crates/rand_chacha/0.3.1/download",
        type = "tar.gz",
        sha256 = "e6c10a63a0fa32252be49d21e7709d4d4baf8d231c2dbce1eaa8141b9b127d88",
        strip_prefix = "rand_chacha-0.3.1",
        build_file = Label("//third_party/cargo/remote:BUILD.rand_chacha-0.3.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand_core__0_5_1",
        url = "https://crates.io/api/v1/crates/rand_core/0.5.1/download",
        type = "tar.gz",
        sha256 = "90bde5296fc891b0cef12a6d03ddccc162ce7b2aff54160af9338f8d40df6d19",
        strip_prefix = "rand_core-0.5.1",
        build_file = Label("//third_party/cargo/remote:BUILD.rand_core-0.5.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand_core__0_6_3",
        url = "https://crates.io/api/v1/crates/rand_core/0.6.3/download",
        type = "tar.gz",
        sha256 = "d34f1408f55294453790c48b2f1ebbb1c5b4b7563eb1f418bcfcfdbb06ebb4e7",
        strip_prefix = "rand_core-0.6.3",
        build_file = Label("//third_party/cargo/remote:BUILD.rand_core-0.6.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand_hc__0_2_0",
        url = "https://crates.io/api/v1/crates/rand_hc/0.2.0/download",
        type = "tar.gz",
        sha256 = "ca3129af7b92a17112d59ad498c6f81eaf463253766b90396d39ea7a39d6613c",
        strip_prefix = "rand_hc-0.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.rand_hc-0.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rand_hc__0_3_1",
        url = "https://crates.io/api/v1/crates/rand_hc/0.3.1/download",
        type = "tar.gz",
        sha256 = "d51e9f596de227fda2ea6c84607f5558e196eeaf43c986b724ba4fb8fdf497e7",
        strip_prefix = "rand_hc-0.3.1",
        build_file = Label("//third_party/cargo/remote:BUILD.rand_hc-0.3.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__random_access_disk__2_0_0",
        url = "https://crates.io/api/v1/crates/random-access-disk/2.0.0/download",
        type = "tar.gz",
        sha256 = "246bbdb354ccec46547e33d113411e95dfe28af66c32ab6b38ce897fc8816a42",
        strip_prefix = "random-access-disk-2.0.0",
        build_file = Label("//third_party/cargo/remote:BUILD.random-access-disk-2.0.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__random_access_memory__2_0_0",
        url = "https://crates.io/api/v1/crates/random-access-memory/2.0.0/download",
        type = "tar.gz",
        sha256 = "9194febd5cecca959b411f5f397269dcc0a7928ffbeb85c33d16d70b8a5d8107",
        strip_prefix = "random-access-memory-2.0.0",
        build_file = Label("//third_party/cargo/remote:BUILD.random-access-memory-2.0.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__random_access_storage__4_0_0",
        url = "https://crates.io/api/v1/crates/random-access-storage/4.0.0/download",
        type = "tar.gz",
        sha256 = "9d27bac8187e6f11f361c36af0ff2ee11a9aecad55b64c5e48470f28fdb3feac",
        strip_prefix = "random-access-storage-4.0.0",
        build_file = Label("//third_party/cargo/remote:BUILD.random-access-storage-4.0.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__redox_syscall__0_2_10",
        url = "https://crates.io/api/v1/crates/redox_syscall/0.2.10/download",
        type = "tar.gz",
        sha256 = "8383f39639269cde97d255a32bdb68c047337295414940c68bdd30c2e13203ff",
        strip_prefix = "redox_syscall-0.2.10",
        build_file = Label("//third_party/cargo/remote:BUILD.redox_syscall-0.2.10.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__remove_dir_all__0_5_3",
        url = "https://crates.io/api/v1/crates/remove_dir_all/0.5.3/download",
        type = "tar.gz",
        sha256 = "3acd125665422973a33ac9d3dd2df85edad0f4ae9b00dafb1a05e43a9f5ef8e7",
        strip_prefix = "remove_dir_all-0.5.3",
        build_file = Label("//third_party/cargo/remote:BUILD.remove_dir_all-0.5.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__reusable_box_future__0_2_0",
        url = "https://crates.io/api/v1/crates/reusable-box-future/0.2.0/download",
        type = "tar.gz",
        sha256 = "1e0e61cd21fbddd85fbd9367b775660a01d388c08a61c6d2824af480b0309bb9",
        strip_prefix = "reusable-box-future-0.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.reusable-box-future-0.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__route_recognizer__0_2_0",
        url = "https://crates.io/api/v1/crates/route-recognizer/0.2.0/download",
        type = "tar.gz",
        sha256 = "56770675ebc04927ded3e60633437841581c285dc6236109ea25fbf3beb7b59e",
        strip_prefix = "route-recognizer-0.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.route-recognizer-0.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rustc_demangle__0_1_21",
        url = "https://crates.io/api/v1/crates/rustc-demangle/0.1.21/download",
        type = "tar.gz",
        sha256 = "7ef03e0a2b150c7a90d01faf6254c9c48a41e95fb2a8c2ac1c6f0d2b9aefc342",
        strip_prefix = "rustc-demangle-0.1.21",
        build_file = Label("//third_party/cargo/remote:BUILD.rustc-demangle-0.1.21.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rustc_version__0_2_3",
        url = "https://crates.io/api/v1/crates/rustc_version/0.2.3/download",
        type = "tar.gz",
        sha256 = "138e3e0acb6c9fb258b19b67cb8abd63c00679d2851805ea151465464fe9030a",
        strip_prefix = "rustc_version-0.2.3",
        build_file = Label("//third_party/cargo/remote:BUILD.rustc_version-0.2.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ryu__1_0_5",
        url = "https://crates.io/api/v1/crates/ryu/1.0.5/download",
        type = "tar.gz",
        sha256 = "71d301d4193d031abdd79ff7e3dd721168a9572ef3fe51a1517aba235bd8f86e",
        strip_prefix = "ryu-1.0.5",
        build_file = Label("//third_party/cargo/remote:BUILD.ryu-1.0.5.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__salsa20__0_6_0",
        url = "https://crates.io/api/v1/crates/salsa20/0.6.0/download",
        type = "tar.gz",
        sha256 = "c7f47b10fa80f6969bbbd9c8e7cc998f082979d402a9e10579e2303a87955395",
        strip_prefix = "salsa20-0.6.0",
        build_file = Label("//third_party/cargo/remote:BUILD.salsa20-0.6.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__semver__0_9_0",
        url = "https://crates.io/api/v1/crates/semver/0.9.0/download",
        type = "tar.gz",
        sha256 = "1d7eb9ef2c18661902cc47e535f9bc51b78acd254da71d375c2f6720d9a40403",
        strip_prefix = "semver-0.9.0",
        build_file = Label("//third_party/cargo/remote:BUILD.semver-0.9.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__semver_parser__0_7_0",
        url = "https://crates.io/api/v1/crates/semver-parser/0.7.0/download",
        type = "tar.gz",
        sha256 = "388a1df253eca08550bef6c72392cfe7c30914bf41df5269b68cbd6ff8f570a3",
        strip_prefix = "semver-parser-0.7.0",
        build_file = Label("//third_party/cargo/remote:BUILD.semver-parser-0.7.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde__1_0_129",
        url = "https://crates.io/api/v1/crates/serde/1.0.129/download",
        type = "tar.gz",
        sha256 = "d1f72836d2aa753853178eda473a3b9d8e4eefdaf20523b919677e6de489f8f1",
        strip_prefix = "serde-1.0.129",
        build_file = Label("//third_party/cargo/remote:BUILD.serde-1.0.129.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_derive__1_0_129",
        url = "https://crates.io/api/v1/crates/serde_derive/1.0.129/download",
        type = "tar.gz",
        sha256 = "e57ae87ad533d9a56427558b516d0adac283614e347abf85b0dc0cbbf0a249f3",
        strip_prefix = "serde_derive-1.0.129",
        build_file = Label("//third_party/cargo/remote:BUILD.serde_derive-1.0.129.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_json__1_0_66",
        url = "https://crates.io/api/v1/crates/serde_json/1.0.66/download",
        type = "tar.gz",
        sha256 = "336b10da19a12ad094b59d870ebde26a45402e5b470add4b5fd03c5048a32127",
        strip_prefix = "serde_json-1.0.66",
        build_file = Label("//third_party/cargo/remote:BUILD.serde_json-1.0.66.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_qs__0_8_4",
        url = "https://crates.io/api/v1/crates/serde_qs/0.8.4/download",
        type = "tar.gz",
        sha256 = "d8a72808528a89fa9eca23bbb6a1eb92cb639b881357269b6510f11e50c0f8a9",
        strip_prefix = "serde_qs-0.8.4",
        build_file = Label("//third_party/cargo/remote:BUILD.serde_qs-0.8.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_urlencoded__0_7_0",
        url = "https://crates.io/api/v1/crates/serde_urlencoded/0.7.0/download",
        type = "tar.gz",
        sha256 = "edfa57a7f8d9c1d260a549e7224100f6c43d43f9103e06dd8b4095a9b2b43ce9",
        strip_prefix = "serde_urlencoded-0.7.0",
        build_file = Label("//third_party/cargo/remote:BUILD.serde_urlencoded-0.7.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sha_1__0_9_7",
        url = "https://crates.io/api/v1/crates/sha-1/0.9.7/download",
        type = "tar.gz",
        sha256 = "1a0c8611594e2ab4ebbf06ec7cbbf0a99450b8570e96cbf5188b5d5f6ef18d81",
        strip_prefix = "sha-1-0.9.7",
        build_file = Label("//third_party/cargo/remote:BUILD.sha-1-0.9.7.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sha1__0_6_0",
        url = "https://crates.io/api/v1/crates/sha1/0.6.0/download",
        type = "tar.gz",
        sha256 = "2579985fda508104f7587689507983eadd6a6e84dd35d6d115361f530916fa0d",
        strip_prefix = "sha1-0.6.0",
        build_file = Label("//third_party/cargo/remote:BUILD.sha1-0.6.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sha2__0_9_5",
        url = "https://crates.io/api/v1/crates/sha2/0.9.5/download",
        type = "tar.gz",
        sha256 = "b362ae5752fd2137731f9fa25fd4d9058af34666ca1966fb969119cc35719f12",
        strip_prefix = "sha2-0.9.5",
        build_file = Label("//third_party/cargo/remote:BUILD.sha2-0.9.5.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__shared_child__0_3_5",
        url = "https://crates.io/api/v1/crates/shared_child/0.3.5/download",
        type = "tar.gz",
        sha256 = "6be9f7d5565b1483af3e72975e2dee33879b3b86bd48c0929fccf6585d79e65a",
        strip_prefix = "shared_child-0.3.5",
        build_file = Label("//third_party/cargo/remote:BUILD.shared_child-0.3.5.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__signal_hook__0_3_9",
        url = "https://crates.io/api/v1/crates/signal-hook/0.3.9/download",
        type = "tar.gz",
        sha256 = "470c5a6397076fae0094aaf06a08e6ba6f37acb77d3b1b91ea92b4d6c8650c39",
        strip_prefix = "signal-hook-0.3.9",
        build_file = Label("//third_party/cargo/remote:BUILD.signal-hook-0.3.9.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__signal_hook_registry__1_4_0",
        url = "https://crates.io/api/v1/crates/signal-hook-registry/1.4.0/download",
        type = "tar.gz",
        sha256 = "e51e73328dc4ac0c7ccbda3a494dfa03df1de2f46018127f60c693f2648455b0",
        strip_prefix = "signal-hook-registry-1.4.0",
        build_file = Label("//third_party/cargo/remote:BUILD.signal-hook-registry-1.4.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__signature__1_3_1",
        url = "https://crates.io/api/v1/crates/signature/1.3.1/download",
        type = "tar.gz",
        sha256 = "c19772be3c4dd2ceaacf03cb41d5885f2a02c4d8804884918e3a258480803335",
        strip_prefix = "signature-1.3.1",
        build_file = Label("//third_party/cargo/remote:BUILD.signature-1.3.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__simple_mutex__1_1_5",
        url = "https://crates.io/api/v1/crates/simple-mutex/1.1.5/download",
        type = "tar.gz",
        sha256 = "38aabbeafa6f6dead8cebf246fe9fae1f9215c8d29b3a69f93bd62a9e4a3dcd6",
        strip_prefix = "simple-mutex-1.1.5",
        build_file = Label("//third_party/cargo/remote:BUILD.simple-mutex-1.1.5.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__slab__0_4_4",
        url = "https://crates.io/api/v1/crates/slab/0.4.4/download",
        type = "tar.gz",
        sha256 = "c307a32c1c5c437f38c7fd45d753050587732ba8628319fbdf12a7e289ccc590",
        strip_prefix = "slab-0.4.4",
        build_file = Label("//third_party/cargo/remote:BUILD.slab-0.4.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sleep_parser__0_8_0",
        url = "https://crates.io/api/v1/crates/sleep-parser/0.8.0/download",
        type = "tar.gz",
        sha256 = "b77744f73b2cee34255eccbac43289b960e412d926477d73375fe52a016fa774",
        strip_prefix = "sleep-parser-0.8.0",
        build_file = Label("//third_party/cargo/remote:BUILD.sleep-parser-0.8.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__snow__0_7_2",
        url = "https://crates.io/api/v1/crates/snow/0.7.2/download",
        type = "tar.gz",
        sha256 = "795dd7aeeee24468e5a32661f6d27f7b5cbed802031b2d7640c7b10f8fb2dd50",
        strip_prefix = "snow-0.7.2",
        build_file = Label("//third_party/cargo/remote:BUILD.snow-0.7.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__socket2__0_4_1",
        url = "https://crates.io/api/v1/crates/socket2/0.4.1/download",
        type = "tar.gz",
        sha256 = "765f090f0e423d2b55843402a07915add955e7d60657db13707a159727326cad",
        strip_prefix = "socket2-0.4.1",
        build_file = Label("//third_party/cargo/remote:BUILD.socket2-0.4.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sparse_bitfield__0_11_0",
        url = "https://crates.io/api/v1/crates/sparse-bitfield/0.11.0/download",
        type = "tar.gz",
        sha256 = "f98e2a9d642ccbbd1b67dff822a7d3115f18f133bf840ca3e551567eabdee074",
        strip_prefix = "sparse-bitfield-0.11.0",
        build_file = Label("//third_party/cargo/remote:BUILD.sparse-bitfield-0.11.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stable_deref_trait__1_2_0",
        url = "https://crates.io/api/v1/crates/stable_deref_trait/1.2.0/download",
        type = "tar.gz",
        sha256 = "a8f112729512f8e442d81f95a8a7ddf2b7c6b8a1a6f509a95864142b30cab2d3",
        strip_prefix = "stable_deref_trait-1.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.stable_deref_trait-1.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__standback__0_2_17",
        url = "https://crates.io/api/v1/crates/standback/0.2.17/download",
        type = "tar.gz",
        sha256 = "e113fb6f3de07a243d434a56ec6f186dfd51cb08448239fe7bcae73f87ff28ff",
        strip_prefix = "standback-0.2.17",
        build_file = Label("//third_party/cargo/remote:BUILD.standback-0.2.17.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stdweb__0_4_20",
        url = "https://crates.io/api/v1/crates/stdweb/0.4.20/download",
        type = "tar.gz",
        sha256 = "d022496b16281348b52d0e30ae99e01a73d737b2f45d38fed4edf79f9325a1d5",
        strip_prefix = "stdweb-0.4.20",
        build_file = Label("//third_party/cargo/remote:BUILD.stdweb-0.4.20.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stdweb_derive__0_5_3",
        url = "https://crates.io/api/v1/crates/stdweb-derive/0.5.3/download",
        type = "tar.gz",
        sha256 = "c87a60a40fccc84bef0652345bbbbbe20a605bf5d0ce81719fc476f5c03b50ef",
        strip_prefix = "stdweb-derive-0.5.3",
        build_file = Label("//third_party/cargo/remote:BUILD.stdweb-derive-0.5.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stdweb_internal_macros__0_2_9",
        url = "https://crates.io/api/v1/crates/stdweb-internal-macros/0.2.9/download",
        type = "tar.gz",
        sha256 = "58fa5ff6ad0d98d1ffa8cb115892b6e69d67799f6763e162a1c9db421dc22e11",
        strip_prefix = "stdweb-internal-macros-0.2.9",
        build_file = Label("//third_party/cargo/remote:BUILD.stdweb-internal-macros-0.2.9.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stdweb_internal_runtime__0_1_5",
        url = "https://crates.io/api/v1/crates/stdweb-internal-runtime/0.1.5/download",
        type = "tar.gz",
        sha256 = "213701ba3370744dcd1a12960caa4843b3d68b4d1c0a5d575e0d65b2ee9d16c0",
        strip_prefix = "stdweb-internal-runtime-0.1.5",
        build_file = Label("//third_party/cargo/remote:BUILD.stdweb-internal-runtime-0.1.5.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__stream_cipher__0_7_1",
        url = "https://crates.io/api/v1/crates/stream-cipher/0.7.1/download",
        type = "tar.gz",
        sha256 = "c80e15f898d8d8f25db24c253ea615cc14acf418ff307822995814e7d42cfa89",
        strip_prefix = "stream-cipher-0.7.1",
        build_file = Label("//third_party/cargo/remote:BUILD.stream-cipher-0.7.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__strsim__0_10_0",
        url = "https://crates.io/api/v1/crates/strsim/0.10.0/download",
        type = "tar.gz",
        sha256 = "73473c0e59e6d5812c5dfe2a064a6444949f089e20eec9a2e5506596494e4623",
        strip_prefix = "strsim-0.10.0",
        build_file = Label("//third_party/cargo/remote:BUILD.strsim-0.10.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__subtle__2_4_1",
        url = "https://crates.io/api/v1/crates/subtle/2.4.1/download",
        type = "tar.gz",
        sha256 = "6bdef32e8150c2a081110b42772ffe7d7c9032b606bc226c8260fd97e0976601",
        strip_prefix = "subtle-2.4.1",
        build_file = Label("//third_party/cargo/remote:BUILD.subtle-2.4.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sval__1_0_0_alpha_5",
        url = "https://crates.io/api/v1/crates/sval/1.0.0-alpha.5/download",
        type = "tar.gz",
        sha256 = "45f6ee7c7b87caf59549e9fe45d6a69c75c8019e79e212a835c5da0e92f0ba08",
        strip_prefix = "sval-1.0.0-alpha.5",
        build_file = Label("//third_party/cargo/remote:BUILD.sval-1.0.0-alpha.5.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__syn__1_0_75",
        url = "https://crates.io/api/v1/crates/syn/1.0.75/download",
        type = "tar.gz",
        sha256 = "b7f58f7e8eaa0009c5fec437aabf511bd9933e4b2d7407bd05273c01a8906ea7",
        strip_prefix = "syn-1.0.75",
        build_file = Label("//third_party/cargo/remote:BUILD.syn-1.0.75.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__synstructure__0_12_5",
        url = "https://crates.io/api/v1/crates/synstructure/0.12.5/download",
        type = "tar.gz",
        sha256 = "474aaa926faa1603c40b7885a9eaea29b444d1cb2850cb7c0e37bb1a4182f4fa",
        strip_prefix = "synstructure-0.12.5",
        build_file = Label("//third_party/cargo/remote:BUILD.synstructure-0.12.5.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tempfile__3_2_0",
        url = "https://crates.io/api/v1/crates/tempfile/3.2.0/download",
        type = "tar.gz",
        sha256 = "dac1c663cfc93810f88aed9b8941d48cabf856a1b111c29a40439018d870eb22",
        strip_prefix = "tempfile-3.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.tempfile-3.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__termcolor__1_1_2",
        url = "https://crates.io/api/v1/crates/termcolor/1.1.2/download",
        type = "tar.gz",
        sha256 = "2dfed899f0eb03f32ee8c6a0aabdb8a7949659e3466561fc0adf54e26d88c5f4",
        strip_prefix = "termcolor-1.1.2",
        build_file = Label("//third_party/cargo/remote:BUILD.termcolor-1.1.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__textwrap__0_14_2",
        url = "https://crates.io/api/v1/crates/textwrap/0.14.2/download",
        type = "tar.gz",
        sha256 = "0066c8d12af8b5acd21e00547c3797fde4e8677254a7ee429176ccebbe93dd80",
        strip_prefix = "textwrap-0.14.2",
        build_file = Label("//third_party/cargo/remote:BUILD.textwrap-0.14.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__thiserror__1_0_26",
        url = "https://crates.io/api/v1/crates/thiserror/1.0.26/download",
        type = "tar.gz",
        sha256 = "93119e4feac1cbe6c798c34d3a53ea0026b0b1de6a120deef895137c0529bfe2",
        strip_prefix = "thiserror-1.0.26",
        build_file = Label("//third_party/cargo/remote:BUILD.thiserror-1.0.26.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__thiserror_impl__1_0_26",
        url = "https://crates.io/api/v1/crates/thiserror-impl/1.0.26/download",
        type = "tar.gz",
        sha256 = "060d69a0afe7796bf42e9e2ff91f5ee691fb15c53d38b4b62a9a53eb23164745",
        strip_prefix = "thiserror-impl-1.0.26",
        build_file = Label("//third_party/cargo/remote:BUILD.thiserror-impl-1.0.26.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tide__0_16_0",
        url = "https://crates.io/api/v1/crates/tide/0.16.0/download",
        type = "tar.gz",
        sha256 = "c459573f0dd2cc734b539047f57489ea875af8ee950860ded20cf93a79a1dee0",
        strip_prefix = "tide-0.16.0",
        build_file = Label("//third_party/cargo/remote:BUILD.tide-0.16.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tide_websockets__0_4_0",
        url = "https://crates.io/api/v1/crates/tide-websockets/0.4.0/download",
        type = "tar.gz",
        sha256 = "3592c5cb5cb1b7a2ff3a0e5353170c1bb5b104b2f66dd06f73304169b52cc725",
        strip_prefix = "tide-websockets-0.4.0",
        build_file = Label("//third_party/cargo/remote:BUILD.tide-websockets-0.4.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__time__0_1_44",
        url = "https://crates.io/api/v1/crates/time/0.1.44/download",
        type = "tar.gz",
        sha256 = "6db9e6914ab8b1ae1c260a4ae7a49b6c5611b40328a735b21862567685e73255",
        strip_prefix = "time-0.1.44",
        build_file = Label("//third_party/cargo/remote:BUILD.time-0.1.44.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__time__0_2_27",
        url = "https://crates.io/api/v1/crates/time/0.2.27/download",
        type = "tar.gz",
        sha256 = "4752a97f8eebd6854ff91f1c1824cd6160626ac4bd44287f7f4ea2035a02a242",
        strip_prefix = "time-0.2.27",
        build_file = Label("//third_party/cargo/remote:BUILD.time-0.2.27.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__time_macros__0_1_1",
        url = "https://crates.io/api/v1/crates/time-macros/0.1.1/download",
        type = "tar.gz",
        sha256 = "957e9c6e26f12cb6d0dd7fc776bb67a706312e7299aed74c8dd5b17ebb27e2f1",
        strip_prefix = "time-macros-0.1.1",
        build_file = Label("//third_party/cargo/remote:BUILD.time-macros-0.1.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__time_macros_impl__0_1_2",
        url = "https://crates.io/api/v1/crates/time-macros-impl/0.1.2/download",
        type = "tar.gz",
        sha256 = "fd3c141a1b43194f3f56a1411225df8646c55781d5f26db825b3d98507eb482f",
        strip_prefix = "time-macros-impl-0.1.2",
        build_file = Label("//third_party/cargo/remote:BUILD.time-macros-impl-0.1.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tinyvec__1_3_1",
        url = "https://crates.io/api/v1/crates/tinyvec/1.3.1/download",
        type = "tar.gz",
        sha256 = "848a1e1181b9f6753b5e96a092749e29b11d19ede67dfbbd6c7dc7e0f49b5338",
        strip_prefix = "tinyvec-1.3.1",
        build_file = Label("//third_party/cargo/remote:BUILD.tinyvec-1.3.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tinyvec_macros__0_1_0",
        url = "https://crates.io/api/v1/crates/tinyvec_macros/0.1.0/download",
        type = "tar.gz",
        sha256 = "cda74da7e1a664f795bb1f8a87ec406fb89a02522cf6e50620d016add6dbbf5c",
        strip_prefix = "tinyvec_macros-0.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.tinyvec_macros-0.1.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tree_index__0_6_1",
        url = "https://crates.io/api/v1/crates/tree-index/0.6.1/download",
        type = "tar.gz",
        sha256 = "c8cccd9e5400719d4676d810725f4a48e6923fcedb670adba39cfb4fde7d01a3",
        strip_prefix = "tree-index-0.6.1",
        build_file = Label("//third_party/cargo/remote:BUILD.tree-index-0.6.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tungstenite__0_13_0",
        url = "https://crates.io/api/v1/crates/tungstenite/0.13.0/download",
        type = "tar.gz",
        sha256 = "5fe8dada8c1a3aeca77d6b51a4f1314e0f4b8e438b7b1b71e3ddaca8080e4093",
        strip_prefix = "tungstenite-0.13.0",
        build_file = Label("//third_party/cargo/remote:BUILD.tungstenite-0.13.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__typenum__1_13_0",
        url = "https://crates.io/api/v1/crates/typenum/1.13.0/download",
        type = "tar.gz",
        sha256 = "879f6906492a7cd215bfa4cf595b600146ccfac0c79bcbd1f3000162af5e8b06",
        strip_prefix = "typenum-1.13.0",
        build_file = Label("//third_party/cargo/remote:BUILD.typenum-1.13.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_bidi__0_3_6",
        url = "https://crates.io/api/v1/crates/unicode-bidi/0.3.6/download",
        type = "tar.gz",
        sha256 = "246f4c42e67e7a4e3c6106ff716a5d067d4132a642840b242e357e468a2a0085",
        strip_prefix = "unicode-bidi-0.3.6",
        build_file = Label("//third_party/cargo/remote:BUILD.unicode-bidi-0.3.6.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_normalization__0_1_19",
        url = "https://crates.io/api/v1/crates/unicode-normalization/0.1.19/download",
        type = "tar.gz",
        sha256 = "d54590932941a9e9266f0832deed84ebe1bf2e4c9e4a3554d393d18f5e854bf9",
        strip_prefix = "unicode-normalization-0.1.19",
        build_file = Label("//third_party/cargo/remote:BUILD.unicode-normalization-0.1.19.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_segmentation__1_8_0",
        url = "https://crates.io/api/v1/crates/unicode-segmentation/1.8.0/download",
        type = "tar.gz",
        sha256 = "8895849a949e7845e06bd6dc1aa51731a103c42707010a5b591c0038fb73385b",
        strip_prefix = "unicode-segmentation-1.8.0",
        build_file = Label("//third_party/cargo/remote:BUILD.unicode-segmentation-1.8.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_width__0_1_8",
        url = "https://crates.io/api/v1/crates/unicode-width/0.1.8/download",
        type = "tar.gz",
        sha256 = "9337591893a19b88d8d87f2cec1e73fad5cdfd10e5a6f349f498ad6ea2ffb1e3",
        strip_prefix = "unicode-width-0.1.8",
        build_file = Label("//third_party/cargo/remote:BUILD.unicode-width-0.1.8.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_xid__0_2_2",
        url = "https://crates.io/api/v1/crates/unicode-xid/0.2.2/download",
        type = "tar.gz",
        sha256 = "8ccb82d61f80a663efe1f787a51b16b5a51e3314d6ac365b08639f52387b33f3",
        strip_prefix = "unicode-xid-0.2.2",
        build_file = Label("//third_party/cargo/remote:BUILD.unicode-xid-0.2.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__universal_hash__0_4_1",
        url = "https://crates.io/api/v1/crates/universal-hash/0.4.1/download",
        type = "tar.gz",
        sha256 = "9f214e8f697e925001e66ec2c6e37a4ef93f0f78c2eed7814394e10c62025b05",
        strip_prefix = "universal-hash-0.4.1",
        build_file = Label("//third_party/cargo/remote:BUILD.universal-hash-0.4.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__url__2_2_2",
        url = "https://crates.io/api/v1/crates/url/2.2.2/download",
        type = "tar.gz",
        sha256 = "a507c383b2d33b5fc35d1861e77e6b383d158b2da5e14fe51b83dfedf6fd578c",
        strip_prefix = "url-2.2.2",
        build_file = Label("//third_party/cargo/remote:BUILD.url-2.2.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__utf_8__0_7_6",
        url = "https://crates.io/api/v1/crates/utf-8/0.7.6/download",
        type = "tar.gz",
        sha256 = "09cc8ee72d2a9becf2f2febe0205bbed8fc6615b7cb429ad062dc7b7ddd036a9",
        strip_prefix = "utf-8-0.7.6",
        build_file = Label("//third_party/cargo/remote:BUILD.utf-8-0.7.6.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__value_bag__1_0_0_alpha_7",
        url = "https://crates.io/api/v1/crates/value-bag/1.0.0-alpha.7/download",
        type = "tar.gz",
        sha256 = "dd320e1520f94261153e96f7534476ad869c14022aee1e59af7c778075d840ae",
        strip_prefix = "value-bag-1.0.0-alpha.7",
        build_file = Label("//third_party/cargo/remote:BUILD.value-bag-1.0.0-alpha.7.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__varinteger__1_0_6",
        url = "https://crates.io/api/v1/crates/varinteger/1.0.6/download",
        type = "tar.gz",
        sha256 = "7ea29db9f94ff08bb619656b8120878f280526f71dc88b5262c958a510181812",
        strip_prefix = "varinteger-1.0.6",
        build_file = Label("//third_party/cargo/remote:BUILD.varinteger-1.0.6.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__vec_map__0_8_2",
        url = "https://crates.io/api/v1/crates/vec_map/0.8.2/download",
        type = "tar.gz",
        sha256 = "f1bddf1187be692e79c5ffeab891132dfb0f236ed36a43c7ed39f1165ee20191",
        strip_prefix = "vec_map-0.8.2",
        build_file = Label("//third_party/cargo/remote:BUILD.vec_map-0.8.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__version_check__0_9_3",
        url = "https://crates.io/api/v1/crates/version_check/0.9.3/download",
        type = "tar.gz",
        sha256 = "5fecdca9a5291cc2b8dcf7dc02453fee791a280f3743cb0905f8822ae463b3fe",
        strip_prefix = "version_check-0.9.3",
        build_file = Label("//third_party/cargo/remote:BUILD.version_check-0.9.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__waker_fn__1_1_0",
        url = "https://crates.io/api/v1/crates/waker-fn/1.1.0/download",
        type = "tar.gz",
        sha256 = "9d5b2c62b4012a3e1eca5a7e077d13b3bf498c4073e33ccd58626607748ceeca",
        strip_prefix = "waker-fn-1.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.waker-fn-1.1.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasi__0_10_0_wasi_snapshot_preview1",
        url = "https://crates.io/api/v1/crates/wasi/0.10.0+wasi-snapshot-preview1/download",
        type = "tar.gz",
        sha256 = "1a143597ca7c7793eff794def352d41792a93c481eb1042423ff7ff72ba2c31f",
        strip_prefix = "wasi-0.10.0+wasi-snapshot-preview1",
        build_file = Label("//third_party/cargo/remote:BUILD.wasi-0.10.0+wasi-snapshot-preview1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasi__0_9_0_wasi_snapshot_preview1",
        url = "https://crates.io/api/v1/crates/wasi/0.9.0+wasi-snapshot-preview1/download",
        type = "tar.gz",
        sha256 = "cccddf32554fecc6acb585f82a32a72e28b48f8c4c1883ddfeeeaa96f7d8e519",
        strip_prefix = "wasi-0.9.0+wasi-snapshot-preview1",
        build_file = Label("//third_party/cargo/remote:BUILD.wasi-0.9.0+wasi-snapshot-preview1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen__0_2_76",
        url = "https://crates.io/api/v1/crates/wasm-bindgen/0.2.76/download",
        type = "tar.gz",
        sha256 = "8ce9b1b516211d33767048e5d47fa2a381ed8b76fc48d2ce4aa39877f9f183e0",
        strip_prefix = "wasm-bindgen-0.2.76",
        build_file = Label("//third_party/cargo/remote:BUILD.wasm-bindgen-0.2.76.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_backend__0_2_76",
        url = "https://crates.io/api/v1/crates/wasm-bindgen-backend/0.2.76/download",
        type = "tar.gz",
        sha256 = "cfe8dc78e2326ba5f845f4b5bf548401604fa20b1dd1d365fb73b6c1d6364041",
        strip_prefix = "wasm-bindgen-backend-0.2.76",
        build_file = Label("//third_party/cargo/remote:BUILD.wasm-bindgen-backend-0.2.76.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_futures__0_4_26",
        url = "https://crates.io/api/v1/crates/wasm-bindgen-futures/0.4.26/download",
        type = "tar.gz",
        sha256 = "95fded345a6559c2cfee778d562300c581f7d4ff3edb9b0d230d69800d213972",
        strip_prefix = "wasm-bindgen-futures-0.4.26",
        build_file = Label("//third_party/cargo/remote:BUILD.wasm-bindgen-futures-0.4.26.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_macro__0_2_76",
        url = "https://crates.io/api/v1/crates/wasm-bindgen-macro/0.2.76/download",
        type = "tar.gz",
        sha256 = "44468aa53335841d9d6b6c023eaab07c0cd4bddbcfdee3e2bb1e8d2cb8069fef",
        strip_prefix = "wasm-bindgen-macro-0.2.76",
        build_file = Label("//third_party/cargo/remote:BUILD.wasm-bindgen-macro-0.2.76.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_macro_support__0_2_76",
        url = "https://crates.io/api/v1/crates/wasm-bindgen-macro-support/0.2.76/download",
        type = "tar.gz",
        sha256 = "0195807922713af1e67dc66132c7328206ed9766af3858164fb583eedc25fbad",
        strip_prefix = "wasm-bindgen-macro-support-0.2.76",
        build_file = Label("//third_party/cargo/remote:BUILD.wasm-bindgen-macro-support-0.2.76.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_shared__0_2_76",
        url = "https://crates.io/api/v1/crates/wasm-bindgen-shared/0.2.76/download",
        type = "tar.gz",
        sha256 = "acdb075a845574a1fa5f09fd77e43f7747599301ea3417a9fbffdeedfc1f4a29",
        strip_prefix = "wasm-bindgen-shared-0.2.76",
        build_file = Label("//third_party/cargo/remote:BUILD.wasm-bindgen-shared-0.2.76.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__web_sys__0_3_53",
        url = "https://crates.io/api/v1/crates/web-sys/0.3.53/download",
        type = "tar.gz",
        sha256 = "224b2f6b67919060055ef1a67807367c2066ed520c3862cc013d26cf893a783c",
        strip_prefix = "web-sys-0.3.53",
        build_file = Label("//third_party/cargo/remote:BUILD.web-sys-0.3.53.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wepoll_ffi__0_1_2",
        url = "https://crates.io/api/v1/crates/wepoll-ffi/0.1.2/download",
        type = "tar.gz",
        sha256 = "d743fdedc5c64377b5fc2bc036b01c7fd642205a0d96356034ae3404d49eb7fb",
        strip_prefix = "wepoll-ffi-0.1.2",
        build_file = Label("//third_party/cargo/remote:BUILD.wepoll-ffi-0.1.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__which__3_1_1",
        url = "https://crates.io/api/v1/crates/which/3.1.1/download",
        type = "tar.gz",
        sha256 = "d011071ae14a2f6671d0b74080ae0cd8ebf3a6f8c9589a2cd45f23126fe29724",
        strip_prefix = "which-3.1.1",
        build_file = Label("//third_party/cargo/remote:BUILD.which-3.1.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__winapi__0_3_9",
        url = "https://crates.io/api/v1/crates/winapi/0.3.9/download",
        type = "tar.gz",
        sha256 = "5c839a674fcd7a98952e593242ea400abe93992746761e38641405d28b00f419",
        strip_prefix = "winapi-0.3.9",
        build_file = Label("//third_party/cargo/remote:BUILD.winapi-0.3.9.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__winapi_i686_pc_windows_gnu__0_4_0",
        url = "https://crates.io/api/v1/crates/winapi-i686-pc-windows-gnu/0.4.0/download",
        type = "tar.gz",
        sha256 = "ac3b87c63620426dd9b991e5ce0329eff545bccbbb34f3be09ff6fb6ab51b7b6",
        strip_prefix = "winapi-i686-pc-windows-gnu-0.4.0",
        build_file = Label("//third_party/cargo/remote:BUILD.winapi-i686-pc-windows-gnu-0.4.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__winapi_util__0_1_5",
        url = "https://crates.io/api/v1/crates/winapi-util/0.1.5/download",
        type = "tar.gz",
        sha256 = "70ec6ce85bb158151cae5e5c87f95a8e97d2c0c4b001223f33a334e3ce5de178",
        strip_prefix = "winapi-util-0.1.5",
        build_file = Label("//third_party/cargo/remote:BUILD.winapi-util-0.1.5.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__winapi_x86_64_pc_windows_gnu__0_4_0",
        url = "https://crates.io/api/v1/crates/winapi-x86_64-pc-windows-gnu/0.4.0/download",
        type = "tar.gz",
        sha256 = "712e227841d057c1ee1cd2fb22fa7e5a5461ae8e48fa2ca79ec42cfc1931183f",
        strip_prefix = "winapi-x86_64-pc-windows-gnu-0.4.0",
        build_file = Label("//third_party/cargo/remote:BUILD.winapi-x86_64-pc-windows-gnu-0.4.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__x25519_dalek__1_1_1",
        url = "https://crates.io/api/v1/crates/x25519-dalek/1.1.1/download",
        type = "tar.gz",
        sha256 = "5a0c105152107e3b96f6a00a65e86ce82d9b125230e1c4302940eca58ff71f4f",
        strip_prefix = "x25519-dalek-1.1.1",
        build_file = Label("//third_party/cargo/remote:BUILD.x25519-dalek-1.1.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__zeroize__1_4_1",
        url = "https://crates.io/api/v1/crates/zeroize/1.4.1/download",
        type = "tar.gz",
        sha256 = "377db0846015f7ae377174787dd452e1c5f5a9050bc6f954911d01f116daa0cd",
        strip_prefix = "zeroize-1.4.1",
        build_file = Label("//third_party/cargo/remote:BUILD.zeroize-1.4.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__zeroize_derive__1_1_0",
        url = "https://crates.io/api/v1/crates/zeroize_derive/1.1.0/download",
        type = "tar.gz",
        sha256 = "a2c1e130bebaeab2f23886bf9acbaca14b092408c452543c857f66399cd6dab1",
        strip_prefix = "zeroize_derive-1.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.zeroize_derive-1.1.0.bazel"),
    )
