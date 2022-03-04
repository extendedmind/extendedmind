load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

local_repository(
    name = "rules_rust",
    path = "/Users/ttiurani/devel/em/rules_rust",
)

# Node/Javascript/Typescript/Svelte/Esbuild
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "f690430f4d4cc403b5c90d0f0b21842183b56b732fff96cfe6555fe73189906a",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.0.1/rules_nodejs-5.0.1.tar.gz"],
)
load("@build_bazel_rules_nodejs//:repositories.bzl", "build_bazel_rules_nodejs_dependencies")
build_bazel_rules_nodejs_dependencies()
load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")

nodejs_register_toolchains(
    name = "nodejs"
)

load("@build_bazel_rules_nodejs//:index.bzl", "npm_install", "node_repositories")

npm_install(
    name = "npm",
    package_json = "//ui/web:package.json",
    package_lock_json = "//ui/web:package-lock.json",
    quiet = False,
    symlink_node_modules = False,
)

# Cap'n Proto
RULES_CAPNPROTO_VERSION = "c8c751513dfd54194e098c253053309f091311e9"
RULES_CAPNPROTO_SHA256 = "6bdbfb7ab678a94f2120a97b9688a95535b3b5ec6b148d388dccaba1a14870d8"

http_archive(
    name = "rules_capnproto",
    strip_prefix = "rules_capnproto-%s" % RULES_CAPNPROTO_VERSION,
    url = "https://github.com/ttiurani/rules_capnproto/archive/%s.tar.gz" % RULES_CAPNPROTO_VERSION,
    sha256 = RULES_CAPNPROTO_SHA256,
)

load(
    "@rules_capnproto//capnp:repositories.bzl",
    "capnp_dependencies",
    "capnp_toolchain",
    "capnp_rust_toolchain",
    "capnp_ts_toolchain",
    "capnp_java_toolchain"
)

capnp_dependencies()
capnp_toolchain()
capnp_rust_toolchain()
capnp_ts_toolchain()
capnp_java_toolchain()

# Rust
# http_archive(
#     name = "rules_rust",
#     sha256 = "84bce6b6a56b74429d226456c1060eddfb97b3dd22567ae5a793e72cc0bd6867",
#     strip_prefix = "rules_rust-a9be87493cad02e192b927e42d66284f21fbe1ec",
#     urls = [
#         # Change to rules_rust upstream with one extra commit
#         "https://github.com/ttiurani/rules_rust/archive/a9be87493cad02e192b927e42d66284f21fbe1ec.tar.gz",
#     ],
# )

load("@rules_rust//rust:repositories.bzl", "rust_register_toolchains", "rust_repository_set")
RUST_VERSION = "1.56.1"
rust_register_toolchains(version = RUST_VERSION, edition="2018", rustfmt_version = RUST_VERSION)
rust_repository_set(
    name = "rust_apple_x86_64",
    edition = "2018",
    version = RUST_VERSION,
    rustfmt_version = RUST_VERSION,
    exec_triple = "x86_64-apple-darwin",
    extra_target_triples=[
        "arm-linux-androideabi",
        "aarch64-linux-android",
        "i686-linux-android",
        "x86_64-linux-android"
    ],
)

# TODO: Building on linux does not yet work:
#
# rust_repository_set(
#     name = "rust_linux_x86_64",
#     edition = "2018",
#     version = RUST_VERSION,
#     rustfmt_version = RUST_VERSION,
#     exec_triple = "x86_64-unknown-linux-gnu",
#     extra_target_triples=[
#         "i686-linux-android",
#     ],
# )

load("@rules_rust//wasm_bindgen:repositories.bzl", "rust_wasm_bindgen_repositories")
rust_wasm_bindgen_repositories()

load("//third_party/cargo:crates.bzl", "raze_fetch_remote_crates")
raze_fetch_remote_crates()

CARGO_RAZE_VERSION = "ef6f4bd083889bc2e792b16e51dc359dd71f5a6d"
CARGO_RAZE_SHA256 = "dcae99bf247a837cba34eeb4ff34d91016c95e8940d3a92852154f8156f28586"

http_archive(
    name = "cargo_raze",
    strip_prefix = "cargo-raze-%s" % CARGO_RAZE_VERSION,
    url = "https://github.com/ttiurani/cargo-raze/archive/%s.tar.gz" % CARGO_RAZE_VERSION,
    sha256 = CARGO_RAZE_SHA256
)
# # Example on using local version of cargo raze for hacking:
# local_repository(
#     name = "cargo_raze",
#     path = "[path to]/cargo-raze",
# )
load("@cargo_raze//:repositories.bzl", "cargo_raze_repositories")
cargo_raze_repositories()
load("@cargo_raze//:transitive_deps.bzl", "cargo_raze_transitive_deps")
cargo_raze_transitive_deps()

# Android / Java
#
# The required older build-tools and NDK, and the SDK for the oldest supported device can be
# locally installed with (using java 1.8):
#
#    sdkmanager "build-tools;30.0.3"
#    sdkmanager "ndk;21.4.7075529"
#    sdkmanager "system-images;android-18;default;armeabi-v7a"
#
# Also to get gradle<->android bridge to work, install to cargo platforms
#
#    rustup target add armv7-linux-androideabi
#    rustup target add aarch64-linux-android
#    rustup target add i686-linux-android
#    rustup target add x86_64-linux-android
#
# and then setting ANDROID_HOME normally and augmenting that with
#
#    export ANDROID_NDK_HOME="$ANDROID_HOME/ndk/21.4.7075529"
#
RULES_ANDROID_VERSION = "e8fbc49f913101e846235b9c9a31b3aa9788364a"
RULES_ANDROID_SHA256 = "6a3cfb7b7e54cf704bf2ff169bde03666ae3b49a536c27a5f43d013388a7c38d"
http_archive(
    name = "rules_android",
    strip_prefix = "rules_android-%s" % RULES_ANDROID_VERSION,
    url = "https://github.com/bazelbuild/rules_android/archive/%s.tar.gz" % RULES_ANDROID_VERSION,
    sha256 = RULES_ANDROID_SHA256
)
android_sdk_repository(name = "androidsdk", build_tools_version = "30.0.3")
android_ndk_repository(name = "androidndk")
# register_toolchains("@androidndk//:all")

ATS_COMMIT = "8db1c766bd88b5e22e177c9783b9f6af8839c703"
http_archive(
    name = "android_test_support",
    sha256 = "2d5832f18decf4e89c5525a12446a0321a8751ae95f58d9a6deb397068355044",
    strip_prefix = "android-test-%s" % ATS_COMMIT,
    urls = ["https://github.com/android/android-test/archive/%s.tar.gz" % ATS_COMMIT],
)
load("@android_test_support//:repo.bzl", "android_test_repositories")
android_test_repositories()

RULES_JVM_EXTERNAL_TAG = "4.2"
RULES_JVM_EXTERNAL_SHA = "cd1a77b7b02e8e008439ca76fd34f5b07aecb8c752961f9640dea15e9e5ba1ca"

http_archive(
    name = "rules_jvm_external",
    strip_prefix = "rules_jvm_external-%s" % RULES_JVM_EXTERNAL_TAG,
    sha256 = RULES_JVM_EXTERNAL_SHA,
    url = "https://github.com/bazelbuild/rules_jvm_external/archive/%s.zip" % RULES_JVM_EXTERNAL_TAG,
)

load("@rules_jvm_external//:defs.bzl", "maven_install")

maven_install(
    artifacts = [
        # Newer versions don't work yet, probably has to do with build tools 30.0.0 above^
        "androidx.appcompat:appcompat:1.3.1",
        "androidx.constraintlayout:constraintlayout:2.0.4",
    ],
    repositories = [
        "https://repo1.maven.org/maven2",
        "https://maven.google.com",
    ],
)
