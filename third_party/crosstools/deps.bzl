load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

URL_TOOLCHAIN = "https://github.com/ttiurani/devboards-toolchains/releases/download/v2021.12.01/"
URL_SYSROOT = "https://github.com/ltekieli/buildroot/releases/download/v2021.12.01/"

def crosstool_deps():
    if "aarch64-rpi3-linux-gnu" not in native.existing_rules():
        http_archive(
            name = "aarch64-rpi3-linux-gnu",
            build_file = Label("//third_party/crosstools:aarch64-rpi3-linux-gnu.BUILD"),
            url = URL_TOOLCHAIN + "aarch64-rpi3-linux-gnu.tar.gz",
            sha256 = "6b32fec2fcd7c8ba76d2ff9bfafad9dca6c9de2f42e869c5b1097658884457fa",
        )
    if "aarch64-rpi3-linux-gnu-sysroot" not in native.existing_rules():
        http_archive(
            name = "aarch64-rpi3-linux-gnu-sysroot",
            build_file = Label("//third_party/crosstools:aarch64-rpi3-linux-gnu-sysroot.BUILD"),
            url = URL_SYSROOT + "raspberrypi3_64.tar.gz",
            sha256 = "bde52d18418dfa294f7c3442deaaebe644cb1c6e5bb24435255d311f994c06e1",
        )
