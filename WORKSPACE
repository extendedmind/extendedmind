load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Node/Javascript/Typescript/Svelte/Esbuild
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "dcc55f810142b6cf46a44d0180a5a7fb923c04a5061e2e8d8eb05ccccc60864b",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.8.0/rules_nodejs-5.8.0.tar.gz"],
)
load("@build_bazel_rules_nodejs//:repositories.bzl", "build_bazel_rules_nodejs_dependencies")
build_bazel_rules_nodejs_dependencies()
load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")
load("@build_bazel_rules_nodejs//:index.bzl", "npm_install", "node_repositories")
node_repositories(
    node_version = "18.12.1",
    yarn_version = "1.22.19",
)
nodejs_register_toolchains(
    name = "nodejs"
)
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
    sha256 = "2466e5b2514772e84f9009010797b9cd4b51c1e6445bbd5b5e24848d90e6fb2e",
    urls = ["https://github.com/bazelbuild/rules_rust/releases/download/0.18.0/rules_rust-v0.18.0.tar.gz"],
)
load("@rules_rust//rust:repositories.bzl", "rules_rust_dependencies", "rust_register_toolchains", "rust_repository_set")
rules_rust_dependencies()
RUST_VERSION = "1.67.0"
rust_register_toolchains(versions = [RUST_VERSION], edition="2021", rustfmt_version = RUST_VERSION)
rust_repository_set(
    name = "extendedmind_rust_apple_x86_64",
    edition = "2021",
    versions = [RUST_VERSION],
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
        "armv7-linux-androideabi",
        "aarch64-linux-android",
        "i686-linux-android",
        "x86_64-linux-android",
    ],
)

rust_repository_set(
    name = "extendedmind_rust_linux_x86_64",
    edition = "2021",
    versions = [RUST_VERSION],
    rustfmt_version = RUST_VERSION,
    exec_triple = "x86_64-unknown-linux-gnu",
    extra_target_triples=[
        "armv7-linux-androideabi",
        "aarch64-linux-android",
        "i686-linux-android",
        "x86_64-linux-android",
        "aarch64-unknown-linux-gnu",
    ],
)

load("@rules_rust//crate_universe:repositories.bzl", "crate_universe_dependencies")
crate_universe_dependencies()
load("@rules_rust//crate_universe:defs.bzl", "crates_repository")
crates_repository(
    name = "crate_index",
    cargo_lockfile = "//:Cargo.lock",
    lockfile = "//:cargo-bazel-lock.json",
    manifests = [
        "//:Cargo.toml",
        "//schema:Cargo.toml",
        "//core:Cargo.toml",
        "//hub:Cargo.toml",
        "//server:Cargo.toml",
        "//ui/common:Cargo.toml",
        "//ui/cli:Cargo.toml",
        "//ui/android/jni:Cargo.toml",
    ],
)
load("@crate_index//:defs.bzl", "crate_repositories")
crate_repositories()

load("@rules_rust//wasm_bindgen:repositories.bzl", "rust_wasm_bindgen_repositories")
rust_wasm_bindgen_repositories()

# CC Toolchains
load("//third_party/crosstools:deps.bzl", "crosstool_deps")
crosstool_deps()
load("//third_party/cc_toolchains:toolchains.bzl", "register_rpi_toolchain")
register_rpi_toolchain()

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

RULES_KOTLIN_VERSION = "v1.7.1"
RULES_KOTLIN_SHA256 = "fd92a98bd8a8f0e1cdcb490b93f5acef1f1727ed992571232d33de42395ca9b3"
http_archive(
    name = "io_bazel_rules_kotlin",
    url = "https://github.com/bazelbuild/rules_kotlin/releases/download/%s/rules_kotlin_release.tgz" % RULES_KOTLIN_VERSION,
    sha256 = RULES_KOTLIN_SHA256,
)
KOTLIN_COMPILER_VERSION = "1.6.10"
KOTLIN_COMPILER_SHA = "432267996d0d6b4b17ca8de0f878e44d4a099b7e9f1587a98edc4d27e76c215a"
JETPACK_COMPOSE_VERSION = "1.1.1"

load("@io_bazel_rules_kotlin//kotlin:repositories.bzl", "kotlin_repositories", "kotlinc_version")
kotlin_repositories(
    compiler_release = kotlinc_version(
        release = KOTLIN_COMPILER_VERSION,
        sha256 = KOTLIN_COMPILER_SHA,
    ),
)

register_toolchains("//ui/android:kotlin_toolchain")

# load("@io_bazel_rules_kotlin//kotlin:core.bzl", "kt_register_toolchains")
# kt_register_toolchains()

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
load("@rules_jvm_external//:specs.bzl", "maven")

maven_install(
    artifacts = [
        "org.jetbrains.kotlin:kotlin-stdlib:{}".format(KOTLIN_COMPILER_VERSION),
        "androidx.core:core-ktx:1.7.0",
        "androidx.appcompat:appcompat:1.4.1",
        "androidx.activity:activity-compose:1.4.0",
        "com.google.android.material:material:1.5.0",
        "androidx.constraintlayout:constraintlayout:2.1.3",
        "androidx.compose.material:material:{}".format(JETPACK_COMPOSE_VERSION),
        "androidx.compose.ui:ui:{}".format(JETPACK_COMPOSE_VERSION),
        "androidx.compose.ui:ui-tooling:{}".format(JETPACK_COMPOSE_VERSION),
        "androidx.compose.compiler:compiler:{}".format(JETPACK_COMPOSE_VERSION),
        "androidx.compose.runtime:runtime:{}".format(JETPACK_COMPOSE_VERSION),
        maven.artifact(
            group = "androidx.lifecycle",
            artifact = "lifecycle-viewmodel-compose",
            version = "2.4.1",
            exclusions = [
                maven.exclusion(
                    group = "androidx.compose.runtime",
                    artifact = "runtime"
                ),
                maven.exclusion(
                    group = "androidx.compose.ui",
                    artifact = "ui"
                ),
                maven.exclusion(
                    group = "androidx.lifecycle",
                    artifact = "lifecycle-viewmodel-ktx"
                ),

            ]
        ),
        maven.artifact(
            group = "androidx.lifecycle",
            artifact = "lifecycle-viewmodel-ktx",
            version = "2.4.1",
        ),
        # maven.artifact(
        #     group = "androidx.navigation",
        #     artifact = "navigation-runtime",
        #     version = "2.4.1",
        #     exclusions = [
        #         maven.exclusion(
        #             group = "androidx.activity",
        #             artifact = "activity-ktx"
        #         ),
        #     ]
        # ),
        # maven.artifact(
        #     group = "androidx.fragment",
        #     artifact = "fragment-ktx",
        #     version = "1.4.1",
        #     exclusions = [
        #         maven.exclusion(
        #             group = "androidx.activity",
        #             artifact = "activity-ktx"
        #         ),
        #     ]
        # ),
        # maven.artifact(
        #     group = "androidx.activity",
        #     artifact = "activity-ktx",
        #     version = "1.2.4",
        # ),
        # "androidx.navigation:navigation-fragment-ktx:2.4.1",
        # "androidx.navigation:navigation-ui-ktx:2.4.1",
        # "androidx.navigation:navigation-compose:2.4.1",
        "org.capnproto:runtime:0.1.13",
    ],
    override_targets = {
        "org.jetbrains.kotlinx:kotlinx-coroutines-core-jvm": "@//ui/android:kotlinx_coroutines_core_jvm",
    },
    repositories = [
        "https://maven.google.com",
        "https://repo1.maven.org/maven2",
    ],
)

# Secondary maven repository used mainly for workarounds
maven_install(
    name = "maven_secondary",
    artifacts = [
        # Workaround to add missing 'sun.misc' dependencies to 'kotlinx-coroutines-core-jvm' artifact
        # Check root BUILD file and 'override_targets' arg of a primary 'maven_install'
        "org.jetbrains.kotlinx:kotlinx-coroutines-core-jvm:1.6.0",
    ],
    fetch_sources = True,
    repositories = ["https://repo1.maven.org/maven2"],
)
