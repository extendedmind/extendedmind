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
        name = "raze__addr2line__0_17_0",
        url = "https://crates.io/api/v1/crates/addr2line/0.17.0/download",
        type = "tar.gz",
        sha256 = "b9ecd88a8c8378ca913a680cd98f0f13ac67383d35993f86c90a70e3f137816b",
        strip_prefix = "addr2line-0.17.0",
        build_file = Label("//third_party/cargo/remote:BUILD.addr2line-0.17.0.bazel"),
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
        name = "raze__aead__0_4_3",
        url = "https://crates.io/api/v1/crates/aead/0.4.3/download",
        type = "tar.gz",
        sha256 = "0b613b8e1e3cf911a086f53f03bf286f52fd7a7258e4fa606f0ef220d39d8877",
        strip_prefix = "aead-0.4.3",
        build_file = Label("//third_party/cargo/remote:BUILD.aead-0.4.3.bazel"),
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
        name = "raze__aes__0_7_5",
        url = "https://crates.io/api/v1/crates/aes/0.7.5/download",
        type = "tar.gz",
        sha256 = "9e8b47f52ea9bae42228d07ec09eb676433d7c4ed1ebdf0f1d1c29ed446f1ab8",
        strip_prefix = "aes-0.7.5",
        build_file = Label("//third_party/cargo/remote:BUILD.aes-0.7.5.bazel"),
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
        name = "raze__aes_gcm__0_9_4",
        url = "https://crates.io/api/v1/crates/aes-gcm/0.9.4/download",
        type = "tar.gz",
        sha256 = "df5f85a83a7d8b0442b6aa7b504b8212c1733da07b98aae43d4bc21b2cb3cdf6",
        strip_prefix = "aes-gcm-0.9.4",
        build_file = Label("//third_party/cargo/remote:BUILD.aes-gcm-0.9.4.bazel"),
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
        name = "raze__anyhow__1_0_52",
        url = "https://crates.io/api/v1/crates/anyhow/1.0.52/download",
        type = "tar.gz",
        sha256 = "84450d0b4a8bd1ba4144ce8ce718fbc5d071358b1e5384bace6536b3d1f2d5b3",
        strip_prefix = "anyhow-1.0.52",
        build_file = Label("//third_party/cargo/remote:BUILD.anyhow-1.0.52.bazel"),
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
        name = "raze__async_attributes__1_1_2",
        url = "https://crates.io/api/v1/crates/async-attributes/1.1.2/download",
        type = "tar.gz",
        sha256 = "a3203e79f4dd9bdda415ed03cf14dae5a2bf775c683a00f94e9cd1faf0f596e5",
        strip_prefix = "async-attributes-1.1.2",
        build_file = Label("//third_party/cargo/remote:BUILD.async-attributes-1.1.2.bazel"),
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
        name = "raze__async_h1__2_3_3",
        url = "https://crates.io/api/v1/crates/async-h1/2.3.3/download",
        type = "tar.gz",
        sha256 = "8101020758a4fc3a7c326cb42aa99e9fa77cbfb76987c128ad956406fe1f70a7",
        strip_prefix = "async-h1-2.3.3",
        build_file = Label("//third_party/cargo/remote:BUILD.async-h1-2.3.3.bazel"),
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
        name = "raze__async_process__1_3_0",
        url = "https://crates.io/api/v1/crates/async-process/1.3.0/download",
        type = "tar.gz",
        sha256 = "83137067e3a2a6a06d67168e49e68a0957d215410473a740cea95a2425c0b7c6",
        strip_prefix = "async-process-1.3.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-process-1.3.0.bazel"),
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
        name = "raze__async_std__1_10_0",
        url = "https://crates.io/api/v1/crates/async-std/1.10.0/download",
        type = "tar.gz",
        sha256 = "f8056f1455169ab86dd47b47391e4ab0cbd25410a70e9fe675544f49bafaf952",
        strip_prefix = "async-std-1.10.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-std-1.10.0.bazel"),
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
        name = "raze__async_trait__0_1_52",
        url = "https://crates.io/api/v1/crates/async-trait/0.1.52/download",
        type = "tar.gz",
        sha256 = "061a7acccaa286c011ddc30970520b98fa40e00c9d644633fb26b5fc63a265e3",
        strip_prefix = "async-trait-0.1.52",
        build_file = Label("//third_party/cargo/remote:BUILD.async-trait-0.1.52.bazel"),
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
        name = "raze__async_io_stream__0_3_3",
        url = "https://crates.io/api/v1/crates/async_io_stream/0.3.3/download",
        type = "tar.gz",
        sha256 = "b6d7b9decdf35d8908a7e3ef02f64c5e9b1695e230154c0e8de3969142d9b94c",
        strip_prefix = "async_io_stream-0.3.3",
        build_file = Label("//third_party/cargo/remote:BUILD.async_io_stream-0.3.3.bazel"),
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
        new_git_repository,
        name = "raze__automerge__0_0_2",
        remote = "https://github.com/automerge/automerge-rs.git",
        commit = "e72571962b51c2f0726fb534890ef3b4f7c74dfc",
        build_file = Label("//third_party/cargo/remote:BUILD.automerge-0.0.2.bazel"),
        init_submodules = True,
    )

    maybe(
        new_git_repository,
        name = "raze__automerge_backend__0_0_1",
        remote = "https://github.com/automerge/automerge-rs.git",
        commit = "e72571962b51c2f0726fb534890ef3b4f7c74dfc",
        build_file = Label("//third_party/cargo/remote:BUILD.automerge-backend-0.0.1.bazel"),
        init_submodules = True,
    )

    maybe(
        new_git_repository,
        name = "raze__automerge_frontend__0_1_0",
        remote = "https://github.com/automerge/automerge-rs.git",
        commit = "e72571962b51c2f0726fb534890ef3b4f7c74dfc",
        build_file = Label("//third_party/cargo/remote:BUILD.automerge-frontend-0.1.0.bazel"),
        init_submodules = True,
    )

    maybe(
        new_git_repository,
        name = "raze__automerge_protocol__0_1_0",
        remote = "https://github.com/automerge/automerge-rs.git",
        commit = "e72571962b51c2f0726fb534890ef3b4f7c74dfc",
        build_file = Label("//third_party/cargo/remote:BUILD.automerge-protocol-0.1.0.bazel"),
        init_submodules = True,
    )

    maybe(
        http_archive,
        name = "raze__backtrace__0_3_63",
        url = "https://crates.io/api/v1/crates/backtrace/0.3.63/download",
        type = "tar.gz",
        sha256 = "321629d8ba6513061f26707241fa9bc89524ff1cd7a915a97ef0c62c666ce1b6",
        strip_prefix = "backtrace-0.3.63",
        build_file = Label("//third_party/cargo/remote:BUILD.backtrace-0.3.63.bazel"),
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
        name = "raze__blocking__1_1_0",
        url = "https://crates.io/api/v1/crates/blocking/1.1.0/download",
        type = "tar.gz",
        sha256 = "046e47d4b2d391b1f6f8b407b1deb8dee56c1852ccd868becf2710f601b5f427",
        strip_prefix = "blocking-1.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.blocking-1.1.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__bumpalo__3_8_0",
        url = "https://crates.io/api/v1/crates/bumpalo/3.8.0/download",
        type = "tar.gz",
        sha256 = "8f1e260c3a9040a7c19a12468758f4c16f31a81a1fe087482be9570ec864bb6c",
        strip_prefix = "bumpalo-3.8.0",
        build_file = Label("//third_party/cargo/remote:BUILD.bumpalo-3.8.0.bazel"),
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
        name = "raze__cache_padded__1_2_0",
        url = "https://crates.io/api/v1/crates/cache-padded/1.2.0/download",
        type = "tar.gz",
        sha256 = "c1db59621ec70f09c5e9b597b220c7a2b43611f4710dc03ceb8748637775692c",
        strip_prefix = "cache-padded-1.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.cache-padded-1.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cc__1_0_72",
        url = "https://crates.io/api/v1/crates/cc/1.0.72/download",
        type = "tar.gz",
        sha256 = "22a9137b95ea06864e018375b72adfb7db6e6f68cfc8df5a04d00288050485ee",
        strip_prefix = "cc-1.0.72",
        build_file = Label("//third_party/cargo/remote:BUILD.cc-1.0.72.bazel"),
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
        name = "raze__chacha20__0_7_3",
        url = "https://crates.io/api/v1/crates/chacha20/0.7.3/download",
        type = "tar.gz",
        sha256 = "f08493fa7707effc63254c66c6ea908675912493cd67952eda23c09fae2610b1",
        strip_prefix = "chacha20-0.7.3",
        build_file = Label("//third_party/cargo/remote:BUILD.chacha20-0.7.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__chacha20poly1305__0_8_2",
        url = "https://crates.io/api/v1/crates/chacha20poly1305/0.8.2/download",
        type = "tar.gz",
        sha256 = "b6547abe025f4027edacd9edaa357aded014eecec42a5070d9b885c3c334aba2",
        strip_prefix = "chacha20poly1305-0.8.2",
        build_file = Label("//third_party/cargo/remote:BUILD.chacha20poly1305-0.8.2.bazel"),
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
        name = "raze__cipher__0_3_0",
        url = "https://crates.io/api/v1/crates/cipher/0.3.0/download",
        type = "tar.gz",
        sha256 = "7ee52072ec15386f770805afd189a01c8841be8696bed250fa2f13c4c0d6dfb7",
        strip_prefix = "cipher-0.3.0",
        build_file = Label("//third_party/cargo/remote:BUILD.cipher-0.3.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__clap__3_0_0",
        url = "https://crates.io/api/v1/crates/clap/3.0.0/download",
        type = "tar.gz",
        sha256 = "d17bf219fcd37199b9a29e00ba65dfb8cd5b2688b7297ec14ff829c40ac50ca9",
        strip_prefix = "clap-3.0.0",
        build_file = Label("//third_party/cargo/remote:BUILD.clap-3.0.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__clap_derive__3_0_0",
        url = "https://crates.io/api/v1/crates/clap_derive/3.0.0/download",
        type = "tar.gz",
        sha256 = "e1b9752c030a14235a0bd5ef3ad60a1dcac8468c30921327fc8af36b20c790b9",
        strip_prefix = "clap_derive-3.0.0",
        build_file = Label("//third_party/cargo/remote:BUILD.clap_derive-3.0.0.bazel"),
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
        name = "raze__console_error_panic_hook__0_1_7",
        url = "https://crates.io/api/v1/crates/console_error_panic_hook/0.1.7/download",
        type = "tar.gz",
        sha256 = "a06aeb73f470f66dcdbf7223caeebb85984942f22f1adb2a088cf9668146bbbc",
        strip_prefix = "console_error_panic_hook-0.1.7",
        build_file = Label("//third_party/cargo/remote:BUILD.console_error_panic_hook-0.1.7.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__console_log__0_2_0",
        url = "https://crates.io/api/v1/crates/console_log/0.2.0/download",
        type = "tar.gz",
        sha256 = "501a375961cef1a0d44767200e66e4a559283097e91d0730b1d75dfb2f8a1494",
        strip_prefix = "console_log-0.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.console_log-0.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__const_fn__0_4_9",
        url = "https://crates.io/api/v1/crates/const_fn/0.4.9/download",
        type = "tar.gz",
        sha256 = "fbdcdcb6d86f71c5e97409ad45898af11cbc995b4ee8112d59095a28d376c935",
        strip_prefix = "const_fn-0.4.9",
        build_file = Label("//third_party/cargo/remote:BUILD.const_fn-0.4.9.bazel"),
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
        name = "raze__cpufeatures__0_2_1",
        url = "https://crates.io/api/v1/crates/cpufeatures/0.2.1/download",
        type = "tar.gz",
        sha256 = "95059428f66df56b63431fdb4e1947ed2190586af5c5a8a8b71122bdf5a7f469",
        strip_prefix = "cpufeatures-0.2.1",
        build_file = Label("//third_party/cargo/remote:BUILD.cpufeatures-0.2.1.bazel"),
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
        name = "raze__crc32fast__1_3_0",
        url = "https://crates.io/api/v1/crates/crc32fast/1.3.0/download",
        type = "tar.gz",
        sha256 = "738c290dfaea84fc1ca15ad9c168d083b05a714e1efddd8edaab678dc28d2836",
        strip_prefix = "crc32fast-1.3.0",
        build_file = Label("//third_party/cargo/remote:BUILD.crc32fast-1.3.0.bazel"),
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
        name = "raze__ctor__0_1_21",
        url = "https://crates.io/api/v1/crates/ctor/0.1.21/download",
        type = "tar.gz",
        sha256 = "ccc0a48a9b826acdf4028595adc9db92caea352f7af011a3034acd172a52a0aa",
        strip_prefix = "ctor-0.1.21",
        build_file = Label("//third_party/cargo/remote:BUILD.ctor-0.1.21.bazel"),
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
        name = "raze__ctr__0_8_0",
        url = "https://crates.io/api/v1/crates/ctr/0.8.0/download",
        type = "tar.gz",
        sha256 = "049bb91fb4aaf0e3c7efa6cd5ef877dbbbd15b39dad06d9948de4ec8a75761ea",
        strip_prefix = "ctr-0.8.0",
        build_file = Label("//third_party/cargo/remote:BUILD.ctr-0.8.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ctrlc__3_2_1",
        url = "https://crates.io/api/v1/crates/ctrlc/3.2.1/download",
        type = "tar.gz",
        sha256 = "a19c6cedffdc8c03a3346d723eb20bd85a13362bb96dc2ac000842c6381ec7bf",
        strip_prefix = "ctrlc-3.2.1",
        build_file = Label("//third_party/cargo/remote:BUILD.ctrlc-3.2.1.bazel"),
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
        name = "raze__derivative__2_2_0",
        url = "https://crates.io/api/v1/crates/derivative/2.2.0/download",
        type = "tar.gz",
        sha256 = "fcc3dd5e9e9c0b295d6e1e4d811fb6f157d5ffd784b8d202fc62eac8035a770b",
        strip_prefix = "derivative-2.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.derivative-2.2.0.bazel"),
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
        name = "raze__ed25519__1_3_0",
        url = "https://crates.io/api/v1/crates/ed25519/1.3.0/download",
        type = "tar.gz",
        sha256 = "74e1069e39f1454367eb2de793ed062fac4c35c2934b76a81d90dd9abcd28816",
        strip_prefix = "ed25519-1.3.0",
        build_file = Label("//third_party/cargo/remote:BUILD.ed25519-1.3.0.bazel"),
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
        name = "raze__fastrand__1_6_0",
        url = "https://crates.io/api/v1/crates/fastrand/1.6.0/download",
        type = "tar.gz",
        sha256 = "779d043b6a0b90cc4c0ed7ee380a6504394cee7efd7db050e3774eee387324b2",
        strip_prefix = "fastrand-1.6.0",
        build_file = Label("//third_party/cargo/remote:BUILD.fastrand-1.6.0.bazel"),
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
        name = "raze__flate2__1_0_22",
        url = "https://crates.io/api/v1/crates/flate2/1.0.22/download",
        type = "tar.gz",
        sha256 = "1e6988e897c1c9c485f43b47a529cef42fde0547f9d8d41a7062518f1d8fc53f",
        strip_prefix = "flate2-1.0.22",
        build_file = Label("//third_party/cargo/remote:BUILD.flate2-1.0.22.bazel"),
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
        name = "raze__futures__0_3_19",
        url = "https://crates.io/api/v1/crates/futures/0.3.19/download",
        type = "tar.gz",
        sha256 = "28560757fe2bb34e79f907794bb6b22ae8b0e5c669b638a1132f2592b19035b4",
        strip_prefix = "futures-0.3.19",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-0.3.19.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_channel__0_3_19",
        url = "https://crates.io/api/v1/crates/futures-channel/0.3.19/download",
        type = "tar.gz",
        sha256 = "ba3dda0b6588335f360afc675d0564c17a77a2bda81ca178a4b6081bd86c7f0b",
        strip_prefix = "futures-channel-0.3.19",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-channel-0.3.19.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_core__0_3_19",
        url = "https://crates.io/api/v1/crates/futures-core/0.3.19/download",
        type = "tar.gz",
        sha256 = "d0c8ff0461b82559810cdccfde3215c3f373807f5e5232b71479bff7bb2583d7",
        strip_prefix = "futures-core-0.3.19",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-core-0.3.19.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_executor__0_3_19",
        url = "https://crates.io/api/v1/crates/futures-executor/0.3.19/download",
        type = "tar.gz",
        sha256 = "29d6d2ff5bb10fb95c85b8ce46538a2e5f5e7fdc755623a7d4529ab8a4ed9d2a",
        strip_prefix = "futures-executor-0.3.19",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-executor-0.3.19.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_io__0_3_19",
        url = "https://crates.io/api/v1/crates/futures-io/0.3.19/download",
        type = "tar.gz",
        sha256 = "b1f9d34af5a1aac6fb380f735fe510746c38067c5bf16c7fd250280503c971b2",
        strip_prefix = "futures-io-0.3.19",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-io-0.3.19.bazel"),
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
        name = "raze__futures_macro__0_3_19",
        url = "https://crates.io/api/v1/crates/futures-macro/0.3.19/download",
        type = "tar.gz",
        sha256 = "6dbd947adfffb0efc70599b3ddcf7b5597bb5fa9e245eb99f62b3a5f7bb8bd3c",
        strip_prefix = "futures-macro-0.3.19",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-macro-0.3.19.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_sink__0_3_19",
        url = "https://crates.io/api/v1/crates/futures-sink/0.3.19/download",
        type = "tar.gz",
        sha256 = "e3055baccb68d74ff6480350f8d6eb8fcfa3aa11bdc1a1ae3afdd0514617d508",
        strip_prefix = "futures-sink-0.3.19",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-sink-0.3.19.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_task__0_3_19",
        url = "https://crates.io/api/v1/crates/futures-task/0.3.19/download",
        type = "tar.gz",
        sha256 = "6ee7c6485c30167ce4dfb83ac568a849fe53274c831081476ee13e0dce1aad72",
        strip_prefix = "futures-task-0.3.19",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-task-0.3.19.bazel"),
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
        name = "raze__futures_util__0_3_19",
        url = "https://crates.io/api/v1/crates/futures-util/0.3.19/download",
        type = "tar.gz",
        sha256 = "d9b5cf40b47a271f77a8b1bec03ca09044d99d2372c0de244e66430761127164",
        strip_prefix = "futures-util-0.3.19",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-util-0.3.19.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fxhash__0_2_1",
        url = "https://crates.io/api/v1/crates/fxhash/0.2.1/download",
        type = "tar.gz",
        sha256 = "c31b6d751ae2c7f11320402d34e41349dd1016f8d5d45e48c4312bc8625af50c",
        strip_prefix = "fxhash-0.2.1",
        build_file = Label("//third_party/cargo/remote:BUILD.fxhash-0.2.1.bazel"),
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
        name = "raze__ghash__0_4_4",
        url = "https://crates.io/api/v1/crates/ghash/0.4.4/download",
        type = "tar.gz",
        sha256 = "1583cc1656d7839fd3732b80cf4f38850336cdb9b8ded1cd399ca62958de3c99",
        strip_prefix = "ghash-0.4.4",
        build_file = Label("//third_party/cargo/remote:BUILD.ghash-0.4.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__gimli__0_26_1",
        url = "https://crates.io/api/v1/crates/gimli/0.26.1/download",
        type = "tar.gz",
        sha256 = "78cc372d058dcf6d5ecd98510e7fbc9e5aec4d21de70f65fea8fecebcd881bd4",
        strip_prefix = "gimli-0.26.1",
        build_file = Label("//third_party/cargo/remote:BUILD.gimli-0.26.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__gloo_timers__0_2_2",
        url = "https://crates.io/api/v1/crates/gloo-timers/0.2.2/download",
        type = "tar.gz",
        sha256 = "6f16c88aa13d2656ef20d1c042086b8767bbe2bdb62526894275a1b062161b2e",
        strip_prefix = "gloo-timers-0.2.2",
        build_file = Label("//third_party/cargo/remote:BUILD.gloo-timers-0.2.2.bazel"),
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
        name = "raze__http__0_2_6",
        url = "https://crates.io/api/v1/crates/http/0.2.6/download",
        type = "tar.gz",
        sha256 = "31f4c6746584866f0feabcc69893c5b51beef3831656a968ed7ae254cdc4fd03",
        strip_prefix = "http-0.2.6",
        build_file = Label("//third_party/cargo/remote:BUILD.http-0.2.6.bazel"),
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
        remote = "https://github.com/ttiurani/hypercore",
        commit = "f9cd0fcf190ff892529678e9249197f0b14969d1",
        build_file = Label("//third_party/cargo/remote:BUILD.hypercore-0.11.1-beta.10.bazel"),
        init_submodules = True,
    )

    maybe(
        new_git_repository,
        name = "raze__hypercore_protocol__0_3_1",
        remote = "https://github.com/ttiurani/hypercore-protocol-rs",
        commit = "4ef9856762b21e1bcaf1e5ba70d115a3bbbff5e4",
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
        name = "raze__instant__0_1_12",
        url = "https://crates.io/api/v1/crates/instant/0.1.12/download",
        type = "tar.gz",
        sha256 = "7a5bbe824c507c5da5956355e86a746d82e0e1464f65d862cc5e71da70e94b2c",
        strip_prefix = "instant-0.1.12",
        build_file = Label("//third_party/cargo/remote:BUILD.instant-0.1.12.bazel"),
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
        name = "raze__itoa__1_0_1",
        url = "https://crates.io/api/v1/crates/itoa/1.0.1/download",
        type = "tar.gz",
        sha256 = "1aab8fc367588b89dcee83ab0fd66b72b50b72fa1904d7095045ace2b0c81c35",
        strip_prefix = "itoa-1.0.1",
        build_file = Label("//third_party/cargo/remote:BUILD.itoa-1.0.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__js_sys__0_3_55",
        url = "https://crates.io/api/v1/crates/js-sys/0.3.55/download",
        type = "tar.gz",
        sha256 = "7cc9ffccd38c451a86bf13657df244e9c3f37493cce8e5e21e940963777acc84",
        strip_prefix = "js-sys-0.3.55",
        build_file = Label("//third_party/cargo/remote:BUILD.js-sys-0.3.55.bazel"),
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
        name = "raze__leb128__0_2_5",
        url = "https://crates.io/api/v1/crates/leb128/0.2.5/download",
        type = "tar.gz",
        sha256 = "884e2677b40cc8c339eaefcb701c32ef1fd2493d71118dc0ca4b6a736c93bd67",
        strip_prefix = "leb128-0.2.5",
        build_file = Label("//third_party/cargo/remote:BUILD.leb128-0.2.5.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__libc__0_2_112",
        url = "https://crates.io/api/v1/crates/libc/0.2.112/download",
        type = "tar.gz",
        sha256 = "1b03d17f364a3a042d5e5d46b053bbbf82c92c9430c592dd4c064dc6ee997125",
        strip_prefix = "libc-0.2.112",
        build_file = Label("//third_party/cargo/remote:BUILD.libc-0.2.112.bazel"),
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
        name = "raze__maplit__1_0_2",
        url = "https://crates.io/api/v1/crates/maplit/1.0.2/download",
        type = "tar.gz",
        sha256 = "3e2e65a1a2e43cfcb47a895c4c8b10d1f4a61097f9f254f183aee60cad9c651d",
        strip_prefix = "maplit-1.0.2",
        build_file = Label("//third_party/cargo/remote:BUILD.maplit-1.0.2.bazel"),
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
        name = "raze__memoffset__0_6_5",
        url = "https://crates.io/api/v1/crates/memoffset/0.6.5/download",
        type = "tar.gz",
        sha256 = "5aa361d4faea93603064a027415f07bd8e1d5c88c9fbf68bf56a285428fd79ce",
        strip_prefix = "memoffset-0.6.5",
        build_file = Label("//third_party/cargo/remote:BUILD.memoffset-0.6.5.bazel"),
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
        name = "raze__nix__0_23_1",
        url = "https://crates.io/api/v1/crates/nix/0.23.1/download",
        type = "tar.gz",
        sha256 = "9f866317acbd3a240710c63f065ffb1e4fd466259045ccb504130b7f668f35c6",
        strip_prefix = "nix-0.23.1",
        build_file = Label("//third_party/cargo/remote:BUILD.nix-0.23.1.bazel"),
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
        name = "raze__nonzero_ext__0_2_0",
        url = "https://crates.io/api/v1/crates/nonzero_ext/0.2.0/download",
        type = "tar.gz",
        sha256 = "44a1290799eababa63ea60af0cbc3f03363e328e58f32fb0294798ed3e85f444",
        strip_prefix = "nonzero_ext-0.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.nonzero_ext-0.2.0.bazel"),
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
        name = "raze__num_cpus__1_13_1",
        url = "https://crates.io/api/v1/crates/num_cpus/1.13.1/download",
        type = "tar.gz",
        sha256 = "19e64526ebdee182341572e50e9ad03965aa510cd94427a4549448f285e957a1",
        strip_prefix = "num_cpus-1.13.1",
        build_file = Label("//third_party/cargo/remote:BUILD.num_cpus-1.13.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__object__0_27_1",
        url = "https://crates.io/api/v1/crates/object/0.27.1/download",
        type = "tar.gz",
        sha256 = "67ac1d3f9a1d3616fd9a60c8d74296f22406a238b6a72f5cc1e6f314df4ffbf9",
        strip_prefix = "object-0.27.1",
        build_file = Label("//third_party/cargo/remote:BUILD.object-0.27.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__once_cell__1_9_0",
        url = "https://crates.io/api/v1/crates/once_cell/1.9.0/download",
        type = "tar.gz",
        sha256 = "da32515d9f6e6e489d7bc9d84c71b060db7247dc035bbe44eac88cf87486d8d5",
        strip_prefix = "once_cell-1.9.0",
        build_file = Label("//third_party/cargo/remote:BUILD.once_cell-1.9.0.bazel"),
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
        name = "raze__os_str_bytes__6_0_0",
        url = "https://crates.io/api/v1/crates/os_str_bytes/6.0.0/download",
        type = "tar.gz",
        sha256 = "8e22443d1643a904602595ba1cd8f7d896afe56d26712531c5ff73a15b2fbf64",
        strip_prefix = "os_str_bytes-6.0.0",
        build_file = Label("//third_party/cargo/remote:BUILD.os_str_bytes-6.0.0.bazel"),
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
        name = "raze__pest__2_1_3",
        url = "https://crates.io/api/v1/crates/pest/2.1.3/download",
        type = "tar.gz",
        sha256 = "10f4872ae94d7b90ae48754df22fd42ad52ce740b8f370b03da4835417403e53",
        strip_prefix = "pest-2.1.3",
        build_file = Label("//third_party/cargo/remote:BUILD.pest-2.1.3.bazel"),
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
        name = "raze__pharos__0_5_3",
        url = "https://crates.io/api/v1/crates/pharos/0.5.3/download",
        type = "tar.gz",
        sha256 = "e9567389417feee6ce15dd6527a8a1ecac205ef62c2932bcf3d9f6fc5b78b414",
        strip_prefix = "pharos-0.5.3",
        build_file = Label("//third_party/cargo/remote:BUILD.pharos-0.5.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pin_project__1_0_10",
        url = "https://crates.io/api/v1/crates/pin-project/1.0.10/download",
        type = "tar.gz",
        sha256 = "58ad3879ad3baf4e44784bc6a718a8698867bb991f8ce24d1bcbe2cfb4c3a75e",
        strip_prefix = "pin-project-1.0.10",
        build_file = Label("//third_party/cargo/remote:BUILD.pin-project-1.0.10.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pin_project_internal__1_0_10",
        url = "https://crates.io/api/v1/crates/pin-project-internal/1.0.10/download",
        type = "tar.gz",
        sha256 = "744b6f092ba29c3650faf274db506afd39944f48420f6c86b17cfe0ee1cb36bb",
        strip_prefix = "pin-project-internal-1.0.10",
        build_file = Label("//third_party/cargo/remote:BUILD.pin-project-internal-1.0.10.bazel"),
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
        name = "raze__pin_project_lite__0_2_8",
        url = "https://crates.io/api/v1/crates/pin-project-lite/0.2.8/download",
        type = "tar.gz",
        sha256 = "e280fbe77cc62c91527259e9442153f4688736748d24660126286329742b4c6c",
        strip_prefix = "pin-project-lite-0.2.8",
        build_file = Label("//third_party/cargo/remote:BUILD.pin-project-lite-0.2.8.bazel"),
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
        name = "raze__polling__2_2_0",
        url = "https://crates.io/api/v1/crates/polling/2.2.0/download",
        type = "tar.gz",
        sha256 = "685404d509889fade3e86fe3a5803bca2ec09b0c0778d5ada6ec8bf7a8de5259",
        strip_prefix = "polling-2.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.polling-2.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__poly1305__0_7_2",
        url = "https://crates.io/api/v1/crates/poly1305/0.7.2/download",
        type = "tar.gz",
        sha256 = "048aeb476be11a4b6ca432ca569e375810de9294ae78f4774e78ea98a9246ede",
        strip_prefix = "poly1305-0.7.2",
        build_file = Label("//third_party/cargo/remote:BUILD.poly1305-0.7.2.bazel"),
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
        name = "raze__polyval__0_5_3",
        url = "https://crates.io/api/v1/crates/polyval/0.5.3/download",
        type = "tar.gz",
        sha256 = "8419d2b623c7c0896ff2d5d96e2cb4ede590fed28fcc34934f4c33c036e620a1",
        strip_prefix = "polyval-0.5.3",
        build_file = Label("//third_party/cargo/remote:BUILD.polyval-0.5.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ppv_lite86__0_2_16",
        url = "https://crates.io/api/v1/crates/ppv-lite86/0.2.16/download",
        type = "tar.gz",
        sha256 = "eb9f9e6e233e5c4a35559a617bf40a4ec447db2e84c20b55a6f83167b7e57872",
        strip_prefix = "ppv-lite86-0.2.16",
        build_file = Label("//third_party/cargo/remote:BUILD.ppv-lite86-0.2.16.bazel"),
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
        name = "raze__proc_macro2__1_0_36",
        url = "https://crates.io/api/v1/crates/proc-macro2/1.0.36/download",
        type = "tar.gz",
        sha256 = "c7342d5883fbccae1cc37a2353b09c87c9b0f3afd73f5fb9bba687a1f733b029",
        strip_prefix = "proc-macro2-1.0.36",
        build_file = Label("//third_party/cargo/remote:BUILD.proc-macro2-1.0.36.bazel"),
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
        name = "raze__quote__1_0_14",
        url = "https://crates.io/api/v1/crates/quote/1.0.14/download",
        type = "tar.gz",
        sha256 = "47aa80447ce4daf1717500037052af176af5d38cc3e571d9ec1c7353fc10c87d",
        strip_prefix = "quote-1.0.14",
        build_file = Label("//third_party/cargo/remote:BUILD.quote-1.0.14.bazel"),
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
        name = "raze__rand_pcg__0_2_1",
        url = "https://crates.io/api/v1/crates/rand_pcg/0.2.1/download",
        type = "tar.gz",
        sha256 = "16abd0c1b639e9eb4d7c50c0b8100b0d0f849be2349829c740fe8e6eb4816429",
        strip_prefix = "rand_pcg-0.2.1",
        build_file = Label("//third_party/cargo/remote:BUILD.rand_pcg-0.2.1.bazel"),
    )

    maybe(
        new_git_repository,
        name = "raze__random_access_disk__2_0_0",
        remote = "https://github.com/ttiurani/random-access-disk",
        commit = "6b17771d174722bff442dba9aaf633aae4f3e40f",
        build_file = Label("//third_party/cargo/remote:BUILD.random-access-disk-2.0.0.bazel"),
        init_submodules = True,
    )

    maybe(
        new_git_repository,
        name = "raze__random_access_memory__2_0_0",
        remote = "https://github.com/ttiurani/random-access-memory",
        commit = "e48f2a9040656724327ae30d12ab636c3bf0a074",
        build_file = Label("//third_party/cargo/remote:BUILD.random-access-memory-2.0.0.bazel"),
        init_submodules = True,
    )

    maybe(
        new_git_repository,
        name = "raze__random_access_storage__4_0_0",
        remote = "https://github.com/ttiurani/random-access-storage",
        commit = "16412bab28f8f8d0c4b6b71a25f6646e0910180b",
        build_file = Label("//third_party/cargo/remote:BUILD.random-access-storage-4.0.0.bazel"),
        init_submodules = True,
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
        name = "raze__rustc_version__0_3_3",
        url = "https://crates.io/api/v1/crates/rustc_version/0.3.3/download",
        type = "tar.gz",
        sha256 = "f0dfe2087c51c460008730de8b57e6a320782fbfb312e1f4d520e6c6fae155ee",
        strip_prefix = "rustc_version-0.3.3",
        build_file = Label("//third_party/cargo/remote:BUILD.rustc_version-0.3.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rustc_version__0_4_0",
        url = "https://crates.io/api/v1/crates/rustc_version/0.4.0/download",
        type = "tar.gz",
        sha256 = "bfa0f585226d2e68097d4f95d113b15b83a82e819ab25717ec0590d9584ef366",
        strip_prefix = "rustc_version-0.4.0",
        build_file = Label("//third_party/cargo/remote:BUILD.rustc_version-0.4.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ryu__1_0_9",
        url = "https://crates.io/api/v1/crates/ryu/1.0.9/download",
        type = "tar.gz",
        sha256 = "73b4b750c782965c211b42f022f59af1fbceabdd026623714f104152f1ec149f",
        strip_prefix = "ryu-1.0.9",
        build_file = Label("//third_party/cargo/remote:BUILD.ryu-1.0.9.bazel"),
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
        name = "raze__semver__0_11_0",
        url = "https://crates.io/api/v1/crates/semver/0.11.0/download",
        type = "tar.gz",
        sha256 = "f301af10236f6df4160f7c3f04eec6dbc70ace82d23326abad5edee88801c6b6",
        strip_prefix = "semver-0.11.0",
        build_file = Label("//third_party/cargo/remote:BUILD.semver-0.11.0.bazel"),
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
        name = "raze__semver__1_0_4",
        url = "https://crates.io/api/v1/crates/semver/1.0.4/download",
        type = "tar.gz",
        sha256 = "568a8e6258aa33c13358f81fd834adb854c6f7c9468520910a9b1e8fac068012",
        strip_prefix = "semver-1.0.4",
        build_file = Label("//third_party/cargo/remote:BUILD.semver-1.0.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__semver_parser__0_10_2",
        url = "https://crates.io/api/v1/crates/semver-parser/0.10.2/download",
        type = "tar.gz",
        sha256 = "00b0bef5b7f9e0df16536d3961cfb6e84331c065b4066afb39768d0e319411f7",
        strip_prefix = "semver-parser-0.10.2",
        build_file = Label("//third_party/cargo/remote:BUILD.semver-parser-0.10.2.bazel"),
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
        name = "raze__send_wrapper__0_5_0",
        url = "https://crates.io/api/v1/crates/send_wrapper/0.5.0/download",
        type = "tar.gz",
        sha256 = "930c0acf610d3fdb5e2ab6213019aaa04e227ebe9547b0649ba599b16d788bd7",
        strip_prefix = "send_wrapper-0.5.0",
        build_file = Label("//third_party/cargo/remote:BUILD.send_wrapper-0.5.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde__1_0_133",
        url = "https://crates.io/api/v1/crates/serde/1.0.133/download",
        type = "tar.gz",
        sha256 = "97565067517b60e2d1ea8b268e59ce036de907ac523ad83a0475da04e818989a",
        strip_prefix = "serde-1.0.133",
        build_file = Label("//third_party/cargo/remote:BUILD.serde-1.0.133.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_derive__1_0_133",
        url = "https://crates.io/api/v1/crates/serde_derive/1.0.133/download",
        type = "tar.gz",
        sha256 = "ed201699328568d8d08208fdd080e3ff594e6c422e438b6705905da01005d537",
        strip_prefix = "serde_derive-1.0.133",
        build_file = Label("//third_party/cargo/remote:BUILD.serde_derive-1.0.133.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_json__1_0_74",
        url = "https://crates.io/api/v1/crates/serde_json/1.0.74/download",
        type = "tar.gz",
        sha256 = "ee2bb9cd061c5865d345bb02ca49fcef1391741b672b54a0bf7b679badec3142",
        strip_prefix = "serde_json-1.0.74",
        build_file = Label("//third_party/cargo/remote:BUILD.serde_json-1.0.74.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_qs__0_8_5",
        url = "https://crates.io/api/v1/crates/serde_qs/0.8.5/download",
        type = "tar.gz",
        sha256 = "c7715380eec75f029a4ef7de39a9200e0a63823176b759d055b613f5a87df6a6",
        strip_prefix = "serde_qs-0.8.5",
        build_file = Label("//third_party/cargo/remote:BUILD.serde_qs-0.8.5.bazel"),
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
        name = "raze__sha_1__0_9_8",
        url = "https://crates.io/api/v1/crates/sha-1/0.9.8/download",
        type = "tar.gz",
        sha256 = "99cd6713db3cf16b6c84e06321e049a9b9f699826e16096d23bbcc44d15d51a6",
        strip_prefix = "sha-1-0.9.8",
        build_file = Label("//third_party/cargo/remote:BUILD.sha-1-0.9.8.bazel"),
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
        name = "raze__sha2__0_9_8",
        url = "https://crates.io/api/v1/crates/sha2/0.9.8/download",
        type = "tar.gz",
        sha256 = "b69f9a4c9740d74c5baa3fd2e547f9525fa8088a8a958e0ca2409a514e33f5fa",
        strip_prefix = "sha2-0.9.8",
        build_file = Label("//third_party/cargo/remote:BUILD.sha2-0.9.8.bazel"),
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
        name = "raze__signal_hook__0_3_13",
        url = "https://crates.io/api/v1/crates/signal-hook/0.3.13/download",
        type = "tar.gz",
        sha256 = "647c97df271007dcea485bb74ffdb57f2e683f1306c854f468a0c244badabf2d",
        strip_prefix = "signal-hook-0.3.13",
        build_file = Label("//third_party/cargo/remote:BUILD.signal-hook-0.3.13.bazel"),
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
        name = "raze__signature__1_4_0",
        url = "https://crates.io/api/v1/crates/signature/1.4.0/download",
        type = "tar.gz",
        sha256 = "02658e48d89f2bec991f9a78e69cfa4c316f8d6a6c4ec12fae1aeb263d486788",
        strip_prefix = "signature-1.4.0",
        build_file = Label("//third_party/cargo/remote:BUILD.signature-1.4.0.bazel"),
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
        name = "raze__slab__0_4_5",
        url = "https://crates.io/api/v1/crates/slab/0.4.5/download",
        type = "tar.gz",
        sha256 = "9def91fd1e018fe007022791f865d0ccc9b3a0d5001e01aabb8b40e46000afb5",
        strip_prefix = "slab-0.4.5",
        build_file = Label("//third_party/cargo/remote:BUILD.slab-0.4.5.bazel"),
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
        name = "raze__smol_str__0_1_21",
        url = "https://crates.io/api/v1/crates/smol_str/0.1.21/download",
        type = "tar.gz",
        sha256 = "61d15c83e300cce35b7c8cd39ff567c1ef42dde6d4a1a38dbdbf9a59902261bd",
        strip_prefix = "smol_str-0.1.21",
        build_file = Label("//third_party/cargo/remote:BUILD.smol_str-0.1.21.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__snow__0_8_0",
        url = "https://crates.io/api/v1/crates/snow/0.8.0/download",
        type = "tar.gz",
        sha256 = "6142f7c25e94f6fd25a32c3348ec230df9109b463f59c8c7acc4bd34936babb7",
        strip_prefix = "snow-0.8.0",
        build_file = Label("//third_party/cargo/remote:BUILD.snow-0.8.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__socket2__0_4_2",
        url = "https://crates.io/api/v1/crates/socket2/0.4.2/download",
        type = "tar.gz",
        sha256 = "5dc90fe6c7be1a323296982db1836d1ea9e47b6839496dde9a541bc496df3516",
        strip_prefix = "socket2-0.4.2",
        build_file = Label("//third_party/cargo/remote:BUILD.socket2-0.4.2.bazel"),
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
        name = "raze__strum__0_21_0",
        url = "https://crates.io/api/v1/crates/strum/0.21.0/download",
        type = "tar.gz",
        sha256 = "aaf86bbcfd1fa9670b7a129f64fc0c9fcbbfe4f1bc4210e9e98fe71ffc12cde2",
        strip_prefix = "strum-0.21.0",
        build_file = Label("//third_party/cargo/remote:BUILD.strum-0.21.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__strum_macros__0_21_1",
        url = "https://crates.io/api/v1/crates/strum_macros/0.21.1/download",
        type = "tar.gz",
        sha256 = "d06aaeeee809dbc59eb4556183dd927df67db1540de5be8d3ec0b6636358a5ec",
        strip_prefix = "strum_macros-0.21.1",
        build_file = Label("//third_party/cargo/remote:BUILD.strum_macros-0.21.1.bazel"),
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
        name = "raze__syn__1_0_84",
        url = "https://crates.io/api/v1/crates/syn/1.0.84/download",
        type = "tar.gz",
        sha256 = "ecb2e6da8ee5eb9a61068762a32fa9619cc591ceb055b3687f4cd4051ec2e06b",
        strip_prefix = "syn-1.0.84",
        build_file = Label("//third_party/cargo/remote:BUILD.syn-1.0.84.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__synstructure__0_12_6",
        url = "https://crates.io/api/v1/crates/synstructure/0.12.6/download",
        type = "tar.gz",
        sha256 = "f36bdaa60a83aca3921b5259d5400cbf5e90fc51931376a9bd4a0eb79aa7210f",
        strip_prefix = "synstructure-0.12.6",
        build_file = Label("//third_party/cargo/remote:BUILD.synstructure-0.12.6.bazel"),
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
        name = "raze__thiserror__1_0_30",
        url = "https://crates.io/api/v1/crates/thiserror/1.0.30/download",
        type = "tar.gz",
        sha256 = "854babe52e4df1653706b98fcfc05843010039b406875930a70e4d9644e5c417",
        strip_prefix = "thiserror-1.0.30",
        build_file = Label("//third_party/cargo/remote:BUILD.thiserror-1.0.30.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__thiserror_impl__1_0_30",
        url = "https://crates.io/api/v1/crates/thiserror-impl/1.0.30/download",
        type = "tar.gz",
        sha256 = "aa32fd3f627f367fe16f893e2597ae3c05020f8bba2666a4e6ea73d377e5714b",
        strip_prefix = "thiserror-impl-1.0.30",
        build_file = Label("//third_party/cargo/remote:BUILD.thiserror-impl-1.0.30.bazel"),
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
        name = "raze__tinyvec__1_5_1",
        url = "https://crates.io/api/v1/crates/tinyvec/1.5.1/download",
        type = "tar.gz",
        sha256 = "2c1c1d5a42b6245520c249549ec267180beaffcc0615401ac8e31853d4b6d8d2",
        strip_prefix = "tinyvec-1.5.1",
        build_file = Label("//third_party/cargo/remote:BUILD.tinyvec-1.5.1.bazel"),
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
        name = "raze__tracing__0_1_29",
        url = "https://crates.io/api/v1/crates/tracing/0.1.29/download",
        type = "tar.gz",
        sha256 = "375a639232caf30edfc78e8d89b2d4c375515393e7af7e16f01cd96917fb2105",
        strip_prefix = "tracing-0.1.29",
        build_file = Label("//third_party/cargo/remote:BUILD.tracing-0.1.29.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tracing_attributes__0_1_18",
        url = "https://crates.io/api/v1/crates/tracing-attributes/0.1.18/download",
        type = "tar.gz",
        sha256 = "f4f480b8f81512e825f337ad51e94c1eb5d3bbdf2b363dcd01e2b19a9ffe3f8e",
        strip_prefix = "tracing-attributes-0.1.18",
        build_file = Label("//third_party/cargo/remote:BUILD.tracing-attributes-0.1.18.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tracing_core__0_1_21",
        url = "https://crates.io/api/v1/crates/tracing-core/0.1.21/download",
        type = "tar.gz",
        sha256 = "1f4ed65637b8390770814083d20756f87bfa2c21bf2f110babdc5438351746e4",
        strip_prefix = "tracing-core-0.1.21",
        build_file = Label("//third_party/cargo/remote:BUILD.tracing-core-0.1.21.bazel"),
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
        name = "raze__typenum__1_15_0",
        url = "https://crates.io/api/v1/crates/typenum/1.15.0/download",
        type = "tar.gz",
        sha256 = "dcf81ac59edc17cc8697ff311e8f5ef2d99fcbd9817b34cec66f90b6c3dfd987",
        strip_prefix = "typenum-1.15.0",
        build_file = Label("//third_party/cargo/remote:BUILD.typenum-1.15.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ucd_trie__0_1_3",
        url = "https://crates.io/api/v1/crates/ucd-trie/0.1.3/download",
        type = "tar.gz",
        sha256 = "56dee185309b50d1f11bfedef0fe6d036842e3fb77413abef29f8f8d1c5d4c1c",
        strip_prefix = "ucd-trie-0.1.3",
        build_file = Label("//third_party/cargo/remote:BUILD.ucd-trie-0.1.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_bidi__0_3_7",
        url = "https://crates.io/api/v1/crates/unicode-bidi/0.3.7/download",
        type = "tar.gz",
        sha256 = "1a01404663e3db436ed2746d9fefef640d868edae3cceb81c3b8d5732fda678f",
        strip_prefix = "unicode-bidi-0.3.7",
        build_file = Label("//third_party/cargo/remote:BUILD.unicode-bidi-0.3.7.bazel"),
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
        name = "raze__uuid__0_8_2",
        url = "https://crates.io/api/v1/crates/uuid/0.8.2/download",
        type = "tar.gz",
        sha256 = "bc5cf98d8186244414c848017f0e2676b3fcb46807f6668a97dfe67359a3c4b7",
        strip_prefix = "uuid-0.8.2",
        build_file = Label("//third_party/cargo/remote:BUILD.uuid-0.8.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__value_bag__1_0_0_alpha_8",
        url = "https://crates.io/api/v1/crates/value-bag/1.0.0-alpha.8/download",
        type = "tar.gz",
        sha256 = "79923f7731dc61ebfba3633098bf3ac533bbd35ccd8c57e7088d9a5eebe0263f",
        strip_prefix = "value-bag-1.0.0-alpha.8",
        build_file = Label("//third_party/cargo/remote:BUILD.value-bag-1.0.0-alpha.8.bazel"),
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
        name = "raze__version_check__0_9_4",
        url = "https://crates.io/api/v1/crates/version_check/0.9.4/download",
        type = "tar.gz",
        sha256 = "49874b5167b65d7193b8aba1567f5c7d93d001cafc34600cee003eda787e483f",
        strip_prefix = "version_check-0.9.4",
        build_file = Label("//third_party/cargo/remote:BUILD.version_check-0.9.4.bazel"),
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
        name = "raze__wasm_bindgen__0_2_78",
        url = "https://crates.io/api/v1/crates/wasm-bindgen/0.2.78/download",
        type = "tar.gz",
        sha256 = "632f73e236b219150ea279196e54e610f5dbafa5d61786303d4da54f84e47fce",
        strip_prefix = "wasm-bindgen-0.2.78",
        build_file = Label("//third_party/cargo/remote:BUILD.wasm-bindgen-0.2.78.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_backend__0_2_78",
        url = "https://crates.io/api/v1/crates/wasm-bindgen-backend/0.2.78/download",
        type = "tar.gz",
        sha256 = "a317bf8f9fba2476b4b2c85ef4c4af8ff39c3c7f0cdfeed4f82c34a880aa837b",
        strip_prefix = "wasm-bindgen-backend-0.2.78",
        build_file = Label("//third_party/cargo/remote:BUILD.wasm-bindgen-backend-0.2.78.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_futures__0_4_28",
        url = "https://crates.io/api/v1/crates/wasm-bindgen-futures/0.4.28/download",
        type = "tar.gz",
        sha256 = "8e8d7523cb1f2a4c96c1317ca690031b714a51cc14e05f712446691f413f5d39",
        strip_prefix = "wasm-bindgen-futures-0.4.28",
        build_file = Label("//third_party/cargo/remote:BUILD.wasm-bindgen-futures-0.4.28.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_macro__0_2_78",
        url = "https://crates.io/api/v1/crates/wasm-bindgen-macro/0.2.78/download",
        type = "tar.gz",
        sha256 = "d56146e7c495528bf6587663bea13a8eb588d39b36b679d83972e1a2dbbdacf9",
        strip_prefix = "wasm-bindgen-macro-0.2.78",
        build_file = Label("//third_party/cargo/remote:BUILD.wasm-bindgen-macro-0.2.78.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_macro_support__0_2_78",
        url = "https://crates.io/api/v1/crates/wasm-bindgen-macro-support/0.2.78/download",
        type = "tar.gz",
        sha256 = "7803e0eea25835f8abdc585cd3021b3deb11543c6fe226dcd30b228857c5c5ab",
        strip_prefix = "wasm-bindgen-macro-support-0.2.78",
        build_file = Label("//third_party/cargo/remote:BUILD.wasm-bindgen-macro-support-0.2.78.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wasm_bindgen_shared__0_2_78",
        url = "https://crates.io/api/v1/crates/wasm-bindgen-shared/0.2.78/download",
        type = "tar.gz",
        sha256 = "0237232789cf037d5480773fe568aac745bfe2afbc11a863e97901780a6b47cc",
        strip_prefix = "wasm-bindgen-shared-0.2.78",
        build_file = Label("//third_party/cargo/remote:BUILD.wasm-bindgen-shared-0.2.78.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__web_sys__0_3_55",
        url = "https://crates.io/api/v1/crates/web-sys/0.3.55/download",
        type = "tar.gz",
        sha256 = "38eb105f1c59d9eaa6b5cdc92b859d85b926e82cb2e0945cd0c9259faa6fe9fb",
        strip_prefix = "web-sys-0.3.55",
        build_file = Label("//third_party/cargo/remote:BUILD.web-sys-0.3.55.bazel"),
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
        name = "raze__ws_stream_wasm__0_7_3",
        url = "https://crates.io/api/v1/crates/ws_stream_wasm/0.7.3/download",
        type = "tar.gz",
        sha256 = "47ca1ab42f5afed7fc332b22b6e932ca5414b209465412c8cdf0ad23bc0de645",
        strip_prefix = "ws_stream_wasm-0.7.3",
        build_file = Label("//third_party/cargo/remote:BUILD.ws_stream_wasm-0.7.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__x25519_dalek__1_2_0",
        url = "https://crates.io/api/v1/crates/x25519-dalek/1.2.0/download",
        type = "tar.gz",
        sha256 = "2392b6b94a576b4e2bf3c5b2757d63f10ada8020a2e4d08ac849ebcf6ea8e077",
        strip_prefix = "x25519-dalek-1.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.x25519-dalek-1.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__zeroize__1_3_0",
        url = "https://crates.io/api/v1/crates/zeroize/1.3.0/download",
        type = "tar.gz",
        sha256 = "4756f7db3f7b5574938c3eb1c117038b8e07f95ee6718c0efad4ac21508f1efd",
        strip_prefix = "zeroize-1.3.0",
        build_file = Label("//third_party/cargo/remote:BUILD.zeroize-1.3.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__zeroize_derive__1_2_2",
        url = "https://crates.io/api/v1/crates/zeroize_derive/1.2.2/download",
        type = "tar.gz",
        sha256 = "65f1a51723ec88c66d5d1fe80c841f17f63587d6691901d66be9bec6c3b51f73",
        strip_prefix = "zeroize_derive-1.2.2",
        build_file = Label("//third_party/cargo/remote:BUILD.zeroize_derive-1.2.2.bazel"),
    )
