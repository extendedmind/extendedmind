load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

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
RULES_CAPNPROTO_VERSION = "578ab6770e83b7c8f47a4d95dee691184896336f"
RULES_CAPNPROTO_SHA256 = "14cc900f190bf3b08e3e98fe85d6f48672d086f635c03355217e9cd0a57946f4"

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
http_archive(
    name = "rules_rust",
    sha256 = "929d2eea04ec752f03f1f3b8e44c9ca1901ad2902e1e366847032765835c9730",
    strip_prefix = "rules_rust-2fa92e5a139c7cb64d606718273e295ce756f0f3",
    urls = [
        # Change to rules_rust upstream with one extra commit
        "https://github.com/ttiurani/rules_rust/archive/2fa92e5a139c7cb64d606718273e295ce756f0f3.tar.gz",
    ],
)

load("@rules_rust//rust:repositories.bzl", "rust_register_toolchains", "rust_repository_set")
RUST_VERSION = "1.56.1"
rust_register_toolchains(version = RUST_VERSION, edition="2018", rustfmt_version = RUST_VERSION)
rust_repository_set(
    name = "extendedmind_rust_apple_x86_64",
    edition = "2018",
    version = RUST_VERSION,
    rustfmt_version = RUST_VERSION,
    exec_triple = "x86_64-apple-darwin",
    extra_target_triples=[
        # Instead of this, this should apparently be "thumbv7neon-linux-androideabi", but that
        # requires changes to upstream, roughly here bazel core should return armv7:
        #
        # https://github.com/bazelbuild/bazel/blob/master/src/main/java/com/google/devtools/build/lib/bazel/rules/android/ndkcrosstools/r19/ArmCrosstools.java#L105
        #
        # after which the platform upstream:
        #
        # https://github.com/bazelbuild/rules_android/blob/master/android/platforms/BUILD#L6
        #
        # would also work. Then rules_rust could perhaps map armv7 to that thumbv7neon for rust
        # builds. With this, it seems the build isn't for Neon ARM which is much faster than just
        # arm.
        "arm-linux-androideabi",
        "aarch64-linux-android",
        "i686-linux-android",
        "x86_64-linux-android"
    ],
)

rust_repository_set(
    name = "extendedmind_rust_linux_x86_64",
    edition = "2018",
    version = RUST_VERSION,
    rustfmt_version = RUST_VERSION,
    exec_triple = "x86_64-unknown-linux-gnu",
    extra_target_triples=[
        "arm-linux-androideabi",
        "aarch64-linux-android",
        "i686-linux-android",
        "x86_64-linux-android"
    ],
)

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

# Android / Kotlin
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

RULES_KOTLIN_VERSION = "v1.5.0"
RULES_KOTLIN_SHA256 = "12d22a3d9cbcf00f2e2d8f0683ba87d3823cb8c7f6837568dd7e48846e023307"
http_archive(
    name = "io_bazel_rules_kotlin",
    url = "https://github.com/bazelbuild/rules_kotlin/releases/download/%s/rules_kotlin_release.tgz" % RULES_KOTLIN_VERSION,
    sha256 = RULES_KOTLIN_SHA256,
)

load("@io_bazel_rules_kotlin//kotlin:repositories.bzl", "kotlin_repositories")
kotlin_repositories()

load("@io_bazel_rules_kotlin//kotlin:core.bzl", "kt_register_toolchains")
kt_register_toolchains()

android_sdk_repository(name = "androidsdk", build_tools_version = "30.0.3")
android_ndk_repository(name = "androidndk")

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
        "org.capnproto:runtime:0.1.13",
    ],
    repositories = [
        "https://repo1.maven.org/maven2",
        "https://maven.google.com",
    ],
)
