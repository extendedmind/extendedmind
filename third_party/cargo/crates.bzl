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
        name = "raze__addr2line__0_19_0",
        url = "https://crates.io/api/v1/crates/addr2line/0.19.0/download",
        type = "tar.gz",
        sha256 = "a76fd60b23679b7d19bd066031410fb7e458ccc5e958eb5c325888ce4baedc97",
        strip_prefix = "addr2line-0.19.0",
        build_file = Label("//third_party/cargo/remote:BUILD.addr2line-0.19.0.bazel"),
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
        name = "raze__aead__0_5_1",
        url = "https://crates.io/api/v1/crates/aead/0.5.1/download",
        type = "tar.gz",
        sha256 = "5c192eb8f11fc081b0fe4259ba5af04217d4e0faddd02417310a927911abd7c8",
        strip_prefix = "aead-0.5.1",
        build_file = Label("//third_party/cargo/remote:BUILD.aead-0.5.1.bazel"),
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
        name = "raze__aes__0_8_2",
        url = "https://crates.io/api/v1/crates/aes/0.8.2/download",
        type = "tar.gz",
        sha256 = "433cfd6710c9986c576a25ca913c39d66a6474107b406f34f91d4a8923395241",
        strip_prefix = "aes-0.8.2",
        build_file = Label("//third_party/cargo/remote:BUILD.aes-0.8.2.bazel"),
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
        name = "raze__age__0_9_0",
        url = "https://crates.io/api/v1/crates/age/0.9.0/download",
        type = "tar.gz",
        sha256 = "1056efa39f3f960845e69985c292022187b47bc3f83ddfc96edfc586007735a1",
        strip_prefix = "age-0.9.0",
        build_file = Label("//third_party/cargo/remote:BUILD.age-0.9.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__age_core__0_9_0",
        url = "https://crates.io/api/v1/crates/age-core/0.9.0/download",
        type = "tar.gz",
        sha256 = "e3d2e815ac879dc23c1139e720d21c6cd4d1276345c772587285d965a69b8f32",
        strip_prefix = "age-core-0.9.0",
        build_file = Label("//third_party/cargo/remote:BUILD.age-core-0.9.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__aho_corasick__0_7_20",
        url = "https://crates.io/api/v1/crates/aho-corasick/0.7.20/download",
        type = "tar.gz",
        sha256 = "cc936419f96fa211c1b9166887b38e5e40b19958e5b895be7c1f93adec7071ac",
        strip_prefix = "aho-corasick-0.7.20",
        build_file = Label("//third_party/cargo/remote:BUILD.aho-corasick-0.7.20.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__alloc_no_stdlib__2_0_4",
        url = "https://crates.io/api/v1/crates/alloc-no-stdlib/2.0.4/download",
        type = "tar.gz",
        sha256 = "cc7bb162ec39d46ab1ca8c77bf72e890535becd1751bb45f64c597edb4c8c6b3",
        strip_prefix = "alloc-no-stdlib-2.0.4",
        build_file = Label("//third_party/cargo/remote:BUILD.alloc-no-stdlib-2.0.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__alloc_stdlib__0_2_2",
        url = "https://crates.io/api/v1/crates/alloc-stdlib/0.2.2/download",
        type = "tar.gz",
        sha256 = "94fb8275041c72129eb51b7d0322c29b8387a0386127718b096429201a5d6ece",
        strip_prefix = "alloc-stdlib-0.2.2",
        build_file = Label("//third_party/cargo/remote:BUILD.alloc-stdlib-0.2.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__android_system_properties__0_1_5",
        url = "https://crates.io/api/v1/crates/android_system_properties/0.1.5/download",
        type = "tar.gz",
        sha256 = "819e7219dbd41043ac279b19830f2efc897156490d7fd6ea916720117ee66311",
        strip_prefix = "android_system_properties-0.1.5",
        build_file = Label("//third_party/cargo/remote:BUILD.android_system_properties-0.1.5.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__anyhow__1_0_68",
        url = "https://crates.io/api/v1/crates/anyhow/1.0.68/download",
        type = "tar.gz",
        sha256 = "2cb2f989d18dd141ab8ae82f64d1a8cdd37e0840f73a406896cf5e99502fab61",
        strip_prefix = "anyhow-1.0.68",
        build_file = Label("//third_party/cargo/remote:BUILD.anyhow-1.0.68.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__arc_swap__1_6_0",
        url = "https://crates.io/api/v1/crates/arc-swap/1.6.0/download",
        type = "tar.gz",
        sha256 = "bddcadddf5e9015d310179a59bb28c4d4b9920ad0f11e8e14dbadf654890c9a6",
        strip_prefix = "arc-swap-1.6.0",
        build_file = Label("//third_party/cargo/remote:BUILD.arc-swap-1.6.0.bazel"),
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
        name = "raze__asn1_rs__0_3_1",
        url = "https://crates.io/api/v1/crates/asn1-rs/0.3.1/download",
        type = "tar.gz",
        sha256 = "30ff05a702273012438132f449575dbc804e27b2f3cbe3069aa237d26c98fa33",
        strip_prefix = "asn1-rs-0.3.1",
        build_file = Label("//third_party/cargo/remote:BUILD.asn1-rs-0.3.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__asn1_rs_derive__0_1_0",
        url = "https://crates.io/api/v1/crates/asn1-rs-derive/0.1.0/download",
        type = "tar.gz",
        sha256 = "db8b7511298d5b7784b40b092d9e9dcd3a627a5707e4b5e507931ab0d44eeebf",
        strip_prefix = "asn1-rs-derive-0.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.asn1-rs-derive-0.1.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__asn1_rs_impl__0_1_0",
        url = "https://crates.io/api/v1/crates/asn1-rs-impl/0.1.0/download",
        type = "tar.gz",
        sha256 = "2777730b2039ac0f95f093556e61b6d26cebed5393ca6f152717777cec3a42ed",
        strip_prefix = "asn1-rs-impl-0.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.asn1-rs-impl-0.1.0.bazel"),
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
        name = "raze__async_channel__1_8_0",
        url = "https://crates.io/api/v1/crates/async-channel/1.8.0/download",
        type = "tar.gz",
        sha256 = "cf46fee83e5ccffc220104713af3292ff9bc7c64c7de289f66dae8e38d826833",
        strip_prefix = "async-channel-1.8.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-channel-1.8.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_compression__0_3_15",
        url = "https://crates.io/api/v1/crates/async-compression/0.3.15/download",
        type = "tar.gz",
        sha256 = "942c7cd7ae39e91bde4820d74132e9862e62c2f386c3aa90ccf55949f5bad63a",
        strip_prefix = "async-compression-0.3.15",
        build_file = Label("//third_party/cargo/remote:BUILD.async-compression-0.3.15.bazel"),
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
        name = "raze__async_executor__1_5_0",
        url = "https://crates.io/api/v1/crates/async-executor/1.5.0/download",
        type = "tar.gz",
        sha256 = "17adb73da160dfb475c183343c8cccd80721ea5a605d3eb57125f0a7b7a92d0b",
        strip_prefix = "async-executor-1.5.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-executor-1.5.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_fs__1_6_0",
        url = "https://crates.io/api/v1/crates/async-fs/1.6.0/download",
        type = "tar.gz",
        sha256 = "279cf904654eeebfa37ac9bb1598880884924aab82e290aa65c9e77a0e142e06",
        strip_prefix = "async-fs-1.6.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-fs-1.6.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_global_executor__2_3_1",
        url = "https://crates.io/api/v1/crates/async-global-executor/2.3.1/download",
        type = "tar.gz",
        sha256 = "f1b6f5d7df27bd294849f8eec66ecfc63d11814df7a4f5d74168a2394467b776",
        strip_prefix = "async-global-executor-2.3.1",
        build_file = Label("//third_party/cargo/remote:BUILD.async-global-executor-2.3.1.bazel"),
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
        name = "raze__async_io__1_12_0",
        url = "https://crates.io/api/v1/crates/async-io/1.12.0/download",
        type = "tar.gz",
        sha256 = "8c374dda1ed3e7d8f0d9ba58715f924862c63eae6849c92d3a18e7fbde9e2794",
        strip_prefix = "async-io-1.12.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-io-1.12.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_lock__2_6_0",
        url = "https://crates.io/api/v1/crates/async-lock/2.6.0/download",
        type = "tar.gz",
        sha256 = "c8101efe8695a6c17e02911402145357e718ac92d3ff88ae8419e84b1707b685",
        strip_prefix = "async-lock-2.6.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-lock-2.6.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_net__1_7_0",
        url = "https://crates.io/api/v1/crates/async-net/1.7.0/download",
        type = "tar.gz",
        sha256 = "4051e67316bc7eff608fe723df5d32ed639946adcd69e07df41fd42a7b411f1f",
        strip_prefix = "async-net-1.7.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-net-1.7.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_process__1_6_0",
        url = "https://crates.io/api/v1/crates/async-process/1.6.0/download",
        type = "tar.gz",
        sha256 = "6381ead98388605d0d9ff86371043b5aa922a3905824244de40dc263a14fcba4",
        strip_prefix = "async-process-1.6.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-process-1.6.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_rustls__0_2_0",
        url = "https://crates.io/api/v1/crates/async-rustls/0.2.0/download",
        type = "tar.gz",
        sha256 = "9c86f33abd5a4f3e2d6d9251a9e0c6a7e52eb1113caf893dae8429bf4a53f378",
        strip_prefix = "async-rustls-0.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-rustls-0.2.0.bazel"),
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
        name = "raze__async_std__1_12_0",
        url = "https://crates.io/api/v1/crates/async-std/1.12.0/download",
        type = "tar.gz",
        sha256 = "62565bb4402e926b29953c785397c6dc0391b7b446e45008b0049eb43cec6f5d",
        strip_prefix = "async-std-1.12.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-std-1.12.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_task__4_3_0",
        url = "https://crates.io/api/v1/crates/async-task/4.3.0/download",
        type = "tar.gz",
        sha256 = "7a40729d2133846d9ed0ea60a8b9541bccddab49cd30f0715a1da672fe9a2524",
        strip_prefix = "async-task-4.3.0",
        build_file = Label("//third_party/cargo/remote:BUILD.async-task-4.3.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__async_trait__0_1_64",
        url = "https://crates.io/api/v1/crates/async-trait/0.1.64/download",
        type = "tar.gz",
        sha256 = "1cd7fce9ba8c3c042128ce72d8b2ddbf3a05747efb67ea0313c635e10bda47a2",
        strip_prefix = "async-trait-0.1.64",
        build_file = Label("//third_party/cargo/remote:BUILD.async-trait-0.1.64.bazel"),
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
        name = "raze__atomic_waker__1_1_0",
        url = "https://crates.io/api/v1/crates/atomic-waker/1.1.0/download",
        type = "tar.gz",
        sha256 = "debc29dde2e69f9e47506b525f639ed42300fc014a3e007832592448fa8e4599",
        strip_prefix = "atomic-waker-1.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.atomic-waker-1.1.0.bazel"),
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
        name = "raze__autocfg__1_1_0",
        url = "https://crates.io/api/v1/crates/autocfg/1.1.0/download",
        type = "tar.gz",
        sha256 = "d468802bab17cbc0cc575e9b053f41e72aa36bfa6b7f55e3529ffa43161b97fa",
        strip_prefix = "autocfg-1.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.autocfg-1.1.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__automerge__0_3_0",
        url = "https://crates.io/api/v1/crates/automerge/0.3.0/download",
        type = "tar.gz",
        sha256 = "001093dfcea0a077d36b6039d98e77a6b8cea9e625552ec206305cbbd3a69816",
        strip_prefix = "automerge-0.3.0",
        build_file = Label("//third_party/cargo/remote:BUILD.automerge-0.3.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__backtrace__0_3_67",
        url = "https://crates.io/api/v1/crates/backtrace/0.3.67/download",
        type = "tar.gz",
        sha256 = "233d376d6d185f2a3093e58f283f60f880315b6c60075b01f36b3b85154564ca",
        strip_prefix = "backtrace-0.3.67",
        build_file = Label("//third_party/cargo/remote:BUILD.backtrace-0.3.67.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__base_x__0_2_11",
        url = "https://crates.io/api/v1/crates/base-x/0.2.11/download",
        type = "tar.gz",
        sha256 = "4cbbc9d0964165b47557570cce6c952866c2678457aca742aafc9fb771d30270",
        strip_prefix = "base-x-0.2.11",
        build_file = Label("//third_party/cargo/remote:BUILD.base-x-0.2.11.bazel"),
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
        name = "raze__base64__0_13_1",
        url = "https://crates.io/api/v1/crates/base64/0.13.1/download",
        type = "tar.gz",
        sha256 = "9e1b586273c5702936fe7b7d6896644d8be71e6314cfe09d3167c95f712589e8",
        strip_prefix = "base64-0.13.1",
        build_file = Label("//third_party/cargo/remote:BUILD.base64-0.13.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__base64__0_21_0",
        url = "https://crates.io/api/v1/crates/base64/0.21.0/download",
        type = "tar.gz",
        sha256 = "a4a4ddaa51a5bc52a6948f74c06d20aaaddb71924eab79b8c97a8c556e942d6a",
        strip_prefix = "base64-0.21.0",
        build_file = Label("//third_party/cargo/remote:BUILD.base64-0.21.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__base64ct__1_5_3",
        url = "https://crates.io/api/v1/crates/base64ct/1.5.3/download",
        type = "tar.gz",
        sha256 = "b645a089122eccb6111b4f81cbc1a49f5900ac4666bb93ac027feaecf15607bf",
        strip_prefix = "base64ct-1.5.3",
        build_file = Label("//third_party/cargo/remote:BUILD.base64ct-1.5.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__bcrypt_pbkdf__0_9_0",
        url = "https://crates.io/api/v1/crates/bcrypt-pbkdf/0.9.0/download",
        type = "tar.gz",
        sha256 = "3806a8db60cf56efee531616a34a6aaa9a114d6da2add861b0fa4a188881b2c7",
        strip_prefix = "bcrypt-pbkdf-0.9.0",
        build_file = Label("//third_party/cargo/remote:BUILD.bcrypt-pbkdf-0.9.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__bech32__0_9_1",
        url = "https://crates.io/api/v1/crates/bech32/0.9.1/download",
        type = "tar.gz",
        sha256 = "d86b93f97252c47b41663388e6d155714a9d0c398b99f1005cbc5f978b29f445",
        strip_prefix = "bech32-0.9.1",
        build_file = Label("//third_party/cargo/remote:BUILD.bech32-0.9.1.bazel"),
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
        name = "raze__blake2__0_10_6",
        url = "https://crates.io/api/v1/crates/blake2/0.10.6/download",
        type = "tar.gz",
        sha256 = "46502ad458c9a52b69d4d4d32775c788b7a1b85e8bc9d482d92250fc0e3f8efe",
        strip_prefix = "blake2-0.10.6",
        build_file = Label("//third_party/cargo/remote:BUILD.blake2-0.10.6.bazel"),
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
        name = "raze__block_buffer__0_10_3",
        url = "https://crates.io/api/v1/crates/block-buffer/0.10.3/download",
        type = "tar.gz",
        sha256 = "69cce20737498f97b993470a6e536b8523f0af7892a4f928cceb1ac5e52ebe7e",
        strip_prefix = "block-buffer-0.10.3",
        build_file = Label("//third_party/cargo/remote:BUILD.block-buffer-0.10.3.bazel"),
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
        name = "raze__block_padding__0_3_2",
        url = "https://crates.io/api/v1/crates/block-padding/0.3.2/download",
        type = "tar.gz",
        sha256 = "0a90ec2df9600c28a01c56c4784c9207a96d2451833aeceb8cc97e4c9548bb78",
        strip_prefix = "block-padding-0.3.2",
        build_file = Label("//third_party/cargo/remote:BUILD.block-padding-0.3.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__blocking__1_3_0",
        url = "https://crates.io/api/v1/crates/blocking/1.3.0/download",
        type = "tar.gz",
        sha256 = "3c67b173a56acffd6d2326fb7ab938ba0b00a71480e14902b2591c87bc5741e8",
        strip_prefix = "blocking-1.3.0",
        build_file = Label("//third_party/cargo/remote:BUILD.blocking-1.3.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__blowfish__0_9_1",
        url = "https://crates.io/api/v1/crates/blowfish/0.9.1/download",
        type = "tar.gz",
        sha256 = "e412e2cd0f2b2d93e02543ceae7917b3c70331573df19ee046bcbc35e45e87d7",
        strip_prefix = "blowfish-0.9.1",
        build_file = Label("//third_party/cargo/remote:BUILD.blowfish-0.9.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__brotli__3_3_4",
        url = "https://crates.io/api/v1/crates/brotli/3.3.4/download",
        type = "tar.gz",
        sha256 = "a1a0b1dbcc8ae29329621f8d4f0d835787c1c38bb1401979b49d13b0b305ff68",
        strip_prefix = "brotli-3.3.4",
        build_file = Label("//third_party/cargo/remote:BUILD.brotli-3.3.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__brotli_decompressor__2_3_4",
        url = "https://crates.io/api/v1/crates/brotli-decompressor/2.3.4/download",
        type = "tar.gz",
        sha256 = "4b6561fd3f895a11e8f72af2cb7d22e08366bebc2b6b57f7744c4bda27034744",
        strip_prefix = "brotli-decompressor-2.3.4",
        build_file = Label("//third_party/cargo/remote:BUILD.brotli-decompressor-2.3.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__bumpalo__3_12_0",
        url = "https://crates.io/api/v1/crates/bumpalo/3.12.0/download",
        type = "tar.gz",
        sha256 = "0d261e256854913907f67ed06efbc3338dfe6179796deefc1ff763fc1aee5535",
        strip_prefix = "bumpalo-3.12.0",
        build_file = Label("//third_party/cargo/remote:BUILD.bumpalo-3.12.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__bytecount__0_6_3",
        url = "https://crates.io/api/v1/crates/bytecount/0.6.3/download",
        type = "tar.gz",
        sha256 = "2c676a478f63e9fa2dd5368a42f28bba0d6c560b775f38583c8bbaa7fcd67c9c",
        strip_prefix = "bytecount-0.6.3",
        build_file = Label("//third_party/cargo/remote:BUILD.bytecount-0.6.3.bazel"),
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
        name = "raze__bytes__1_3_0",
        url = "https://crates.io/api/v1/crates/bytes/1.3.0/download",
        type = "tar.gz",
        sha256 = "dfb24e866b15a1af2a1b663f10c6b6b8f397a84aadb828f12e5b289ec23a3a3c",
        strip_prefix = "bytes-1.3.0",
        build_file = Label("//third_party/cargo/remote:BUILD.bytes-1.3.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__camino__1_1_2",
        url = "https://crates.io/api/v1/crates/camino/1.1.2/download",
        type = "tar.gz",
        sha256 = "c77df041dc383319cc661b428b6961a005db4d6808d5e12536931b1ca9556055",
        strip_prefix = "camino-1.1.2",
        build_file = Label("//third_party/cargo/remote:BUILD.camino-1.1.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__capnp__0_14_11",
        url = "https://crates.io/api/v1/crates/capnp/0.14.11/download",
        type = "tar.gz",
        sha256 = "2dca085c2c7d9d65ad749d450b19b551efaa8e3476a439bdca07aca8533097f3",
        strip_prefix = "capnp-0.14.11",
        build_file = Label("//third_party/cargo/remote:BUILD.capnp-0.14.11.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cargo_platform__0_1_2",
        url = "https://crates.io/api/v1/crates/cargo-platform/0.1.2/download",
        type = "tar.gz",
        sha256 = "cbdb825da8a5df079a43676dbe042702f1707b1109f713a01420fbb4cc71fa27",
        strip_prefix = "cargo-platform-0.1.2",
        build_file = Label("//third_party/cargo/remote:BUILD.cargo-platform-0.1.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cargo_metadata__0_14_2",
        url = "https://crates.io/api/v1/crates/cargo_metadata/0.14.2/download",
        type = "tar.gz",
        sha256 = "4acbb09d9ee8e23699b9634375c72795d095bf268439da88562cf9b501f181fa",
        strip_prefix = "cargo_metadata-0.14.2",
        build_file = Label("//third_party/cargo/remote:BUILD.cargo_metadata-0.14.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cbc__0_1_2",
        url = "https://crates.io/api/v1/crates/cbc/0.1.2/download",
        type = "tar.gz",
        sha256 = "26b52a9543ae338f279b96b0b9fed9c8093744685043739079ce85cd58f289a6",
        strip_prefix = "cbc-0.1.2",
        build_file = Label("//third_party/cargo/remote:BUILD.cbc-0.1.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cc__1_0_79",
        url = "https://crates.io/api/v1/crates/cc/1.0.79/download",
        type = "tar.gz",
        sha256 = "50d30906286121d95be3d479533b458f87493b30a4b5f79a607db8f5d11aa91f",
        strip_prefix = "cc-1.0.79",
        build_file = Label("//third_party/cargo/remote:BUILD.cc-1.0.79.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cesu8__1_1_0",
        url = "https://crates.io/api/v1/crates/cesu8/1.1.0/download",
        type = "tar.gz",
        sha256 = "6d43a04d8753f35258c91f8ec639f792891f748a1edbd759cf1dcea3382ad83c",
        strip_prefix = "cesu8-1.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.cesu8-1.1.0.bazel"),
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
        name = "raze__chacha20__0_8_2",
        url = "https://crates.io/api/v1/crates/chacha20/0.8.2/download",
        type = "tar.gz",
        sha256 = "5c80e5460aa66fe3b91d40bcbdab953a597b60053e34d684ac6903f863b680a6",
        strip_prefix = "chacha20-0.8.2",
        build_file = Label("//third_party/cargo/remote:BUILD.chacha20-0.8.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__chacha20__0_9_0",
        url = "https://crates.io/api/v1/crates/chacha20/0.9.0/download",
        type = "tar.gz",
        sha256 = "c7fc89c7c5b9e7a02dfe45cd2367bae382f9ed31c61ca8debe5f827c420a2f08",
        strip_prefix = "chacha20-0.9.0",
        build_file = Label("//third_party/cargo/remote:BUILD.chacha20-0.9.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__chacha20poly1305__0_10_1",
        url = "https://crates.io/api/v1/crates/chacha20poly1305/0.10.1/download",
        type = "tar.gz",
        sha256 = "10cd79432192d1c0f4e1a0fef9527696cc039165d729fb41b3f4f4f354c2dc35",
        strip_prefix = "chacha20poly1305-0.10.1",
        build_file = Label("//third_party/cargo/remote:BUILD.chacha20poly1305-0.10.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__chacha20poly1305__0_9_1",
        url = "https://crates.io/api/v1/crates/chacha20poly1305/0.9.1/download",
        type = "tar.gz",
        sha256 = "a18446b09be63d457bbec447509e85f662f32952b035ce892290396bc0b0cff5",
        strip_prefix = "chacha20poly1305-0.9.1",
        build_file = Label("//third_party/cargo/remote:BUILD.chacha20poly1305-0.9.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__chrono__0_4_23",
        url = "https://crates.io/api/v1/crates/chrono/0.4.23/download",
        type = "tar.gz",
        sha256 = "16b0a3d9ed01224b22057780a37bb8c5dbfe1be8ba48678e7bf57ec4b385411f",
        strip_prefix = "chrono-0.4.23",
        build_file = Label("//third_party/cargo/remote:BUILD.chrono-0.4.23.bazel"),
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
        name = "raze__cipher__0_4_3",
        url = "https://crates.io/api/v1/crates/cipher/0.4.3/download",
        type = "tar.gz",
        sha256 = "d1873270f8f7942c191139cb8a40fd228da6c3fd2fc376d7e92d47aa14aeb59e",
        strip_prefix = "cipher-0.4.3",
        build_file = Label("//third_party/cargo/remote:BUILD.cipher-0.4.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__clap__3_2_23",
        url = "https://crates.io/api/v1/crates/clap/3.2.23/download",
        type = "tar.gz",
        sha256 = "71655c45cb9845d3270c9d6df84ebe72b4dad3c2ba3f7023ad47c144e4e473a5",
        strip_prefix = "clap-3.2.23",
        build_file = Label("//third_party/cargo/remote:BUILD.clap-3.2.23.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__clap_derive__3_2_18",
        url = "https://crates.io/api/v1/crates/clap_derive/3.2.18/download",
        type = "tar.gz",
        sha256 = "ea0c8bce528c4be4da13ea6fead8965e95b6073585a2f05204bd8f4119f82a65",
        strip_prefix = "clap_derive-3.2.18",
        build_file = Label("//third_party/cargo/remote:BUILD.clap_derive-3.2.18.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__clap_lex__0_2_4",
        url = "https://crates.io/api/v1/crates/clap_lex/0.2.4/download",
        type = "tar.gz",
        sha256 = "2850f2f5a82cbf437dd5af4d49848fbdfc27c157c3d010345776f952765261c5",
        strip_prefix = "clap_lex-0.2.4",
        build_file = Label("//third_party/cargo/remote:BUILD.clap_lex-0.2.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__codespan_reporting__0_11_1",
        url = "https://crates.io/api/v1/crates/codespan-reporting/0.11.1/download",
        type = "tar.gz",
        sha256 = "3538270d33cc669650c4b093848450d380def10c331d38c768e34cac80576e6e",
        strip_prefix = "codespan-reporting-0.11.1",
        build_file = Label("//third_party/cargo/remote:BUILD.codespan-reporting-0.11.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__combine__4_6_6",
        url = "https://crates.io/api/v1/crates/combine/4.6.6/download",
        type = "tar.gz",
        sha256 = "35ed6e9d84f0b51a7f52daf1c7d71dd136fd7a3f41a8462b8cdb8c78d920fad4",
        strip_prefix = "combine-4.6.6",
        build_file = Label("//third_party/cargo/remote:BUILD.combine-4.6.6.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__concurrent_queue__2_1_0",
        url = "https://crates.io/api/v1/crates/concurrent-queue/2.1.0/download",
        type = "tar.gz",
        sha256 = "c278839b831783b70278b14df4d45e1beb1aad306c07bb796637de9a0e323e8e",
        strip_prefix = "concurrent-queue-2.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.concurrent-queue-2.1.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__console__0_15_5",
        url = "https://crates.io/api/v1/crates/console/0.15.5/download",
        type = "tar.gz",
        sha256 = "c3d79fbe8970a77e3e34151cc13d3b3e248aa0faaecb9f6091fa07ebefe5ad60",
        strip_prefix = "console-0.15.5",
        build_file = Label("//third_party/cargo/remote:BUILD.console-0.15.5.bazel"),
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
        name = "raze__const_oid__0_9_1",
        url = "https://crates.io/api/v1/crates/const-oid/0.9.1/download",
        type = "tar.gz",
        sha256 = "cec318a675afcb6a1ea1d4340e2d377e56e47c266f28043ceccbf4412ddfdd3b",
        strip_prefix = "const-oid-0.9.1",
        build_file = Label("//third_party/cargo/remote:BUILD.const-oid-0.9.1.bazel"),
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
        name = "raze__cookie_factory__0_3_2",
        url = "https://crates.io/api/v1/crates/cookie-factory/0.3.2/download",
        type = "tar.gz",
        sha256 = "396de984970346b0d9e93d1415082923c679e5ae5c3ee3dcbd104f5610af126b",
        strip_prefix = "cookie-factory-0.3.2",
        build_file = Label("//third_party/cargo/remote:BUILD.cookie-factory-0.3.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__core_foundation_sys__0_8_3",
        url = "https://crates.io/api/v1/crates/core-foundation-sys/0.8.3/download",
        type = "tar.gz",
        sha256 = "5827cebf4670468b8772dd191856768aedcb1b0278a04f989f7766351917b9dc",
        strip_prefix = "core-foundation-sys-0.8.3",
        build_file = Label("//third_party/cargo/remote:BUILD.core-foundation-sys-0.8.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cpufeatures__0_2_5",
        url = "https://crates.io/api/v1/crates/cpufeatures/0.2.5/download",
        type = "tar.gz",
        sha256 = "28d997bd5e24a5928dd43e46dc529867e207907fe0b239c3477d924f7f2ca320",
        strip_prefix = "cpufeatures-0.2.5",
        build_file = Label("//third_party/cargo/remote:BUILD.cpufeatures-0.2.5.bazel"),
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
        name = "raze__crc32fast__1_3_2",
        url = "https://crates.io/api/v1/crates/crc32fast/1.3.2/download",
        type = "tar.gz",
        sha256 = "b540bd8bc810d3885c6ea91e2018302f68baba2129ab3e88f32389ee9370880d",
        strip_prefix = "crc32fast-1.3.2",
        build_file = Label("//third_party/cargo/remote:BUILD.crc32fast-1.3.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__crossbeam_channel__0_5_6",
        url = "https://crates.io/api/v1/crates/crossbeam-channel/0.5.6/download",
        type = "tar.gz",
        sha256 = "c2dd04ddaf88237dc3b8d8f9a3c1004b506b54b3313403944054d23c0870c521",
        strip_prefix = "crossbeam-channel-0.5.6",
        build_file = Label("//third_party/cargo/remote:BUILD.crossbeam-channel-0.5.6.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__crossbeam_epoch__0_8_2",
        url = "https://crates.io/api/v1/crates/crossbeam-epoch/0.8.2/download",
        type = "tar.gz",
        sha256 = "058ed274caafc1f60c4997b5fc07bf7dc7cca454af7c6e81edffe5f33f70dace",
        strip_prefix = "crossbeam-epoch-0.8.2",
        build_file = Label("//third_party/cargo/remote:BUILD.crossbeam-epoch-0.8.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__crossbeam_utils__0_7_2",
        url = "https://crates.io/api/v1/crates/crossbeam-utils/0.7.2/download",
        type = "tar.gz",
        sha256 = "c3c7c73a2d1e9fc0886a08b93e98eb643461230d5f1925e4036204d5f2e261a8",
        strip_prefix = "crossbeam-utils-0.7.2",
        build_file = Label("//third_party/cargo/remote:BUILD.crossbeam-utils-0.7.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__crossbeam_utils__0_8_14",
        url = "https://crates.io/api/v1/crates/crossbeam-utils/0.8.14/download",
        type = "tar.gz",
        sha256 = "4fb766fa798726286dbbb842f174001dab8abc7b627a1dd86e0b7222a95d929f",
        strip_prefix = "crossbeam-utils-0.8.14",
        build_file = Label("//third_party/cargo/remote:BUILD.crossbeam-utils-0.8.14.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__crypto_common__0_1_6",
        url = "https://crates.io/api/v1/crates/crypto-common/0.1.6/download",
        type = "tar.gz",
        sha256 = "1bfb12502f3fc46cca1bb51ac28df9d618d813cdc3d2f25b9fe775a34af26bb3",
        strip_prefix = "crypto-common-0.1.6",
        build_file = Label("//third_party/cargo/remote:BUILD.crypto-common-0.1.6.bazel"),
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
        name = "raze__crypto_secretstream__0_1_1",
        url = "https://crates.io/api/v1/crates/crypto_secretstream/0.1.1/download",
        type = "tar.gz",
        sha256 = "b12de441772bdf809d445bc1078c8535a5a6f61edeb2bbc5bee91ae95f5b2222",
        strip_prefix = "crypto_secretstream-0.1.1",
        build_file = Label("//third_party/cargo/remote:BUILD.crypto_secretstream-0.1.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ctor__0_1_26",
        url = "https://crates.io/api/v1/crates/ctor/0.1.26/download",
        type = "tar.gz",
        sha256 = "6d2301688392eb071b0bf1a37be05c469d3cc4dbbd95df672fe28ab021e6a096",
        strip_prefix = "ctor-0.1.26",
        build_file = Label("//third_party/cargo/remote:BUILD.ctor-0.1.26.bazel"),
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
        name = "raze__ctr__0_9_2",
        url = "https://crates.io/api/v1/crates/ctr/0.9.2/download",
        type = "tar.gz",
        sha256 = "0369ee1ad671834580515889b80f2ea915f23b8be8d0daa4bbaf2ac5c7590835",
        strip_prefix = "ctr-0.9.2",
        build_file = Label("//third_party/cargo/remote:BUILD.ctr-0.9.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ctrlc__3_2_4",
        url = "https://crates.io/api/v1/crates/ctrlc/3.2.4/download",
        type = "tar.gz",
        sha256 = "1631ca6e3c59112501a9d87fd86f21591ff77acd31331e8a73f8d80a65bbdd71",
        strip_prefix = "ctrlc-3.2.4",
        build_file = Label("//third_party/cargo/remote:BUILD.ctrlc-3.2.4.bazel"),
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
        name = "raze__curve25519_dalek__4_0_0_rc_0",
        url = "https://crates.io/api/v1/crates/curve25519-dalek/4.0.0-rc.0/download",
        type = "tar.gz",
        sha256 = "8da00a7a9a4eb92a0a0f8e75660926d48f0d0f3c537e455c457bcdaa1e16b1ac",
        strip_prefix = "curve25519-dalek-4.0.0-rc.0",
        build_file = Label("//third_party/cargo/remote:BUILD.curve25519-dalek-4.0.0-rc.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cxx__1_0_88",
        url = "https://crates.io/api/v1/crates/cxx/1.0.88/download",
        type = "tar.gz",
        sha256 = "322296e2f2e5af4270b54df9e85a02ff037e271af20ba3e7fe1575515dc840b8",
        strip_prefix = "cxx-1.0.88",
        build_file = Label("//third_party/cargo/remote:BUILD.cxx-1.0.88.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cxx_build__1_0_88",
        url = "https://crates.io/api/v1/crates/cxx-build/1.0.88/download",
        type = "tar.gz",
        sha256 = "017a1385b05d631e7875b1f151c9f012d37b53491e2a87f65bff5c262b2111d8",
        strip_prefix = "cxx-build-1.0.88",
        build_file = Label("//third_party/cargo/remote:BUILD.cxx-build-1.0.88.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cxxbridge_flags__1_0_88",
        url = "https://crates.io/api/v1/crates/cxxbridge-flags/1.0.88/download",
        type = "tar.gz",
        sha256 = "c26bbb078acf09bc1ecda02d4223f03bdd28bd4874edcb0379138efc499ce971",
        strip_prefix = "cxxbridge-flags-1.0.88",
        build_file = Label("//third_party/cargo/remote:BUILD.cxxbridge-flags-1.0.88.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__cxxbridge_macro__1_0_88",
        url = "https://crates.io/api/v1/crates/cxxbridge-macro/1.0.88/download",
        type = "tar.gz",
        sha256 = "357f40d1f06a24b60ae1fe122542c1fb05d28d32acb2aed064e84bc2ad1e252e",
        strip_prefix = "cxxbridge-macro-1.0.88",
        build_file = Label("//third_party/cargo/remote:BUILD.cxxbridge-macro-1.0.88.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__dashmap__5_4_0",
        url = "https://crates.io/api/v1/crates/dashmap/5.4.0/download",
        type = "tar.gz",
        sha256 = "907076dfda823b0b36d2a1bb5f90c96660a5bbcd7729e10727f07858f22c4edc",
        strip_prefix = "dashmap-5.4.0",
        build_file = Label("//third_party/cargo/remote:BUILD.dashmap-5.4.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__data_encoding__2_3_3",
        url = "https://crates.io/api/v1/crates/data-encoding/2.3.3/download",
        type = "tar.gz",
        sha256 = "23d8666cb01533c39dde32bcbab8e227b4ed6679b2c925eba05feabea39508fb",
        strip_prefix = "data-encoding-2.3.3",
        build_file = Label("//third_party/cargo/remote:BUILD.data-encoding-2.3.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__der__0_6_1",
        url = "https://crates.io/api/v1/crates/der/0.6.1/download",
        type = "tar.gz",
        sha256 = "f1a467a65c5e759bce6e65eaf91cc29f466cdc57cb65777bd646872a8a1fd4de",
        strip_prefix = "der-0.6.1",
        build_file = Label("//third_party/cargo/remote:BUILD.der-0.6.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__der_parser__7_0_0",
        url = "https://crates.io/api/v1/crates/der-parser/7.0.0/download",
        type = "tar.gz",
        sha256 = "fe398ac75057914d7d07307bf67dc7f3f574a26783b4fc7805a20ffa9f506e82",
        strip_prefix = "der-parser-7.0.0",
        build_file = Label("//third_party/cargo/remote:BUILD.der-parser-7.0.0.bazel"),
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
        name = "raze__digest__0_10_6",
        url = "https://crates.io/api/v1/crates/digest/0.10.6/download",
        type = "tar.gz",
        sha256 = "8168378f4e5023e7218c89c891c0fd8ecdb5e5e4f18cb78f38cf245dd021e76f",
        strip_prefix = "digest-0.10.6",
        build_file = Label("//third_party/cargo/remote:BUILD.digest-0.10.6.bazel"),
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
        name = "raze__displaydoc__0_2_3",
        url = "https://crates.io/api/v1/crates/displaydoc/0.2.3/download",
        type = "tar.gz",
        sha256 = "3bf95dc3f046b9da4f2d51833c0d3547d8564ef6910f5c1ed130306a75b92886",
        strip_prefix = "displaydoc-0.2.3",
        build_file = Label("//third_party/cargo/remote:BUILD.displaydoc-0.2.3.bazel"),
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
        name = "raze__ed25519__1_5_3",
        url = "https://crates.io/api/v1/crates/ed25519/1.5.3/download",
        type = "tar.gz",
        sha256 = "91cff35c70bba8a626e3185d8cd48cc11b5437e1a5bcd15b9b5fa3c64b6dfee7",
        strip_prefix = "ed25519-1.5.3",
        build_file = Label("//third_party/cargo/remote:BUILD.ed25519-1.5.3.bazel"),
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
        name = "raze__either__1_8_1",
        url = "https://crates.io/api/v1/crates/either/1.8.1/download",
        type = "tar.gz",
        sha256 = "7fcaabb2fef8c910e7f4c7ce9f67a1283a1715879a7c230ca9d6d1ae31f16d91",
        strip_prefix = "either-1.8.1",
        build_file = Label("//third_party/cargo/remote:BUILD.either-1.8.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__email_encoding__0_2_0",
        url = "https://crates.io/api/v1/crates/email-encoding/0.2.0/download",
        type = "tar.gz",
        sha256 = "dbfb21b9878cf7a348dcb8559109aabc0ec40d69924bd706fa5149846c4fef75",
        strip_prefix = "email-encoding-0.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.email-encoding-0.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__email_address__0_2_4",
        url = "https://crates.io/api/v1/crates/email_address/0.2.4/download",
        type = "tar.gz",
        sha256 = "e2153bd83ebc09db15bcbdc3e2194d901804952e3dc96967e1cd3b0c5c32d112",
        strip_prefix = "email_address-0.2.4",
        build_file = Label("//third_party/cargo/remote:BUILD.email_address-0.2.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__encode_unicode__0_3_6",
        url = "https://crates.io/api/v1/crates/encode_unicode/0.3.6/download",
        type = "tar.gz",
        sha256 = "a357d28ed41a50f9c765dbfe56cbc04a64e53e5fc58ba79fbc34c10ef3df831f",
        strip_prefix = "encode_unicode-0.3.6",
        build_file = Label("//third_party/cargo/remote:BUILD.encode_unicode-0.3.6.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__erased_serde__0_3_24",
        url = "https://crates.io/api/v1/crates/erased-serde/0.3.24/download",
        type = "tar.gz",
        sha256 = "e4ca605381c017ec7a5fef5e548f1cfaa419ed0f6df6367339300db74c92aa7d",
        strip_prefix = "erased-serde-0.3.24",
        build_file = Label("//third_party/cargo/remote:BUILD.erased-serde-0.3.24.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__error_chain__0_12_4",
        url = "https://crates.io/api/v1/crates/error-chain/0.12.4/download",
        type = "tar.gz",
        sha256 = "2d2f06b9cac1506ece98fe3231e3cc9c4410ec3d5b1f24ae1c8946f0742cdefc",
        strip_prefix = "error-chain-0.12.4",
        build_file = Label("//third_party/cargo/remote:BUILD.error-chain-0.12.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__event_listener__2_5_3",
        url = "https://crates.io/api/v1/crates/event-listener/2.5.3/download",
        type = "tar.gz",
        sha256 = "0206175f82b8d6bf6652ff7d71a1e27fd2e4efde587fd368662814d6ec1d9ce0",
        strip_prefix = "event-listener-2.5.3",
        build_file = Label("//third_party/cargo/remote:BUILD.event-listener-2.5.3.bazel"),
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
        name = "raze__fastrand__1_8_0",
        url = "https://crates.io/api/v1/crates/fastrand/1.8.0/download",
        type = "tar.gz",
        sha256 = "a7a407cfaa3385c4ae6b23e84623d48c2798d06e3e6a1878f7f59f17b3f86499",
        strip_prefix = "fastrand-1.8.0",
        build_file = Label("//third_party/cargo/remote:BUILD.fastrand-1.8.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__femme__2_2_1",
        url = "https://crates.io/api/v1/crates/femme/2.2.1/download",
        type = "tar.gz",
        sha256 = "cc04871e5ae3aa2952d552dae6b291b3099723bf779a8054281c1366a54613ef",
        strip_prefix = "femme-2.2.1",
        build_file = Label("//third_party/cargo/remote:BUILD.femme-2.2.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fern__0_6_1",
        url = "https://crates.io/api/v1/crates/fern/0.6.1/download",
        type = "tar.gz",
        sha256 = "3bdd7b0849075e79ee9a1836df22c717d1eba30451796fdc631b04565dd11e2a",
        strip_prefix = "fern-0.6.1",
        build_file = Label("//third_party/cargo/remote:BUILD.fern-0.6.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fiat_crypto__0_1_17",
        url = "https://crates.io/api/v1/crates/fiat-crypto/0.1.17/download",
        type = "tar.gz",
        sha256 = "a214f5bb88731d436478f3ae1f8a277b62124089ba9fb67f4f93fb100ef73c90",
        strip_prefix = "fiat-crypto-0.1.17",
        build_file = Label("//third_party/cargo/remote:BUILD.fiat-crypto-0.1.17.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__filetime__0_2_19",
        url = "https://crates.io/api/v1/crates/filetime/0.2.19/download",
        type = "tar.gz",
        sha256 = "4e884668cd0c7480504233e951174ddc3b382f7c2666e3b7310b5c4e7b0c37f9",
        strip_prefix = "filetime-0.2.19",
        build_file = Label("//third_party/cargo/remote:BUILD.filetime-0.2.19.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__find_crate__0_6_3",
        url = "https://crates.io/api/v1/crates/find-crate/0.6.3/download",
        type = "tar.gz",
        sha256 = "59a98bbaacea1c0eb6a0876280051b892eb73594fd90cf3b20e9c817029c57d2",
        strip_prefix = "find-crate-0.6.3",
        build_file = Label("//third_party/cargo/remote:BUILD.find-crate-0.6.3.bazel"),
    )

    maybe(
        new_git_repository,
        name = "raze__flat_tree__5_0_0",
        remote = "https://github.com/ttiurani/flat-tree",
        commit = "3c669d8c70ac42c5dfc5fa0ea46b9ec2a203a5e0",
        build_file = Label("//third_party/cargo/remote:BUILD.flat-tree-5.0.0.bazel"),
        init_submodules = True,
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
        name = "raze__flate2__1_0_25",
        url = "https://crates.io/api/v1/crates/flate2/1.0.25/download",
        type = "tar.gz",
        sha256 = "a8a2db397cb1c8772f31494cb8917e48cd1e64f0fa7efac59fbd741a0a8ce841",
        strip_prefix = "flate2-1.0.25",
        build_file = Label("//third_party/cargo/remote:BUILD.flate2-1.0.25.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fluent__0_16_0",
        url = "https://crates.io/api/v1/crates/fluent/0.16.0/download",
        type = "tar.gz",
        sha256 = "61f69378194459db76abd2ce3952b790db103ceb003008d3d50d97c41ff847a7",
        strip_prefix = "fluent-0.16.0",
        build_file = Label("//third_party/cargo/remote:BUILD.fluent-0.16.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fluent_bundle__0_15_2",
        url = "https://crates.io/api/v1/crates/fluent-bundle/0.15.2/download",
        type = "tar.gz",
        sha256 = "e242c601dec9711505f6d5bbff5bedd4b61b2469f2e8bb8e57ee7c9747a87ffd",
        strip_prefix = "fluent-bundle-0.15.2",
        build_file = Label("//third_party/cargo/remote:BUILD.fluent-bundle-0.15.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fluent_langneg__0_13_0",
        url = "https://crates.io/api/v1/crates/fluent-langneg/0.13.0/download",
        type = "tar.gz",
        sha256 = "2c4ad0989667548f06ccd0e306ed56b61bd4d35458d54df5ec7587c0e8ed5e94",
        strip_prefix = "fluent-langneg-0.13.0",
        build_file = Label("//third_party/cargo/remote:BUILD.fluent-langneg-0.13.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__fluent_syntax__0_11_0",
        url = "https://crates.io/api/v1/crates/fluent-syntax/0.11.0/download",
        type = "tar.gz",
        sha256 = "c0abed97648395c902868fee9026de96483933faa54ea3b40d652f7dfe61ca78",
        strip_prefix = "fluent-syntax-0.11.0",
        build_file = Label("//third_party/cargo/remote:BUILD.fluent-syntax-0.11.0.bazel"),
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
        name = "raze__form_urlencoded__1_1_0",
        url = "https://crates.io/api/v1/crates/form_urlencoded/1.1.0/download",
        type = "tar.gz",
        sha256 = "a9c384f161156f5260c24a097c56119f9be8c798586aecc13afbcbe7b7e26bf8",
        strip_prefix = "form_urlencoded-1.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.form_urlencoded-1.1.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures__0_3_26",
        url = "https://crates.io/api/v1/crates/futures/0.3.26/download",
        type = "tar.gz",
        sha256 = "13e2792b0ff0340399d58445b88fd9770e3489eff258a4cbc1523418f12abf84",
        strip_prefix = "futures-0.3.26",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-0.3.26.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_channel__0_3_26",
        url = "https://crates.io/api/v1/crates/futures-channel/0.3.26/download",
        type = "tar.gz",
        sha256 = "2e5317663a9089767a1ec00a487df42e0ca174b61b4483213ac24448e4664df5",
        strip_prefix = "futures-channel-0.3.26",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-channel-0.3.26.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_core__0_3_26",
        url = "https://crates.io/api/v1/crates/futures-core/0.3.26/download",
        type = "tar.gz",
        sha256 = "ec90ff4d0fe1f57d600049061dc6bb68ed03c7d2fbd697274c41805dcb3f8608",
        strip_prefix = "futures-core-0.3.26",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-core-0.3.26.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_executor__0_3_26",
        url = "https://crates.io/api/v1/crates/futures-executor/0.3.26/download",
        type = "tar.gz",
        sha256 = "e8de0a35a6ab97ec8869e32a2473f4b1324459e14c29275d14b10cb1fd19b50e",
        strip_prefix = "futures-executor-0.3.26",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-executor-0.3.26.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_io__0_3_26",
        url = "https://crates.io/api/v1/crates/futures-io/0.3.26/download",
        type = "tar.gz",
        sha256 = "bfb8371b6fb2aeb2d280374607aeabfc99d95c72edfe51692e42d3d7f0d08531",
        strip_prefix = "futures-io-0.3.26",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-io-0.3.26.bazel"),
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
        name = "raze__futures_macro__0_3_26",
        url = "https://crates.io/api/v1/crates/futures-macro/0.3.26/download",
        type = "tar.gz",
        sha256 = "95a73af87da33b5acf53acfebdc339fe592ecf5357ac7c0a7734ab9d8c876a70",
        strip_prefix = "futures-macro-0.3.26",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-macro-0.3.26.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_sink__0_3_26",
        url = "https://crates.io/api/v1/crates/futures-sink/0.3.26/download",
        type = "tar.gz",
        sha256 = "f310820bb3e8cfd46c80db4d7fb8353e15dfff853a127158425f31e0be6c8364",
        strip_prefix = "futures-sink-0.3.26",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-sink-0.3.26.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__futures_task__0_3_26",
        url = "https://crates.io/api/v1/crates/futures-task/0.3.26/download",
        type = "tar.gz",
        sha256 = "dcf79a1bf610b10f42aea489289c5a2c478a786509693b80cd39c44ccd936366",
        strip_prefix = "futures-task-0.3.26",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-task-0.3.26.bazel"),
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
        name = "raze__futures_util__0_3_26",
        url = "https://crates.io/api/v1/crates/futures-util/0.3.26/download",
        type = "tar.gz",
        sha256 = "9c1d6de3acfef38d2be4b1f543f553131788603495be83da675e180c8d6b7bd1",
        strip_prefix = "futures-util-0.3.26",
        build_file = Label("//third_party/cargo/remote:BUILD.futures-util-0.3.26.bazel"),
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
        name = "raze__generic_array__0_14_6",
        url = "https://crates.io/api/v1/crates/generic-array/0.14.6/download",
        type = "tar.gz",
        sha256 = "bff49e947297f3312447abdca79f45f4738097cc82b06e72054d2223f601f1b9",
        strip_prefix = "generic-array-0.14.6",
        build_file = Label("//third_party/cargo/remote:BUILD.generic-array-0.14.6.bazel"),
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
        name = "raze__getrandom__0_2_8",
        url = "https://crates.io/api/v1/crates/getrandom/0.2.8/download",
        type = "tar.gz",
        sha256 = "c05aeb6a22b8f62540c194aac980f2115af067bfe15a0734d7277a768d396b31",
        strip_prefix = "getrandom-0.2.8",
        build_file = Label("//third_party/cargo/remote:BUILD.getrandom-0.2.8.bazel"),
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
        name = "raze__gimli__0_27_1",
        url = "https://crates.io/api/v1/crates/gimli/0.27.1/download",
        type = "tar.gz",
        sha256 = "221996f774192f0f718773def8201c4ae31f02616a54ccfc2d358bb0e5cefdec",
        strip_prefix = "gimli-0.27.1",
        build_file = Label("//third_party/cargo/remote:BUILD.gimli-0.27.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__glob__0_3_1",
        url = "https://crates.io/api/v1/crates/glob/0.3.1/download",
        type = "tar.gz",
        sha256 = "d2fabcfbdc87f4758337ca535fb41a6d701b65693ce38287d856d1674551ec9b",
        strip_prefix = "glob-0.3.1",
        build_file = Label("//third_party/cargo/remote:BUILD.glob-0.3.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__gloo_timers__0_2_6",
        url = "https://crates.io/api/v1/crates/gloo-timers/0.2.6/download",
        type = "tar.gz",
        sha256 = "9b995a66bb87bebce9a0f4a95aed01daca4872c050bfcb21653361c03bc35e5c",
        strip_prefix = "gloo-timers-0.2.6",
        build_file = Label("//third_party/cargo/remote:BUILD.gloo-timers-0.2.6.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__hashbrown__0_12_3",
        url = "https://crates.io/api/v1/crates/hashbrown/0.12.3/download",
        type = "tar.gz",
        sha256 = "8a9ee70c43aaf417c914396645a0fa852624801b24ebb7ae78fe8272889ac888",
        strip_prefix = "hashbrown-0.12.3",
        build_file = Label("//third_party/cargo/remote:BUILD.hashbrown-0.12.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__heck__0_4_0",
        url = "https://crates.io/api/v1/crates/heck/0.4.0/download",
        type = "tar.gz",
        sha256 = "2540771e65fc8cb83cd6e8a237f70c319bd5c29f78ed1084ba5d50eeac86f7f9",
        strip_prefix = "heck-0.4.0",
        build_file = Label("//third_party/cargo/remote:BUILD.heck-0.4.0.bazel"),
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
        name = "raze__hermit_abi__0_2_6",
        url = "https://crates.io/api/v1/crates/hermit-abi/0.2.6/download",
        type = "tar.gz",
        sha256 = "ee512640fe35acbfb4bb779db6f0d80704c2cacfa2e39b601ef3e3f47d1ae4c7",
        strip_prefix = "hermit-abi-0.2.6",
        build_file = Label("//third_party/cargo/remote:BUILD.hermit-abi-0.2.6.bazel"),
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
        name = "raze__hkdf__0_12_3",
        url = "https://crates.io/api/v1/crates/hkdf/0.12.3/download",
        type = "tar.gz",
        sha256 = "791a029f6b9fc27657f6f188ec6e5e43f6911f6f878e0dc5501396e09809d437",
        strip_prefix = "hkdf-0.12.3",
        build_file = Label("//third_party/cargo/remote:BUILD.hkdf-0.12.3.bazel"),
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
        name = "raze__hmac__0_12_1",
        url = "https://crates.io/api/v1/crates/hmac/0.12.1/download",
        type = "tar.gz",
        sha256 = "6c49c37c09c17a53d937dfbb742eb3a961d65a994e6bcdcf37e7399d0cc8ab5e",
        strip_prefix = "hmac-0.12.1",
        build_file = Label("//third_party/cargo/remote:BUILD.hmac-0.12.1.bazel"),
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
        name = "raze__hostname__0_3_1",
        url = "https://crates.io/api/v1/crates/hostname/0.3.1/download",
        type = "tar.gz",
        sha256 = "3c731c3e10504cc8ed35cfe2f1db4c9274c3d35fa486e3b31df46f068ef3e867",
        strip_prefix = "hostname-0.3.1",
        build_file = Label("//third_party/cargo/remote:BUILD.hostname-0.3.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__html_escape__0_2_13",
        url = "https://crates.io/api/v1/crates/html-escape/0.2.13/download",
        type = "tar.gz",
        sha256 = "6d1ad449764d627e22bfd7cd5e8868264fc9236e07c752972b4080cd351cb476",
        strip_prefix = "html-escape-0.2.13",
        build_file = Label("//third_party/cargo/remote:BUILD.html-escape-0.2.13.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__http__0_2_8",
        url = "https://crates.io/api/v1/crates/http/0.2.8/download",
        type = "tar.gz",
        sha256 = "75f43d41e26995c17e71ee126451dd3941010b0514a81a9d11f3b341debc2399",
        strip_prefix = "http-0.2.8",
        build_file = Label("//third_party/cargo/remote:BUILD.http-0.2.8.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__http_client__6_5_3",
        url = "https://crates.io/api/v1/crates/http-client/6.5.3/download",
        type = "tar.gz",
        sha256 = "1947510dc91e2bf586ea5ffb412caad7673264e14bb39fb9078da114a94ce1a5",
        strip_prefix = "http-client-6.5.3",
        build_file = Label("//third_party/cargo/remote:BUILD.http-client-6.5.3.bazel"),
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
        name = "raze__httparse__1_8_0",
        url = "https://crates.io/api/v1/crates/httparse/1.8.0/download",
        type = "tar.gz",
        sha256 = "d897f394bad6a705d5f4104762e116a75639e470d80901eed05a860a95cb1904",
        strip_prefix = "httparse-1.8.0",
        build_file = Label("//third_party/cargo/remote:BUILD.httparse-1.8.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__httpdate__1_0_2",
        url = "https://crates.io/api/v1/crates/httpdate/1.0.2/download",
        type = "tar.gz",
        sha256 = "c4a1e36c821dbe04574f602848a19f742f4fb3c98d40449f11bcad18d6b17421",
        strip_prefix = "httpdate-1.0.2",
        build_file = Label("//third_party/cargo/remote:BUILD.httpdate-1.0.2.bazel"),
    )

    maybe(
        new_git_repository,
        name = "raze__hypercore__0_11_1_beta_10",
        remote = "https://github.com/ttiurani/hypercore",
        commit = "d7a1210b81e7a3ffd70d708023d5d586e393d5df",
        build_file = Label("//third_party/cargo/remote:BUILD.hypercore-0.11.1-beta.10.bazel"),
        init_submodules = True,
    )

    maybe(
        new_git_repository,
        name = "raze__hypercore_protocol__0_3_1",
        remote = "https://github.com/ttiurani/hypercore-protocol-rs",
        commit = "fcd16f10815be5cfaad3a389247dcc248d1bbcc4",
        build_file = Label("//third_party/cargo/remote:BUILD.hypercore-protocol-0.3.1.bazel"),
        init_submodules = True,
    )

    maybe(
        http_archive,
        name = "raze__i18n_config__0_4_3",
        url = "https://crates.io/api/v1/crates/i18n-config/0.4.3/download",
        type = "tar.gz",
        sha256 = "3d9f93ceee6543011739bc81699b5e0cf1f23f3a80364649b6d80de8636bc8df",
        strip_prefix = "i18n-config-0.4.3",
        build_file = Label("//third_party/cargo/remote:BUILD.i18n-config-0.4.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__i18n_embed__0_13_8",
        url = "https://crates.io/api/v1/crates/i18n-embed/0.13.8/download",
        type = "tar.gz",
        sha256 = "2653dd1a8be0726315603f1c180b29f90e5b2a58f8b943d949d5170d9ad81101",
        strip_prefix = "i18n-embed-0.13.8",
        build_file = Label("//third_party/cargo/remote:BUILD.i18n-embed-0.13.8.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__i18n_embed_fl__0_6_5",
        url = "https://crates.io/api/v1/crates/i18n-embed-fl/0.6.5/download",
        type = "tar.gz",
        sha256 = "a425b9bbdc2e4cd797a2a79528662cb61894bd36db582e48da2c56c28eb727cd",
        strip_prefix = "i18n-embed-fl-0.6.5",
        build_file = Label("//third_party/cargo/remote:BUILD.i18n-embed-fl-0.6.5.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__i18n_embed_impl__0_8_0",
        url = "https://crates.io/api/v1/crates/i18n-embed-impl/0.8.0/download",
        type = "tar.gz",
        sha256 = "0db2330e035808eb064afb67e6743ddce353763af3e0f2bdfc2476e00ce76136",
        strip_prefix = "i18n-embed-impl-0.8.0",
        build_file = Label("//third_party/cargo/remote:BUILD.i18n-embed-impl-0.8.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__iana_time_zone__0_1_53",
        url = "https://crates.io/api/v1/crates/iana-time-zone/0.1.53/download",
        type = "tar.gz",
        sha256 = "64c122667b287044802d6ce17ee2ddf13207ed924c712de9a66a5814d5b64765",
        strip_prefix = "iana-time-zone-0.1.53",
        build_file = Label("//third_party/cargo/remote:BUILD.iana-time-zone-0.1.53.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__iana_time_zone_haiku__0_1_1",
        url = "https://crates.io/api/v1/crates/iana-time-zone-haiku/0.1.1/download",
        type = "tar.gz",
        sha256 = "0703ae284fc167426161c2e3f1da3ea71d94b21bedbcc9494e92b28e334e3dca",
        strip_prefix = "iana-time-zone-haiku-0.1.1",
        build_file = Label("//third_party/cargo/remote:BUILD.iana-time-zone-haiku-0.1.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__idna__0_3_0",
        url = "https://crates.io/api/v1/crates/idna/0.3.0/download",
        type = "tar.gz",
        sha256 = "e14ddfc70884202db2244c223200c204c2bda1bc6e0998d11b5e024d657209e6",
        strip_prefix = "idna-0.3.0",
        build_file = Label("//third_party/cargo/remote:BUILD.idna-0.3.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__indexmap__1_9_2",
        url = "https://crates.io/api/v1/crates/indexmap/1.9.2/download",
        type = "tar.gz",
        sha256 = "1885e79c1fc4b10f0e172c475f458b7f7b93061064d98c3293e98c5ba0c8b399",
        strip_prefix = "indexmap-1.9.2",
        build_file = Label("//third_party/cargo/remote:BUILD.indexmap-1.9.2.bazel"),
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
        name = "raze__inout__0_1_3",
        url = "https://crates.io/api/v1/crates/inout/0.1.3/download",
        type = "tar.gz",
        sha256 = "a0c10553d664a4d0bcff9f4215d0aac67a639cc68ef660840afe309b807bc9f5",
        strip_prefix = "inout-0.1.3",
        build_file = Label("//third_party/cargo/remote:BUILD.inout-0.1.3.bazel"),
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
        name = "raze__intl_memoizer__0_5_1",
        url = "https://crates.io/api/v1/crates/intl-memoizer/0.5.1/download",
        type = "tar.gz",
        sha256 = "c310433e4a310918d6ed9243542a6b83ec1183df95dff8f23f87bb88a264a66f",
        strip_prefix = "intl-memoizer-0.5.1",
        build_file = Label("//third_party/cargo/remote:BUILD.intl-memoizer-0.5.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__intl_pluralrules__7_0_2",
        url = "https://crates.io/api/v1/crates/intl_pluralrules/7.0.2/download",
        type = "tar.gz",
        sha256 = "078ea7b7c29a2b4df841a7f6ac8775ff6074020c6776d48491ce2268e068f972",
        strip_prefix = "intl_pluralrules-7.0.2",
        build_file = Label("//third_party/cargo/remote:BUILD.intl_pluralrules-7.0.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__intmap__2_0_0",
        url = "https://crates.io/api/v1/crates/intmap/2.0.0/download",
        type = "tar.gz",
        sha256 = "ee87fd093563344074bacf24faa0bb0227fb6969fb223e922db798516de924d6",
        strip_prefix = "intmap-2.0.0",
        build_file = Label("//third_party/cargo/remote:BUILD.intmap-2.0.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__io_tee__0_1_1",
        url = "https://crates.io/api/v1/crates/io_tee/0.1.1/download",
        type = "tar.gz",
        sha256 = "4b3f7cef34251886990511df1c61443aa928499d598a9473929ab5a90a527304",
        strip_prefix = "io_tee-0.1.1",
        build_file = Label("//third_party/cargo/remote:BUILD.io_tee-0.1.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__itertools__0_10_5",
        url = "https://crates.io/api/v1/crates/itertools/0.10.5/download",
        type = "tar.gz",
        sha256 = "b0fd2260e829bddf4cb6ea802289de2f86d6a7a690192fbe91b3f46e0f2c8473",
        strip_prefix = "itertools-0.10.5",
        build_file = Label("//third_party/cargo/remote:BUILD.itertools-0.10.5.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__itoa__1_0_5",
        url = "https://crates.io/api/v1/crates/itoa/1.0.5/download",
        type = "tar.gz",
        sha256 = "fad582f4b9e86b6caa621cabeb0963332d92eea04729ab12892c2533951e6440",
        strip_prefix = "itoa-1.0.5",
        build_file = Label("//third_party/cargo/remote:BUILD.itoa-1.0.5.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__jni__0_19_0",
        url = "https://crates.io/api/v1/crates/jni/0.19.0/download",
        type = "tar.gz",
        sha256 = "c6df18c2e3db7e453d3c6ac5b3e9d5182664d28788126d39b91f2d1e22b017ec",
        strip_prefix = "jni-0.19.0",
        build_file = Label("//third_party/cargo/remote:BUILD.jni-0.19.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__jni_sys__0_3_0",
        url = "https://crates.io/api/v1/crates/jni-sys/0.3.0/download",
        type = "tar.gz",
        sha256 = "8eaf4bc02d17cbdd7ff4c7438cafcdf7fb9a4613313ad11b4f8fefe7d3fa0130",
        strip_prefix = "jni-sys-0.3.0",
        build_file = Label("//third_party/cargo/remote:BUILD.jni-sys-0.3.0.bazel"),
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
        name = "raze__lettre__0_10_2",
        url = "https://crates.io/api/v1/crates/lettre/0.10.2/download",
        type = "tar.gz",
        sha256 = "dd84a055407850bcf4791baa77cb4818d37cbb79ad4e60b9b659727b920d2c65",
        strip_prefix = "lettre-0.10.2",
        build_file = Label("//third_party/cargo/remote:BUILD.lettre-0.10.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__libc__0_2_139",
        url = "https://crates.io/api/v1/crates/libc/0.2.139/download",
        type = "tar.gz",
        sha256 = "201de327520df007757c1f0adce6e827fe8562fbc28bfd9c15571c66ca1f5f79",
        strip_prefix = "libc-0.2.139",
        build_file = Label("//third_party/cargo/remote:BUILD.libc-0.2.139.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__libm__0_1_4",
        url = "https://crates.io/api/v1/crates/libm/0.1.4/download",
        type = "tar.gz",
        sha256 = "7fc7aa29613bd6a620df431842069224d8bc9011086b1db4c0e0cd47fa03ec9a",
        strip_prefix = "libm-0.1.4",
        build_file = Label("//third_party/cargo/remote:BUILD.libm-0.1.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__libm__0_2_6",
        url = "https://crates.io/api/v1/crates/libm/0.2.6/download",
        type = "tar.gz",
        sha256 = "348108ab3fba42ec82ff6e9564fc4ca0247bdccdc68dd8af9764bbc79c3c8ffb",
        strip_prefix = "libm-0.2.6",
        build_file = Label("//third_party/cargo/remote:BUILD.libm-0.2.6.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__link_cplusplus__1_0_8",
        url = "https://crates.io/api/v1/crates/link-cplusplus/1.0.8/download",
        type = "tar.gz",
        sha256 = "ecd207c9c713c34f95a097a5b029ac2ce6010530c7b49d7fea24d977dede04f5",
        strip_prefix = "link-cplusplus-1.0.8",
        build_file = Label("//third_party/cargo/remote:BUILD.link-cplusplus-1.0.8.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__lock_api__0_4_9",
        url = "https://crates.io/api/v1/crates/lock_api/0.4.9/download",
        type = "tar.gz",
        sha256 = "435011366fe56583b16cf956f9df0095b405b82d76425bc8981c0e22e60ec4df",
        strip_prefix = "lock_api-0.4.9",
        build_file = Label("//third_party/cargo/remote:BUILD.lock_api-0.4.9.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__log__0_4_17",
        url = "https://crates.io/api/v1/crates/log/0.4.17/download",
        type = "tar.gz",
        sha256 = "abb12e687cfb44aa40f41fc3978ef76448f9b6038cad6aef4259d3c095a2382e",
        strip_prefix = "log-0.4.17",
        build_file = Label("//third_party/cargo/remote:BUILD.log-0.4.17.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__match_cfg__0_1_0",
        url = "https://crates.io/api/v1/crates/match_cfg/0.1.0/download",
        type = "tar.gz",
        sha256 = "ffbee8634e0d45d258acb448e7eaab3fce7a0a467395d4d9f228e3c1f01fb2e4",
        strip_prefix = "match_cfg-0.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.match_cfg-0.1.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__maybe_uninit__2_0_0",
        url = "https://crates.io/api/v1/crates/maybe-uninit/2.0.0/download",
        type = "tar.gz",
        sha256 = "60302e4db3a61da70c0cb7991976248362f30319e88850c487b9b95bbf059e00",
        strip_prefix = "maybe-uninit-2.0.0",
        build_file = Label("//third_party/cargo/remote:BUILD.maybe-uninit-2.0.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__memchr__2_5_0",
        url = "https://crates.io/api/v1/crates/memchr/2.5.0/download",
        type = "tar.gz",
        sha256 = "2dffe52ecf27772e601905b7522cb4ef790d2cc203488bbd0e2fe85fcb74566d",
        strip_prefix = "memchr-2.5.0",
        build_file = Label("//third_party/cargo/remote:BUILD.memchr-2.5.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__memoffset__0_5_6",
        url = "https://crates.io/api/v1/crates/memoffset/0.5.6/download",
        type = "tar.gz",
        sha256 = "043175f069eda7b85febe4a74abbaeff828d9f8b448515d3151a14a3542811aa",
        strip_prefix = "memoffset-0.5.6",
        build_file = Label("//third_party/cargo/remote:BUILD.memoffset-0.5.6.bazel"),
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
        name = "raze__mime__0_3_16",
        url = "https://crates.io/api/v1/crates/mime/0.3.16/download",
        type = "tar.gz",
        sha256 = "2a60c7ce501c71e03a9c9c0d35b861413ae925bd979cc7a4e30d060069aaac8d",
        strip_prefix = "mime-0.3.16",
        build_file = Label("//third_party/cargo/remote:BUILD.mime-0.3.16.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__minimal_lexical__0_2_1",
        url = "https://crates.io/api/v1/crates/minimal-lexical/0.2.1/download",
        type = "tar.gz",
        sha256 = "68354c5c6bd36d73ff3feceb05efa59b6acb7626617f4962be322a825e61f79a",
        strip_prefix = "minimal-lexical-0.2.1",
        build_file = Label("//third_party/cargo/remote:BUILD.minimal-lexical-0.2.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__miniz_oxide__0_6_2",
        url = "https://crates.io/api/v1/crates/miniz_oxide/0.6.2/download",
        type = "tar.gz",
        sha256 = "b275950c28b37e794e8c55d88aeb5e139d0ce23fdbbeda68f8d7174abdf9e8fa",
        strip_prefix = "miniz_oxide-0.6.2",
        build_file = Label("//third_party/cargo/remote:BUILD.miniz_oxide-0.6.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__mio__0_8_5",
        url = "https://crates.io/api/v1/crates/mio/0.8.5/download",
        type = "tar.gz",
        sha256 = "e5d732bc30207a6423068df043e3d02e0735b155ad7ce1a6f76fe2baa5b158de",
        strip_prefix = "mio-0.8.5",
        build_file = Label("//third_party/cargo/remote:BUILD.mio-0.8.5.bazel"),
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
        name = "raze__moka__0_8_6",
        url = "https://crates.io/api/v1/crates/moka/0.8.6/download",
        type = "tar.gz",
        sha256 = "975fa04238144061e7f8df9746b2e9cd93ef85881da5548d842a7c6a4b614415",
        strip_prefix = "moka-0.8.6",
        build_file = Label("//third_party/cargo/remote:BUILD.moka-0.8.6.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__nix__0_26_2",
        url = "https://crates.io/api/v1/crates/nix/0.26.2/download",
        type = "tar.gz",
        sha256 = "bfdda3d196821d6af13126e40375cdf7da646a96114af134d5f417a9a1dc8e1a",
        strip_prefix = "nix-0.26.2",
        build_file = Label("//third_party/cargo/remote:BUILD.nix-0.26.2.bazel"),
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
        name = "raze__nom__7_1_3",
        url = "https://crates.io/api/v1/crates/nom/7.1.3/download",
        type = "tar.gz",
        sha256 = "d273983c5a657a70a3e8f2a01329822f3b8c8172b73826411a55751e404a0a4a",
        strip_prefix = "nom-7.1.3",
        build_file = Label("//third_party/cargo/remote:BUILD.nom-7.1.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__num_bigint__0_4_3",
        url = "https://crates.io/api/v1/crates/num-bigint/0.4.3/download",
        type = "tar.gz",
        sha256 = "f93ab6289c7b344a8a9f60f88d80aa20032336fe78da341afc91c8a2341fc75f",
        strip_prefix = "num-bigint-0.4.3",
        build_file = Label("//third_party/cargo/remote:BUILD.num-bigint-0.4.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__num_bigint_dig__0_8_2",
        url = "https://crates.io/api/v1/crates/num-bigint-dig/0.8.2/download",
        type = "tar.gz",
        sha256 = "2399c9463abc5f909349d8aa9ba080e0b88b3ce2885389b60b993f39b1a56905",
        strip_prefix = "num-bigint-dig-0.8.2",
        build_file = Label("//third_party/cargo/remote:BUILD.num-bigint-dig-0.8.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__num_integer__0_1_45",
        url = "https://crates.io/api/v1/crates/num-integer/0.1.45/download",
        type = "tar.gz",
        sha256 = "225d3389fb3509a24c93f5c29eb6bde2586b98d9f016636dff58d7c6f7569cd9",
        strip_prefix = "num-integer-0.1.45",
        build_file = Label("//third_party/cargo/remote:BUILD.num-integer-0.1.45.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__num_iter__0_1_43",
        url = "https://crates.io/api/v1/crates/num-iter/0.1.43/download",
        type = "tar.gz",
        sha256 = "7d03e6c028c5dc5cac6e2dec0efda81fc887605bb3d884578bb6d6bf7514e252",
        strip_prefix = "num-iter-0.1.43",
        build_file = Label("//third_party/cargo/remote:BUILD.num-iter-0.1.43.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__num_traits__0_2_15",
        url = "https://crates.io/api/v1/crates/num-traits/0.2.15/download",
        type = "tar.gz",
        sha256 = "578ede34cf02f8924ab9447f50c28075b4d3e5b269972345e7e0372b38c6cdcd",
        strip_prefix = "num-traits-0.2.15",
        build_file = Label("//third_party/cargo/remote:BUILD.num-traits-0.2.15.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__num_cpus__1_15_0",
        url = "https://crates.io/api/v1/crates/num_cpus/1.15.0/download",
        type = "tar.gz",
        sha256 = "0fac9e2da13b5eb447a6ce3d392f23a29d8694bff781bf03a16cd9ac8697593b",
        strip_prefix = "num_cpus-1.15.0",
        build_file = Label("//third_party/cargo/remote:BUILD.num_cpus-1.15.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__object__0_30_3",
        url = "https://crates.io/api/v1/crates/object/0.30.3/download",
        type = "tar.gz",
        sha256 = "ea86265d3d3dcb6a27fc51bd29a4bf387fae9d2986b823079d4986af253eb439",
        strip_prefix = "object-0.30.3",
        build_file = Label("//third_party/cargo/remote:BUILD.object-0.30.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__oid_registry__0_4_0",
        url = "https://crates.io/api/v1/crates/oid-registry/0.4.0/download",
        type = "tar.gz",
        sha256 = "38e20717fa0541f39bd146692035c37bedfa532b3e5071b35761082407546b2a",
        strip_prefix = "oid-registry-0.4.0",
        build_file = Label("//third_party/cargo/remote:BUILD.oid-registry-0.4.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__once_cell__1_17_0",
        url = "https://crates.io/api/v1/crates/once_cell/1.17.0/download",
        type = "tar.gz",
        sha256 = "6f61fba1741ea2b3d6a1e3178721804bb716a68a6aeba1149b5d52e3d464ea66",
        strip_prefix = "once_cell-1.17.0",
        build_file = Label("//third_party/cargo/remote:BUILD.once_cell-1.17.0.bazel"),
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
        name = "raze__os_str_bytes__6_4_1",
        url = "https://crates.io/api/v1/crates/os_str_bytes/6.4.1/download",
        type = "tar.gz",
        sha256 = "9b7820b9daea5457c9f21c69448905d723fbd21136ccf521748f23fd49e723ee",
        strip_prefix = "os_str_bytes-6.4.1",
        build_file = Label("//third_party/cargo/remote:BUILD.os_str_bytes-6.4.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__packed_simd_2__0_3_8",
        url = "https://crates.io/api/v1/crates/packed_simd_2/0.3.8/download",
        type = "tar.gz",
        sha256 = "a1914cd452d8fccd6f9db48147b29fd4ae05bea9dc5d9ad578509f72415de282",
        strip_prefix = "packed_simd_2-0.3.8",
        build_file = Label("//third_party/cargo/remote:BUILD.packed_simd_2-0.3.8.bazel"),
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
        name = "raze__parking_lot__0_12_1",
        url = "https://crates.io/api/v1/crates/parking_lot/0.12.1/download",
        type = "tar.gz",
        sha256 = "3742b2c103b9f06bc9fff0a37ff4912935851bee6d36f3c02bcc755bcfec228f",
        strip_prefix = "parking_lot-0.12.1",
        build_file = Label("//third_party/cargo/remote:BUILD.parking_lot-0.12.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__parking_lot_core__0_9_6",
        url = "https://crates.io/api/v1/crates/parking_lot_core/0.9.6/download",
        type = "tar.gz",
        sha256 = "ba1ef8814b5c993410bb3adfad7a5ed269563e4a2f90c41f5d85be7fb47133bf",
        strip_prefix = "parking_lot_core-0.9.6",
        build_file = Label("//third_party/cargo/remote:BUILD.parking_lot_core-0.9.6.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pbkdf2__0_11_0",
        url = "https://crates.io/api/v1/crates/pbkdf2/0.11.0/download",
        type = "tar.gz",
        sha256 = "83a0692ec44e4cf1ef28ca317f14f8f07da2d95ec3fa01f86e4467b725e60917",
        strip_prefix = "pbkdf2-0.11.0",
        build_file = Label("//third_party/cargo/remote:BUILD.pbkdf2-0.11.0.bazel"),
    )

    maybe(
        new_git_repository,
        name = "raze__peermerge__0_0_1",
        remote = "https://github.com/extendedmind/peermerge.git",
        commit = "6d3e20e929b3d2573a6276818daf06f6579e1a15",
        build_file = Label("//third_party/cargo/remote:BUILD.peermerge-0.0.1.bazel"),
        init_submodules = True,
    )

    maybe(
        http_archive,
        name = "raze__pem__1_1_1",
        url = "https://crates.io/api/v1/crates/pem/1.1.1/download",
        type = "tar.gz",
        sha256 = "a8835c273a76a90455d7344889b0964598e3316e2a79ede8e36f16bdcf2228b8",
        strip_prefix = "pem-1.1.1",
        build_file = Label("//third_party/cargo/remote:BUILD.pem-1.1.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__percent_encoding__2_2_0",
        url = "https://crates.io/api/v1/crates/percent-encoding/2.2.0/download",
        type = "tar.gz",
        sha256 = "478c572c3d73181ff3c2539045f6eb99e5491218eae919370993b890cdbdd98e",
        strip_prefix = "percent-encoding-2.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.percent-encoding-2.2.0.bazel"),
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
        name = "raze__phf__0_11_1",
        url = "https://crates.io/api/v1/crates/phf/0.11.1/download",
        type = "tar.gz",
        sha256 = "928c6535de93548188ef63bb7c4036bd415cd8f36ad25af44b9789b2ee72a48c",
        strip_prefix = "phf-0.11.1",
        build_file = Label("//third_party/cargo/remote:BUILD.phf-0.11.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__phf_shared__0_11_1",
        url = "https://crates.io/api/v1/crates/phf_shared/0.11.1/download",
        type = "tar.gz",
        sha256 = "e1fb5f6f826b772a8d4c0394209441e7d37cbbb967ae9c7e0e8134365c9ee676",
        strip_prefix = "phf_shared-0.11.1",
        build_file = Label("//third_party/cargo/remote:BUILD.phf_shared-0.11.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pin_project__1_0_12",
        url = "https://crates.io/api/v1/crates/pin-project/1.0.12/download",
        type = "tar.gz",
        sha256 = "ad29a609b6bcd67fee905812e544992d216af9d755757c05ed2d0e15a74c6ecc",
        strip_prefix = "pin-project-1.0.12",
        build_file = Label("//third_party/cargo/remote:BUILD.pin-project-1.0.12.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pin_project_internal__1_0_12",
        url = "https://crates.io/api/v1/crates/pin-project-internal/1.0.12/download",
        type = "tar.gz",
        sha256 = "069bdb1e05adc7a8990dce9cc75370895fbe4e3d58b9b73bf1aee56359344a55",
        strip_prefix = "pin-project-internal-1.0.12",
        build_file = Label("//third_party/cargo/remote:BUILD.pin-project-internal-1.0.12.bazel"),
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
        name = "raze__pin_project_lite__0_2_9",
        url = "https://crates.io/api/v1/crates/pin-project-lite/0.2.9/download",
        type = "tar.gz",
        sha256 = "e0a7ae3ac2f1173085d398531c705756c94a4c56843785df85a60c1a0afac116",
        strip_prefix = "pin-project-lite-0.2.9",
        build_file = Label("//third_party/cargo/remote:BUILD.pin-project-lite-0.2.9.bazel"),
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
        name = "raze__pinentry__0_5_0",
        url = "https://crates.io/api/v1/crates/pinentry/0.5.0/download",
        type = "tar.gz",
        sha256 = "bfa5b8bc68be6a5e2ba84ee86db53f816cba1905b94fcb7c236e606221cc8fc8",
        strip_prefix = "pinentry-0.5.0",
        build_file = Label("//third_party/cargo/remote:BUILD.pinentry-0.5.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pkcs1__0_4_1",
        url = "https://crates.io/api/v1/crates/pkcs1/0.4.1/download",
        type = "tar.gz",
        sha256 = "eff33bdbdfc54cc98a2eca766ebdec3e1b8fb7387523d5c9c9a2891da856f719",
        strip_prefix = "pkcs1-0.4.1",
        build_file = Label("//third_party/cargo/remote:BUILD.pkcs1-0.4.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pkcs8__0_9_0",
        url = "https://crates.io/api/v1/crates/pkcs8/0.9.0/download",
        type = "tar.gz",
        sha256 = "9eca2c590a5f85da82668fa685c09ce2888b9430e83299debf1f34b65fd4a4ba",
        strip_prefix = "pkcs8-0.9.0",
        build_file = Label("//third_party/cargo/remote:BUILD.pkcs8-0.9.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__platforms__3_0_2",
        url = "https://crates.io/api/v1/crates/platforms/3.0.2/download",
        type = "tar.gz",
        sha256 = "e3d7ddaed09e0eb771a79ab0fd64609ba0afb0a8366421957936ad14cbd13630",
        strip_prefix = "platforms-3.0.2",
        build_file = Label("//third_party/cargo/remote:BUILD.platforms-3.0.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__polling__2_5_2",
        url = "https://crates.io/api/v1/crates/polling/2.5.2/download",
        type = "tar.gz",
        sha256 = "22122d5ec4f9fe1b3916419b76be1e80bcb93f618d071d2edf841b137b2a2bd6",
        strip_prefix = "polling-2.5.2",
        build_file = Label("//third_party/cargo/remote:BUILD.polling-2.5.2.bazel"),
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
        name = "raze__poly1305__0_8_0",
        url = "https://crates.io/api/v1/crates/poly1305/0.8.0/download",
        type = "tar.gz",
        sha256 = "8159bd90725d2df49889a078b54f4f79e87f1f8a8444194cdca81d38f5393abf",
        strip_prefix = "poly1305-0.8.0",
        build_file = Label("//third_party/cargo/remote:BUILD.poly1305-0.8.0.bazel"),
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
        name = "raze__ppv_lite86__0_2_17",
        url = "https://crates.io/api/v1/crates/ppv-lite86/0.2.17/download",
        type = "tar.gz",
        sha256 = "5b40af805b3121feab8a3c29f04d8ad262fa8e0561883e7653e024ae4479e6de",
        strip_prefix = "ppv-lite86-0.2.17",
        build_file = Label("//third_party/cargo/remote:BUILD.ppv-lite86-0.2.17.bazel"),
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
        name = "raze__proc_macro_hack__0_5_20_deprecated",
        url = "https://crates.io/api/v1/crates/proc-macro-hack/0.5.20+deprecated/download",
        type = "tar.gz",
        sha256 = "dc375e1527247fe1a97d8b7156678dfe7c1af2fc075c9a4db3690ecd2a148068",
        strip_prefix = "proc-macro-hack-0.5.20+deprecated",
        build_file = Label("//third_party/cargo/remote:BUILD.proc-macro-hack-0.5.20+deprecated.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__proc_macro2__1_0_50",
        url = "https://crates.io/api/v1/crates/proc-macro2/1.0.50/download",
        type = "tar.gz",
        sha256 = "6ef7d57beacfaf2d8aee5937dab7b7f28de3cb8b1828479bb5de2a7106f2bae2",
        strip_prefix = "proc-macro2-1.0.50",
        build_file = Label("//third_party/cargo/remote:BUILD.proc-macro2-1.0.50.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__pulldown_cmark__0_9_2",
        url = "https://crates.io/api/v1/crates/pulldown-cmark/0.9.2/download",
        type = "tar.gz",
        sha256 = "2d9cc634bc78768157b5cbfe988ffcd1dcba95cd2b2f03a88316c08c6d00ed63",
        strip_prefix = "pulldown-cmark-0.9.2",
        build_file = Label("//third_party/cargo/remote:BUILD.pulldown-cmark-0.9.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__quote__1_0_23",
        url = "https://crates.io/api/v1/crates/quote/1.0.23/download",
        type = "tar.gz",
        sha256 = "8856d8364d252a14d474036ea1358d63c9e6965c8e5c1885c18f73d70bff9c7b",
        strip_prefix = "quote-1.0.23",
        build_file = Label("//third_party/cargo/remote:BUILD.quote-1.0.23.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__quoted_printable__0_4_6",
        url = "https://crates.io/api/v1/crates/quoted_printable/0.4.6/download",
        type = "tar.gz",
        sha256 = "20f14e071918cbeefc5edc986a7aa92c425dae244e003a35e1cdddb5ca39b5cb",
        strip_prefix = "quoted_printable-0.4.6",
        build_file = Label("//third_party/cargo/remote:BUILD.quoted_printable-0.4.6.bazel"),
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
        name = "raze__rand__0_8_5",
        url = "https://crates.io/api/v1/crates/rand/0.8.5/download",
        type = "tar.gz",
        sha256 = "34af8d1a0e25924bc5b7c43c079c942339d8f0a8b57c39049bef581b46327404",
        strip_prefix = "rand-0.8.5",
        build_file = Label("//third_party/cargo/remote:BUILD.rand-0.8.5.bazel"),
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
        name = "raze__rand_core__0_6_4",
        url = "https://crates.io/api/v1/crates/rand_core/0.6.4/download",
        type = "tar.gz",
        sha256 = "ec0be4795e2f6a28069bec0b5ff3e2ac9bafc99e6a9a7dc3547996c5c816922c",
        strip_prefix = "rand_core-0.6.4",
        build_file = Label("//third_party/cargo/remote:BUILD.rand_core-0.6.4.bazel"),
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
        new_git_repository,
        name = "raze__random_access_disk__2_0_0",
        remote = "https://github.com/ttiurani/random-access-disk",
        commit = "30441f636725309a29b03bed76a9616e1ee06c18",
        build_file = Label("//third_party/cargo/remote:BUILD.random-access-disk-2.0.0.bazel"),
        init_submodules = True,
    )

    maybe(
        new_git_repository,
        name = "raze__random_access_memory__2_0_0",
        remote = "https://github.com/ttiurani/random-access-memory",
        commit = "b73a3c653e99a1b3b97a28f87446f35d57ce5816",
        build_file = Label("//third_party/cargo/remote:BUILD.random-access-memory-2.0.0.bazel"),
        init_submodules = True,
    )

    maybe(
        new_git_repository,
        name = "raze__random_access_storage__4_0_0",
        remote = "https://github.com/ttiurani/random-access-storage",
        commit = "89f442ae2063b975e626eb88e154a1391dfb4ff6",
        build_file = Label("//third_party/cargo/remote:BUILD.random-access-storage-4.0.0.bazel"),
        init_submodules = True,
    )

    maybe(
        http_archive,
        name = "raze__rcgen__0_9_3",
        url = "https://crates.io/api/v1/crates/rcgen/0.9.3/download",
        type = "tar.gz",
        sha256 = "6413f3de1edee53342e6138e75b56d32e7bc6e332b3bd62d497b1929d4cfbcdd",
        strip_prefix = "rcgen-0.9.3",
        build_file = Label("//third_party/cargo/remote:BUILD.rcgen-0.9.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__redox_syscall__0_2_16",
        url = "https://crates.io/api/v1/crates/redox_syscall/0.2.16/download",
        type = "tar.gz",
        sha256 = "fb5a58c1855b4b6819d59012155603f0b22ad30cad752600aadfcb695265519a",
        strip_prefix = "redox_syscall-0.2.16",
        build_file = Label("//third_party/cargo/remote:BUILD.redox_syscall-0.2.16.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__regex__1_7_1",
        url = "https://crates.io/api/v1/crates/regex/1.7.1/download",
        type = "tar.gz",
        sha256 = "48aaa5748ba571fb95cd2c85c09f629215d3a6ece942baa100950af03a34f733",
        strip_prefix = "regex-1.7.1",
        build_file = Label("//third_party/cargo/remote:BUILD.regex-1.7.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__regex_syntax__0_6_28",
        url = "https://crates.io/api/v1/crates/regex-syntax/0.6.28/download",
        type = "tar.gz",
        sha256 = "456c603be3e8d448b072f410900c09faf164fbce2d480456f50eea6e25f9c848",
        strip_prefix = "regex-syntax-0.6.28",
        build_file = Label("//third_party/cargo/remote:BUILD.regex-syntax-0.6.28.bazel"),
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
        name = "raze__ring__0_16_20",
        url = "https://crates.io/api/v1/crates/ring/0.16.20/download",
        type = "tar.gz",
        sha256 = "3053cf52e236a3ed746dfc745aa9cacf1b791d846bdaf412f60a8d7d6e17c8fc",
        strip_prefix = "ring-0.16.20",
        build_file = Label("//third_party/cargo/remote:BUILD.ring-0.16.20.bazel"),
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
        name = "raze__rpassword__6_0_1",
        url = "https://crates.io/api/v1/crates/rpassword/6.0.1/download",
        type = "tar.gz",
        sha256 = "2bf099a1888612545b683d2661a1940089f6c2e5a8e38979b2159da876bfd956",
        strip_prefix = "rpassword-6.0.1",
        build_file = Label("//third_party/cargo/remote:BUILD.rpassword-6.0.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rsa__0_7_2",
        url = "https://crates.io/api/v1/crates/rsa/0.7.2/download",
        type = "tar.gz",
        sha256 = "094052d5470cbcef561cb848a7209968c9f12dfa6d668f4bca048ac5de51099c",
        strip_prefix = "rsa-0.7.2",
        build_file = Label("//third_party/cargo/remote:BUILD.rsa-0.7.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rust_embed__6_4_2",
        url = "https://crates.io/api/v1/crates/rust-embed/6.4.2/download",
        type = "tar.gz",
        sha256 = "283ffe2f866869428c92e0d61c2f35dfb4355293cdfdc48f49e895c15f1333d1",
        strip_prefix = "rust-embed-6.4.2",
        build_file = Label("//third_party/cargo/remote:BUILD.rust-embed-6.4.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rust_embed_impl__6_3_1",
        url = "https://crates.io/api/v1/crates/rust-embed-impl/6.3.1/download",
        type = "tar.gz",
        sha256 = "31ab23d42d71fb9be1b643fe6765d292c5e14d46912d13f3ae2815ca048ea04d",
        strip_prefix = "rust-embed-impl-6.3.1",
        build_file = Label("//third_party/cargo/remote:BUILD.rust-embed-impl-6.3.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rust_embed_utils__7_3_0",
        url = "https://crates.io/api/v1/crates/rust-embed-utils/7.3.0/download",
        type = "tar.gz",
        sha256 = "c1669d81dfabd1b5f8e2856b8bbe146c6192b0ba22162edc738ac0a5de18f054",
        strip_prefix = "rust-embed-utils-7.3.0",
        build_file = Label("//third_party/cargo/remote:BUILD.rust-embed-utils-7.3.0.bazel"),
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
        name = "raze__rustc_hash__1_1_0",
        url = "https://crates.io/api/v1/crates/rustc-hash/1.1.0/download",
        type = "tar.gz",
        sha256 = "08d43f7aa6b08d49f382cde6a7982047c3426db949b1424bc4b7ec9ae12c6ce2",
        strip_prefix = "rustc-hash-1.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.rustc-hash-1.1.0.bazel"),
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
        name = "raze__rustc_version__0_4_0",
        url = "https://crates.io/api/v1/crates/rustc_version/0.4.0/download",
        type = "tar.gz",
        sha256 = "bfa0f585226d2e68097d4f95d113b15b83a82e819ab25717ec0590d9584ef366",
        strip_prefix = "rustc_version-0.4.0",
        build_file = Label("//third_party/cargo/remote:BUILD.rustc_version-0.4.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rusticata_macros__4_1_0",
        url = "https://crates.io/api/v1/crates/rusticata-macros/4.1.0/download",
        type = "tar.gz",
        sha256 = "faf0c4a6ece9950b9abdb62b1cfcf2a68b3b67a10ba445b3bb85be2a293d0632",
        strip_prefix = "rusticata-macros-4.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.rusticata-macros-4.1.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rustls__0_19_1",
        url = "https://crates.io/api/v1/crates/rustls/0.19.1/download",
        type = "tar.gz",
        sha256 = "35edb675feee39aec9c99fa5ff985081995a06d594114ae14cbe797ad7b7a6d7",
        strip_prefix = "rustls-0.19.1",
        build_file = Label("//third_party/cargo/remote:BUILD.rustls-0.19.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rustls__0_20_8",
        url = "https://crates.io/api/v1/crates/rustls/0.20.8/download",
        type = "tar.gz",
        sha256 = "fff78fc74d175294f4e83b28343315ffcfb114b156f0185e9741cb5570f50e2f",
        strip_prefix = "rustls-0.20.8",
        build_file = Label("//third_party/cargo/remote:BUILD.rustls-0.20.8.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rustls_acme__0_3_0",
        url = "https://crates.io/api/v1/crates/rustls-acme/0.3.0/download",
        type = "tar.gz",
        sha256 = "e3d8f660d5a6dcef78e731b359784844cf79388d33a5e91c430f8efedd976741",
        strip_prefix = "rustls-acme-0.3.0",
        build_file = Label("//third_party/cargo/remote:BUILD.rustls-acme-0.3.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__rustls_pemfile__1_0_2",
        url = "https://crates.io/api/v1/crates/rustls-pemfile/1.0.2/download",
        type = "tar.gz",
        sha256 = "d194b56d58803a43635bdc398cd17e383d6f71f9182b9a192c127ca42494a59b",
        strip_prefix = "rustls-pemfile-1.0.2",
        build_file = Label("//third_party/cargo/remote:BUILD.rustls-pemfile-1.0.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ryu__1_0_12",
        url = "https://crates.io/api/v1/crates/ryu/1.0.12/download",
        type = "tar.gz",
        sha256 = "7b4b9743ed687d4b4bcedf9ff5eaa7398495ae14e61cba0a295704edbc7decde",
        strip_prefix = "ryu-1.0.12",
        build_file = Label("//third_party/cargo/remote:BUILD.ryu-1.0.12.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__salsa20__0_10_2",
        url = "https://crates.io/api/v1/crates/salsa20/0.10.2/download",
        type = "tar.gz",
        sha256 = "97a22f5af31f73a954c10289c93e8a50cc23d971e80ee446f1f6f7137a088213",
        strip_prefix = "salsa20-0.10.2",
        build_file = Label("//third_party/cargo/remote:BUILD.salsa20-0.10.2.bazel"),
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
        name = "raze__same_file__1_0_6",
        url = "https://crates.io/api/v1/crates/same-file/1.0.6/download",
        type = "tar.gz",
        sha256 = "93fc1dc3aaa9bfed95e02e6eadabb4baf7e3078b0bd1b4d7b6b0b68378900502",
        strip_prefix = "same-file-1.0.6",
        build_file = Label("//third_party/cargo/remote:BUILD.same-file-1.0.6.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__scheduled_thread_pool__0_2_6",
        url = "https://crates.io/api/v1/crates/scheduled-thread-pool/0.2.6/download",
        type = "tar.gz",
        sha256 = "977a7519bff143a44f842fd07e80ad1329295bd71686457f18e496736f4bf9bf",
        strip_prefix = "scheduled-thread-pool-0.2.6",
        build_file = Label("//third_party/cargo/remote:BUILD.scheduled-thread-pool-0.2.6.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__scopeguard__1_1_0",
        url = "https://crates.io/api/v1/crates/scopeguard/1.1.0/download",
        type = "tar.gz",
        sha256 = "d29ab0c6d3fc0ee92fe66e2d99f700eab17a8d57d1c1d3b748380fb20baa78cd",
        strip_prefix = "scopeguard-1.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.scopeguard-1.1.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__scratch__1_0_3",
        url = "https://crates.io/api/v1/crates/scratch/1.0.3/download",
        type = "tar.gz",
        sha256 = "ddccb15bcce173023b3fedd9436f882a0739b8dfb45e4f6b6002bee5929f61b2",
        strip_prefix = "scratch-1.0.3",
        build_file = Label("//third_party/cargo/remote:BUILD.scratch-1.0.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__scrypt__0_10_0",
        url = "https://crates.io/api/v1/crates/scrypt/0.10.0/download",
        type = "tar.gz",
        sha256 = "9f9e24d2b632954ded8ab2ef9fea0a0c769ea56ea98bddbafbad22caeeadf45d",
        strip_prefix = "scrypt-0.10.0",
        build_file = Label("//third_party/cargo/remote:BUILD.scrypt-0.10.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sct__0_6_1",
        url = "https://crates.io/api/v1/crates/sct/0.6.1/download",
        type = "tar.gz",
        sha256 = "b362b83898e0e69f38515b82ee15aa80636befe47c3b6d3d89a911e78fc228ce",
        strip_prefix = "sct-0.6.1",
        build_file = Label("//third_party/cargo/remote:BUILD.sct-0.6.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sct__0_7_0",
        url = "https://crates.io/api/v1/crates/sct/0.7.0/download",
        type = "tar.gz",
        sha256 = "d53dcdb7c9f8158937a7981b48accfd39a43af418591a5d008c7b22b5e1b7ca4",
        strip_prefix = "sct-0.7.0",
        build_file = Label("//third_party/cargo/remote:BUILD.sct-0.7.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__secrecy__0_8_0",
        url = "https://crates.io/api/v1/crates/secrecy/0.8.0/download",
        type = "tar.gz",
        sha256 = "9bd1c54ea06cfd2f6b63219704de0b9b4f72dcc2b8fdef820be6cd799780e91e",
        strip_prefix = "secrecy-0.8.0",
        build_file = Label("//third_party/cargo/remote:BUILD.secrecy-0.8.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__self_cell__0_10_2",
        url = "https://crates.io/api/v1/crates/self_cell/0.10.2/download",
        type = "tar.gz",
        sha256 = "1ef965a420fe14fdac7dd018862966a4c14094f900e1650bbc71ddd7d580c8af",
        strip_prefix = "self_cell-0.10.2",
        build_file = Label("//third_party/cargo/remote:BUILD.self_cell-0.10.2.bazel"),
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
        name = "raze__semver__1_0_16",
        url = "https://crates.io/api/v1/crates/semver/1.0.16/download",
        type = "tar.gz",
        sha256 = "58bc9567378fc7690d6b2addae4e60ac2eeea07becb2c64b9f218b53865cba2a",
        strip_prefix = "semver-1.0.16",
        build_file = Label("//third_party/cargo/remote:BUILD.semver-1.0.16.bazel"),
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
        name = "raze__send_wrapper__0_6_0",
        url = "https://crates.io/api/v1/crates/send_wrapper/0.6.0/download",
        type = "tar.gz",
        sha256 = "cd0b0ec5f1c1ca621c432a25813d8d60c88abe6d3e08a3eb9cf37d97a0fe3d73",
        strip_prefix = "send_wrapper-0.6.0",
        build_file = Label("//third_party/cargo/remote:BUILD.send_wrapper-0.6.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde__1_0_152",
        url = "https://crates.io/api/v1/crates/serde/1.0.152/download",
        type = "tar.gz",
        sha256 = "bb7d1f0d3021d347a83e556fc4683dea2ea09d87bccdf88ff5c12545d89d5efb",
        strip_prefix = "serde-1.0.152",
        build_file = Label("//third_party/cargo/remote:BUILD.serde-1.0.152.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_derive__1_0_152",
        url = "https://crates.io/api/v1/crates/serde_derive/1.0.152/download",
        type = "tar.gz",
        sha256 = "af487d118eecd09402d70a5d72551860e788df87b464af30e5ea6a38c75c541e",
        strip_prefix = "serde_derive-1.0.152",
        build_file = Label("//third_party/cargo/remote:BUILD.serde_derive-1.0.152.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_fmt__1_0_1",
        url = "https://crates.io/api/v1/crates/serde_fmt/1.0.1/download",
        type = "tar.gz",
        sha256 = "2963a69a2b3918c1dc75a45a18bd3fcd1120e31d3f59deb1b2f9b5d5ffb8baa4",
        strip_prefix = "serde_fmt-1.0.1",
        build_file = Label("//third_party/cargo/remote:BUILD.serde_fmt-1.0.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__serde_json__1_0_91",
        url = "https://crates.io/api/v1/crates/serde_json/1.0.91/download",
        type = "tar.gz",
        sha256 = "877c235533714907a8c2464236f5c4b2a17262ef1bd71f38f35ea592c8da6883",
        strip_prefix = "serde_json-1.0.91",
        build_file = Label("//third_party/cargo/remote:BUILD.serde_json-1.0.91.bazel"),
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
        name = "raze__serde_urlencoded__0_7_1",
        url = "https://crates.io/api/v1/crates/serde_urlencoded/0.7.1/download",
        type = "tar.gz",
        sha256 = "d3491c14715ca2294c4d6a88f15e84739788c1d030eed8c110436aafdaa2f3fd",
        strip_prefix = "serde_urlencoded-0.7.1",
        build_file = Label("//third_party/cargo/remote:BUILD.serde_urlencoded-0.7.1.bazel"),
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
        name = "raze__sha1__0_6_1",
        url = "https://crates.io/api/v1/crates/sha1/0.6.1/download",
        type = "tar.gz",
        sha256 = "c1da05c97445caa12d05e848c4a4fcbbea29e748ac28f7e80e9b010392063770",
        strip_prefix = "sha1-0.6.1",
        build_file = Label("//third_party/cargo/remote:BUILD.sha1-0.6.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sha1_smol__1_0_0",
        url = "https://crates.io/api/v1/crates/sha1_smol/1.0.0/download",
        type = "tar.gz",
        sha256 = "ae1a47186c03a32177042e55dbc5fd5aee900b8e0069a8d70fba96a9375cd012",
        strip_prefix = "sha1_smol-1.0.0",
        build_file = Label("//third_party/cargo/remote:BUILD.sha1_smol-1.0.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sha2__0_10_6",
        url = "https://crates.io/api/v1/crates/sha2/0.10.6/download",
        type = "tar.gz",
        sha256 = "82e6b795fe2e3b1e845bafcb27aa35405c4d47cdfc92af5fc8d3002f76cebdc0",
        strip_prefix = "sha2-0.10.6",
        build_file = Label("//third_party/cargo/remote:BUILD.sha2-0.10.6.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__sha2__0_9_9",
        url = "https://crates.io/api/v1/crates/sha2/0.9.9/download",
        type = "tar.gz",
        sha256 = "4d58a1e1bf39749807d89cf2d98ac2dfa0ff1cb3faa38fbb64dd88ac8013d800",
        strip_prefix = "sha2-0.9.9",
        build_file = Label("//third_party/cargo/remote:BUILD.sha2-0.9.9.bazel"),
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
        name = "raze__signal_hook__0_3_14",
        url = "https://crates.io/api/v1/crates/signal-hook/0.3.14/download",
        type = "tar.gz",
        sha256 = "a253b5e89e2698464fc26b545c9edceb338e18a89effeeecfea192c3025be29d",
        strip_prefix = "signal-hook-0.3.14",
        build_file = Label("//third_party/cargo/remote:BUILD.signal-hook-0.3.14.bazel"),
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
        name = "raze__signature__1_6_4",
        url = "https://crates.io/api/v1/crates/signature/1.6.4/download",
        type = "tar.gz",
        sha256 = "74233d3b3b2f6d4b006dc19dee745e73e2a6bfb6f93607cd3b02bd5b00797d7c",
        strip_prefix = "signature-1.6.4",
        build_file = Label("//third_party/cargo/remote:BUILD.signature-1.6.4.bazel"),
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
        name = "raze__siphasher__0_3_10",
        url = "https://crates.io/api/v1/crates/siphasher/0.3.10/download",
        type = "tar.gz",
        sha256 = "7bd3e3206899af3f8b12af284fafc038cc1dc2b41d1b89dd17297221c5d225de",
        strip_prefix = "siphasher-0.3.10",
        build_file = Label("//third_party/cargo/remote:BUILD.siphasher-0.3.10.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__skeptic__0_13_7",
        url = "https://crates.io/api/v1/crates/skeptic/0.13.7/download",
        type = "tar.gz",
        sha256 = "16d23b015676c90a0f01c197bfdc786c20342c73a0afdda9025adb0bc42940a8",
        strip_prefix = "skeptic-0.13.7",
        build_file = Label("//third_party/cargo/remote:BUILD.skeptic-0.13.7.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__slab__0_4_7",
        url = "https://crates.io/api/v1/crates/slab/0.4.7/download",
        type = "tar.gz",
        sha256 = "4614a76b2a8be0058caa9dbbaf66d988527d86d003c11a94fbd335d7661edcef",
        strip_prefix = "slab-0.4.7",
        build_file = Label("//third_party/cargo/remote:BUILD.slab-0.4.7.bazel"),
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
        name = "raze__smallvec__1_10_0",
        url = "https://crates.io/api/v1/crates/smallvec/1.10.0/download",
        type = "tar.gz",
        sha256 = "a507befe795404456341dfab10cef66ead4c041f62b8b11bbb92bffe5d0953e0",
        strip_prefix = "smallvec-1.10.0",
        build_file = Label("//third_party/cargo/remote:BUILD.smallvec-1.10.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__smol__1_3_0",
        url = "https://crates.io/api/v1/crates/smol/1.3.0/download",
        type = "tar.gz",
        sha256 = "13f2b548cd8447f8de0fdf1c592929f70f4fc7039a05e47404b0d096ec6987a1",
        strip_prefix = "smol-1.3.0",
        build_file = Label("//third_party/cargo/remote:BUILD.smol-1.3.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__smol_str__0_1_23",
        url = "https://crates.io/api/v1/crates/smol_str/0.1.23/download",
        type = "tar.gz",
        sha256 = "7475118a28b7e3a2e157ce0131ba8c5526ea96e90ee601d9f6bb2e286a35ab44",
        strip_prefix = "smol_str-0.1.23",
        build_file = Label("//third_party/cargo/remote:BUILD.smol_str-0.1.23.bazel"),
    )

    maybe(
        new_git_repository,
        name = "raze__snow__0_9_0",
        remote = "https://github.com/tarcieri/snow",
        commit = "f146ec0b4e3c1bb62178adafd057dde7d0ba2dcb",
        build_file = Label("//third_party/cargo/remote:BUILD.snow-0.9.0.bazel"),
        init_submodules = True,
    )

    maybe(
        http_archive,
        name = "raze__socket2__0_4_7",
        url = "https://crates.io/api/v1/crates/socket2/0.4.7/download",
        type = "tar.gz",
        sha256 = "02e2d2db9033d13a1567121ddd7a095ee144db4e1ca1b1bda3419bc0da294ebd",
        strip_prefix = "socket2-0.4.7",
        build_file = Label("//third_party/cargo/remote:BUILD.socket2-0.4.7.bazel"),
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
        name = "raze__spin__0_5_2",
        url = "https://crates.io/api/v1/crates/spin/0.5.2/download",
        type = "tar.gz",
        sha256 = "6e63cff320ae2c57904679ba7cb63280a3dc4613885beafb148ee7bf9aa9042d",
        strip_prefix = "spin-0.5.2",
        build_file = Label("//third_party/cargo/remote:BUILD.spin-0.5.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__spki__0_6_0",
        url = "https://crates.io/api/v1/crates/spki/0.6.0/download",
        type = "tar.gz",
        sha256 = "67cf02bbac7a337dc36e4f5a693db6c21e7863f45070f7064577eb4367a3212b",
        strip_prefix = "spki-0.6.0",
        build_file = Label("//third_party/cargo/remote:BUILD.spki-0.6.0.bazel"),
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
        name = "raze__static_assertions__1_1_0",
        url = "https://crates.io/api/v1/crates/static_assertions/1.1.0/download",
        type = "tar.gz",
        sha256 = "a2eb9349b6444b326872e140eb1cf5e7c522154d69e7a0ffb0fb81c06b37543f",
        strip_prefix = "static_assertions-1.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.static_assertions-1.1.0.bazel"),
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
        name = "raze__syn__1_0_107",
        url = "https://crates.io/api/v1/crates/syn/1.0.107/download",
        type = "tar.gz",
        sha256 = "1f4064b5b16e03ae50984a5a8ed5d4f8803e6bc1fd170a3cda91a1be4b18e3f5",
        strip_prefix = "syn-1.0.107",
        build_file = Label("//third_party/cargo/remote:BUILD.syn-1.0.107.bazel"),
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
        name = "raze__tagptr__0_2_0",
        url = "https://crates.io/api/v1/crates/tagptr/0.2.0/download",
        type = "tar.gz",
        sha256 = "7b2093cf4c8eb1e67749a6762251bc9cd836b6fc171623bd0a9d324d37af2417",
        strip_prefix = "tagptr-0.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.tagptr-0.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tar__0_4_38",
        url = "https://crates.io/api/v1/crates/tar/0.4.38/download",
        type = "tar.gz",
        sha256 = "4b55807c0344e1e6c04d7c965f5289c39a8d94ae23ed5c0b57aabac549f871c6",
        strip_prefix = "tar-0.4.38",
        build_file = Label("//third_party/cargo/remote:BUILD.tar-0.4.38.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tempfile__3_3_0",
        url = "https://crates.io/api/v1/crates/tempfile/3.3.0/download",
        type = "tar.gz",
        sha256 = "5cdb1ef4eaeeaddc8fbd371e5017057064af0911902ef36b39801f67cc6d79e4",
        strip_prefix = "tempfile-3.3.0",
        build_file = Label("//third_party/cargo/remote:BUILD.tempfile-3.3.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__termcolor__1_2_0",
        url = "https://crates.io/api/v1/crates/termcolor/1.2.0/download",
        type = "tar.gz",
        sha256 = "be55cf8942feac5c765c2c993422806843c9a9a45d4d5c407ad6dd2ea95eb9b6",
        strip_prefix = "termcolor-1.2.0",
        build_file = Label("//third_party/cargo/remote:BUILD.termcolor-1.2.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__textwrap__0_16_0",
        url = "https://crates.io/api/v1/crates/textwrap/0.16.0/download",
        type = "tar.gz",
        sha256 = "222a222a5bfe1bba4a77b45ec488a741b3cb8872e5e499451fd7d0129c9c7c3d",
        strip_prefix = "textwrap-0.16.0",
        build_file = Label("//third_party/cargo/remote:BUILD.textwrap-0.16.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__thiserror__1_0_38",
        url = "https://crates.io/api/v1/crates/thiserror/1.0.38/download",
        type = "tar.gz",
        sha256 = "6a9cd18aa97d5c45c6603caea1da6628790b37f7a34b6ca89522331c5180fed0",
        strip_prefix = "thiserror-1.0.38",
        build_file = Label("//third_party/cargo/remote:BUILD.thiserror-1.0.38.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__thiserror_impl__1_0_38",
        url = "https://crates.io/api/v1/crates/thiserror-impl/1.0.38/download",
        type = "tar.gz",
        sha256 = "1fb327af4685e4d03fa8cbcf1716380da910eeb2bb8be417e7f9fd3fb164f36f",
        strip_prefix = "thiserror-impl-1.0.38",
        build_file = Label("//third_party/cargo/remote:BUILD.thiserror-impl-1.0.38.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__thread_priority__0_8_2",
        url = "https://crates.io/api/v1/crates/thread-priority/0.8.2/download",
        type = "tar.gz",
        sha256 = "696668a68983ad737e08e11e9afb701e962cab9f07f2a4ff339316b2d5b0870d",
        strip_prefix = "thread-priority-0.8.2",
        build_file = Label("//third_party/cargo/remote:BUILD.thread-priority-0.8.2.bazel"),
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
        new_git_repository,
        name = "raze__tide_acme__0_2_0",
        remote = "https://github.com/ttiurani/tide-acme",
        commit = "53c21b421b2443c3c02487b49f3c7f32c64febb0",
        build_file = Label("//third_party/cargo/remote:BUILD.tide-acme-0.2.0.bazel"),
        init_submodules = True,
    )

    maybe(
        http_archive,
        name = "raze__tide_compress__0_10_6",
        url = "https://crates.io/api/v1/crates/tide-compress/0.10.6/download",
        type = "tar.gz",
        sha256 = "92a55e754f247bb04c6ea1c2ec46f1a4e8a91dabca9dc7a38c67aa3a9df6b359",
        strip_prefix = "tide-compress-0.10.6",
        build_file = Label("//third_party/cargo/remote:BUILD.tide-compress-0.10.6.bazel"),
    )

    maybe(
        new_git_repository,
        name = "raze__tide_rustls__0_3_0",
        remote = "https://github.com/http-rs/tide-rustls",
        commit = "cbfb61f519238730b4d6318901fe2f2a8bfdb164",
        build_file = Label("//third_party/cargo/remote:BUILD.tide-rustls-0.3.0.bazel"),
        init_submodules = True,
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
        name = "raze__time__0_1_45",
        url = "https://crates.io/api/v1/crates/time/0.1.45/download",
        type = "tar.gz",
        sha256 = "1b797afad3f312d1c66a56d11d0316f916356d11bd158fbc6ca6389ff6bf805a",
        strip_prefix = "time-0.1.45",
        build_file = Label("//third_party/cargo/remote:BUILD.time-0.1.45.bazel"),
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
        name = "raze__time__0_3_17",
        url = "https://crates.io/api/v1/crates/time/0.3.17/download",
        type = "tar.gz",
        sha256 = "a561bf4617eebd33bca6434b988f39ed798e527f51a1e797d0ee4f61c0a38376",
        strip_prefix = "time-0.3.17",
        build_file = Label("//third_party/cargo/remote:BUILD.time-0.3.17.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__time_core__0_1_0",
        url = "https://crates.io/api/v1/crates/time-core/0.1.0/download",
        type = "tar.gz",
        sha256 = "2e153e1f1acaef8acc537e68b44906d2db6436e2b35ac2c6b42640fff91f00fd",
        strip_prefix = "time-core-0.1.0",
        build_file = Label("//third_party/cargo/remote:BUILD.time-core-0.1.0.bazel"),
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
        name = "raze__time_macros__0_2_6",
        url = "https://crates.io/api/v1/crates/time-macros/0.2.6/download",
        type = "tar.gz",
        sha256 = "d967f99f534ca7e495c575c62638eebc2898a8c84c119b89e250477bc4ba16b2",
        strip_prefix = "time-macros-0.2.6",
        build_file = Label("//third_party/cargo/remote:BUILD.time-macros-0.2.6.bazel"),
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
        name = "raze__tinystr__0_7_1",
        url = "https://crates.io/api/v1/crates/tinystr/0.7.1/download",
        type = "tar.gz",
        sha256 = "7ac3f5b6856e931e15e07b478e98c8045239829a65f9156d4fa7e7788197a5ef",
        strip_prefix = "tinystr-0.7.1",
        build_file = Label("//third_party/cargo/remote:BUILD.tinystr-0.7.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tinyvec__1_6_0",
        url = "https://crates.io/api/v1/crates/tinyvec/1.6.0/download",
        type = "tar.gz",
        sha256 = "87cc5ceb3875bb20c2890005a4e226a4651264a5c75edb2421b52861a0a0cb50",
        strip_prefix = "tinyvec-1.6.0",
        build_file = Label("//third_party/cargo/remote:BUILD.tinyvec-1.6.0.bazel"),
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
        name = "raze__tokio__1_25_0",
        url = "https://crates.io/api/v1/crates/tokio/1.25.0/download",
        type = "tar.gz",
        sha256 = "c8e00990ebabbe4c14c08aca901caed183ecd5c09562a12c824bb53d3c3fd3af",
        strip_prefix = "tokio-1.25.0",
        build_file = Label("//third_party/cargo/remote:BUILD.tokio-1.25.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__toml__0_5_11",
        url = "https://crates.io/api/v1/crates/toml/0.5.11/download",
        type = "tar.gz",
        sha256 = "f4f7f0dd8d50a853a531c426359045b1998f04219d88799810762cd4ad314234",
        strip_prefix = "toml-0.5.11",
        build_file = Label("//third_party/cargo/remote:BUILD.toml-0.5.11.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tracing__0_1_37",
        url = "https://crates.io/api/v1/crates/tracing/0.1.37/download",
        type = "tar.gz",
        sha256 = "8ce8c33a8d48bd45d624a6e523445fd21ec13d3653cd51f681abf67418f54eb8",
        strip_prefix = "tracing-0.1.37",
        build_file = Label("//third_party/cargo/remote:BUILD.tracing-0.1.37.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tracing_attributes__0_1_23",
        url = "https://crates.io/api/v1/crates/tracing-attributes/0.1.23/download",
        type = "tar.gz",
        sha256 = "4017f8f45139870ca7e672686113917c71c7a6e02d4924eda67186083c03081a",
        strip_prefix = "tracing-attributes-0.1.23",
        build_file = Label("//third_party/cargo/remote:BUILD.tracing-attributes-0.1.23.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__tracing_core__0_1_30",
        url = "https://crates.io/api/v1/crates/tracing-core/0.1.30/download",
        type = "tar.gz",
        sha256 = "24eb03ba0eab1fd845050058ce5e616558e8f8d8fca633e6b163fe25c797213a",
        strip_prefix = "tracing-core-0.1.30",
        build_file = Label("//third_party/cargo/remote:BUILD.tracing-core-0.1.30.bazel"),
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
        name = "raze__triomphe__0_1_8",
        url = "https://crates.io/api/v1/crates/triomphe/0.1.8/download",
        type = "tar.gz",
        sha256 = "f1ee9bd9239c339d714d657fac840c6d2a4f9c45f4f9ec7b0975113458be78db",
        strip_prefix = "triomphe-0.1.8",
        build_file = Label("//third_party/cargo/remote:BUILD.triomphe-0.1.8.bazel"),
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
        name = "raze__type_map__0_4_0",
        url = "https://crates.io/api/v1/crates/type-map/0.4.0/download",
        type = "tar.gz",
        sha256 = "b6d3364c5e96cb2ad1603037ab253ddd34d7fb72a58bdddf4b7350760fc69a46",
        strip_prefix = "type-map-0.4.0",
        build_file = Label("//third_party/cargo/remote:BUILD.type-map-0.4.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__typenum__1_16_0",
        url = "https://crates.io/api/v1/crates/typenum/1.16.0/download",
        type = "tar.gz",
        sha256 = "497961ef93d974e23eb6f433eb5fe1b7930b659f06d12dec6fc44a8f554c0bba",
        strip_prefix = "typenum-1.16.0",
        build_file = Label("//third_party/cargo/remote:BUILD.typenum-1.16.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unic_langid__0_9_1",
        url = "https://crates.io/api/v1/crates/unic-langid/0.9.1/download",
        type = "tar.gz",
        sha256 = "398f9ad7239db44fd0f80fe068d12ff22d78354080332a5077dc6f52f14dcf2f",
        strip_prefix = "unic-langid-0.9.1",
        build_file = Label("//third_party/cargo/remote:BUILD.unic-langid-0.9.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unic_langid_impl__0_9_1",
        url = "https://crates.io/api/v1/crates/unic-langid-impl/0.9.1/download",
        type = "tar.gz",
        sha256 = "e35bfd2f2b8796545b55d7d3fd3e89a0613f68a0d1c8bc28cb7ff96b411a35ff",
        strip_prefix = "unic-langid-impl-0.9.1",
        build_file = Label("//third_party/cargo/remote:BUILD.unic-langid-impl-0.9.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicase__2_6_0",
        url = "https://crates.io/api/v1/crates/unicase/2.6.0/download",
        type = "tar.gz",
        sha256 = "50f37be617794602aabbeee0be4f259dc1778fabe05e2d67ee8f79326d5cb4f6",
        strip_prefix = "unicase-2.6.0",
        build_file = Label("//third_party/cargo/remote:BUILD.unicase-2.6.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_bidi__0_3_10",
        url = "https://crates.io/api/v1/crates/unicode-bidi/0.3.10/download",
        type = "tar.gz",
        sha256 = "d54675592c1dbefd78cbd98db9bacd89886e1ca50692a0692baefffdeb92dd58",
        strip_prefix = "unicode-bidi-0.3.10",
        build_file = Label("//third_party/cargo/remote:BUILD.unicode-bidi-0.3.10.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_ident__1_0_6",
        url = "https://crates.io/api/v1/crates/unicode-ident/1.0.6/download",
        type = "tar.gz",
        sha256 = "84a22b9f218b40614adcb3f4ff08b703773ad44fa9423e4e0d346d5db86e4ebc",
        strip_prefix = "unicode-ident-1.0.6",
        build_file = Label("//third_party/cargo/remote:BUILD.unicode-ident-1.0.6.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_normalization__0_1_22",
        url = "https://crates.io/api/v1/crates/unicode-normalization/0.1.22/download",
        type = "tar.gz",
        sha256 = "5c5713f0fc4b5db668a2ac63cdb7bb4469d8c9fed047b1d0292cc7b0ce2ba921",
        strip_prefix = "unicode-normalization-0.1.22",
        build_file = Label("//third_party/cargo/remote:BUILD.unicode-normalization-0.1.22.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_width__0_1_10",
        url = "https://crates.io/api/v1/crates/unicode-width/0.1.10/download",
        type = "tar.gz",
        sha256 = "c0edd1e5b14653f783770bce4a4dabb4a5108a5370a5f5d8cfe8710c361f6c8b",
        strip_prefix = "unicode-width-0.1.10",
        build_file = Label("//third_party/cargo/remote:BUILD.unicode-width-0.1.10.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__unicode_xid__0_2_4",
        url = "https://crates.io/api/v1/crates/unicode-xid/0.2.4/download",
        type = "tar.gz",
        sha256 = "f962df74c8c05a667b5ee8bcf162993134c104e96440b663c8daa176dc772d8c",
        strip_prefix = "unicode-xid-0.2.4",
        build_file = Label("//third_party/cargo/remote:BUILD.unicode-xid-0.2.4.bazel"),
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
        name = "raze__universal_hash__0_5_0",
        url = "https://crates.io/api/v1/crates/universal-hash/0.5.0/download",
        type = "tar.gz",
        sha256 = "7d3160b73c9a19f7e2939a2fdad446c57c1bbbbf4d919d3213ff1267a580d8b5",
        strip_prefix = "universal-hash-0.5.0",
        build_file = Label("//third_party/cargo/remote:BUILD.universal-hash-0.5.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__untrusted__0_7_1",
        url = "https://crates.io/api/v1/crates/untrusted/0.7.1/download",
        type = "tar.gz",
        sha256 = "a156c684c91ea7d62626509bce3cb4e1d9ed5c4d978f7b4352658f96a4c26b4a",
        strip_prefix = "untrusted-0.7.1",
        build_file = Label("//third_party/cargo/remote:BUILD.untrusted-0.7.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__url__2_3_1",
        url = "https://crates.io/api/v1/crates/url/2.3.1/download",
        type = "tar.gz",
        sha256 = "0d68c799ae75762b8c3fe375feb6600ef5602c883c5d21eb51c09f22b83c4643",
        strip_prefix = "url-2.3.1",
        build_file = Label("//third_party/cargo/remote:BUILD.url-2.3.1.bazel"),
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
        name = "raze__utf8_width__0_1_6",
        url = "https://crates.io/api/v1/crates/utf8-width/0.1.6/download",
        type = "tar.gz",
        sha256 = "5190c9442dcdaf0ddd50f37420417d219ae5261bbf5db120d0f9bab996c9cba1",
        strip_prefix = "utf8-width-0.1.6",
        build_file = Label("//third_party/cargo/remote:BUILD.utf8-width-0.1.6.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__uuid__1_2_2",
        url = "https://crates.io/api/v1/crates/uuid/1.2.2/download",
        type = "tar.gz",
        sha256 = "422ee0de9031b5b948b97a8fc04e3aa35230001a722ddd27943e0be31564ce4c",
        strip_prefix = "uuid-1.2.2",
        build_file = Label("//third_party/cargo/remote:BUILD.uuid-1.2.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__value_bag__1_0_0_alpha_9",
        url = "https://crates.io/api/v1/crates/value-bag/1.0.0-alpha.9/download",
        type = "tar.gz",
        sha256 = "2209b78d1249f7e6f3293657c9779fe31ced465df091bbd433a1cf88e916ec55",
        strip_prefix = "value-bag-1.0.0-alpha.9",
        build_file = Label("//third_party/cargo/remote:BUILD.value-bag-1.0.0-alpha.9.bazel"),
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
        name = "raze__walkdir__2_3_2",
        url = "https://crates.io/api/v1/crates/walkdir/2.3.2/download",
        type = "tar.gz",
        sha256 = "808cf2735cd4b6866113f648b791c6adc5714537bc222d9347bb203386ffda56",
        strip_prefix = "walkdir-2.3.2",
        build_file = Label("//third_party/cargo/remote:BUILD.walkdir-2.3.2.bazel"),
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
        name = "raze__wasi__0_11_0_wasi_snapshot_preview1",
        url = "https://crates.io/api/v1/crates/wasi/0.11.0+wasi-snapshot-preview1/download",
        type = "tar.gz",
        sha256 = "9c8d87e72b64a3b4db28d11ce29237c246188f4f51057d65a7eab63b7987e423",
        strip_prefix = "wasi-0.11.0+wasi-snapshot-preview1",
        build_file = Label("//third_party/cargo/remote:BUILD.wasi-0.11.0+wasi-snapshot-preview1.bazel"),
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
        name = "raze__webpki__0_21_4",
        url = "https://crates.io/api/v1/crates/webpki/0.21.4/download",
        type = "tar.gz",
        sha256 = "b8e38c0608262c46d4a56202ebabdeb094cef7e560ca7a226c6bf055188aa4ea",
        strip_prefix = "webpki-0.21.4",
        build_file = Label("//third_party/cargo/remote:BUILD.webpki-0.21.4.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__webpki__0_22_0",
        url = "https://crates.io/api/v1/crates/webpki/0.22.0/download",
        type = "tar.gz",
        sha256 = "f095d78192e208183081cc07bc5515ef55216397af48b873e5edcd72637fa1bd",
        strip_prefix = "webpki-0.22.0",
        build_file = Label("//third_party/cargo/remote:BUILD.webpki-0.22.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__webpki_roots__0_21_1",
        url = "https://crates.io/api/v1/crates/webpki-roots/0.21.1/download",
        type = "tar.gz",
        sha256 = "aabe153544e473b775453675851ecc86863d2a81d786d741f6b76778f2a48940",
        strip_prefix = "webpki-roots-0.21.1",
        build_file = Label("//third_party/cargo/remote:BUILD.webpki-roots-0.21.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__webpki_roots__0_22_6",
        url = "https://crates.io/api/v1/crates/webpki-roots/0.22.6/download",
        type = "tar.gz",
        sha256 = "b6c71e40d7d2c34a5106301fb632274ca37242cd0c9d3e64dbece371a40a2d87",
        strip_prefix = "webpki-roots-0.22.6",
        build_file = Label("//third_party/cargo/remote:BUILD.webpki-roots-0.22.6.bazel"),
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
        name = "raze__which__4_4_0",
        url = "https://crates.io/api/v1/crates/which/4.4.0/download",
        type = "tar.gz",
        sha256 = "2441c784c52b289a054b7201fc93253e288f094e2f4be9058343127c4226a269",
        strip_prefix = "which-4.4.0",
        build_file = Label("//third_party/cargo/remote:BUILD.which-4.4.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__wildmatch__2_1_1",
        url = "https://crates.io/api/v1/crates/wildmatch/2.1.1/download",
        type = "tar.gz",
        sha256 = "ee583bdc5ff1cf9db20e9db5bb3ff4c3089a8f6b8b31aff265c9aba85812db86",
        strip_prefix = "wildmatch-2.1.1",
        build_file = Label("//third_party/cargo/remote:BUILD.wildmatch-2.1.1.bazel"),
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
        name = "raze__windows_sys__0_42_0",
        url = "https://crates.io/api/v1/crates/windows-sys/0.42.0/download",
        type = "tar.gz",
        sha256 = "5a3e1820f08b8513f676f7ab6c1f99ff312fb97b553d30ff4dd86f9f15728aa7",
        strip_prefix = "windows-sys-0.42.0",
        build_file = Label("//third_party/cargo/remote:BUILD.windows-sys-0.42.0.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__windows_aarch64_gnullvm__0_42_1",
        url = "https://crates.io/api/v1/crates/windows_aarch64_gnullvm/0.42.1/download",
        type = "tar.gz",
        sha256 = "8c9864e83243fdec7fc9c5444389dcbbfd258f745e7853198f365e3c4968a608",
        strip_prefix = "windows_aarch64_gnullvm-0.42.1",
        build_file = Label("//third_party/cargo/remote:BUILD.windows_aarch64_gnullvm-0.42.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__windows_aarch64_msvc__0_42_1",
        url = "https://crates.io/api/v1/crates/windows_aarch64_msvc/0.42.1/download",
        type = "tar.gz",
        sha256 = "4c8b1b673ffc16c47a9ff48570a9d85e25d265735c503681332589af6253c6c7",
        strip_prefix = "windows_aarch64_msvc-0.42.1",
        build_file = Label("//third_party/cargo/remote:BUILD.windows_aarch64_msvc-0.42.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__windows_i686_gnu__0_42_1",
        url = "https://crates.io/api/v1/crates/windows_i686_gnu/0.42.1/download",
        type = "tar.gz",
        sha256 = "de3887528ad530ba7bdbb1faa8275ec7a1155a45ffa57c37993960277145d640",
        strip_prefix = "windows_i686_gnu-0.42.1",
        build_file = Label("//third_party/cargo/remote:BUILD.windows_i686_gnu-0.42.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__windows_i686_msvc__0_42_1",
        url = "https://crates.io/api/v1/crates/windows_i686_msvc/0.42.1/download",
        type = "tar.gz",
        sha256 = "bf4d1122317eddd6ff351aa852118a2418ad4214e6613a50e0191f7004372605",
        strip_prefix = "windows_i686_msvc-0.42.1",
        build_file = Label("//third_party/cargo/remote:BUILD.windows_i686_msvc-0.42.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__windows_x86_64_gnu__0_42_1",
        url = "https://crates.io/api/v1/crates/windows_x86_64_gnu/0.42.1/download",
        type = "tar.gz",
        sha256 = "c1040f221285e17ebccbc2591ffdc2d44ee1f9186324dd3e84e99ac68d699c45",
        strip_prefix = "windows_x86_64_gnu-0.42.1",
        build_file = Label("//third_party/cargo/remote:BUILD.windows_x86_64_gnu-0.42.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__windows_x86_64_gnullvm__0_42_1",
        url = "https://crates.io/api/v1/crates/windows_x86_64_gnullvm/0.42.1/download",
        type = "tar.gz",
        sha256 = "628bfdf232daa22b0d64fdb62b09fcc36bb01f05a3939e20ab73aaf9470d0463",
        strip_prefix = "windows_x86_64_gnullvm-0.42.1",
        build_file = Label("//third_party/cargo/remote:BUILD.windows_x86_64_gnullvm-0.42.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__windows_x86_64_msvc__0_42_1",
        url = "https://crates.io/api/v1/crates/windows_x86_64_msvc/0.42.1/download",
        type = "tar.gz",
        sha256 = "447660ad36a13288b1db4d4248e857b510e8c3a225c822ba4fb748c0aafecffd",
        strip_prefix = "windows_x86_64_msvc-0.42.1",
        build_file = Label("//third_party/cargo/remote:BUILD.windows_x86_64_msvc-0.42.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__ws_stream_wasm__0_7_4",
        url = "https://crates.io/api/v1/crates/ws_stream_wasm/0.7.4/download",
        type = "tar.gz",
        sha256 = "7999f5f4217fe3818726b66257a4475f71e74ffd190776ad053fa159e50737f5",
        strip_prefix = "ws_stream_wasm-0.7.4",
        build_file = Label("//third_party/cargo/remote:BUILD.ws_stream_wasm-0.7.4.bazel"),
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
        name = "raze__x509_parser__0_13_2",
        url = "https://crates.io/api/v1/crates/x509-parser/0.13.2/download",
        type = "tar.gz",
        sha256 = "9fb9bace5b5589ffead1afb76e43e34cff39cd0f3ce7e170ae0c29e53b88eb1c",
        strip_prefix = "x509-parser-0.13.2",
        build_file = Label("//third_party/cargo/remote:BUILD.x509-parser-0.13.2.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__xattr__0_2_3",
        url = "https://crates.io/api/v1/crates/xattr/0.2.3/download",
        type = "tar.gz",
        sha256 = "6d1526bbe5aaeb5eb06885f4d987bcdfa5e23187055de9b83fe00156a821fabc",
        strip_prefix = "xattr-0.2.3",
        build_file = Label("//third_party/cargo/remote:BUILD.xattr-0.2.3.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__yasna__0_5_1",
        url = "https://crates.io/api/v1/crates/yasna/0.5.1/download",
        type = "tar.gz",
        sha256 = "aed2e7a52e3744ab4d0c05c20aa065258e84c49fd4226f5191b2ed29712710b4",
        strip_prefix = "yasna-0.5.1",
        build_file = Label("//third_party/cargo/remote:BUILD.yasna-0.5.1.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__zeroize__1_5_7",
        url = "https://crates.io/api/v1/crates/zeroize/1.5.7/download",
        type = "tar.gz",
        sha256 = "c394b5bd0c6f669e7275d9c20aa90ae064cb22e75a1cad54e1b34088034b149f",
        strip_prefix = "zeroize-1.5.7",
        build_file = Label("//third_party/cargo/remote:BUILD.zeroize-1.5.7.bazel"),
    )

    maybe(
        http_archive,
        name = "raze__zeroize_derive__1_3_3",
        url = "https://crates.io/api/v1/crates/zeroize_derive/1.3.3/download",
        type = "tar.gz",
        sha256 = "44bf07cb3e50ea2003396695d58bf46bc9887a1f362260446fad6bc4e79bd36c",
        strip_prefix = "zeroize_derive-1.3.3",
        build_file = Label("//third_party/cargo/remote:BUILD.zeroize_derive-1.3.3.bazel"),
    )
