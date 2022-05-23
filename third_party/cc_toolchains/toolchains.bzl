def register_rpi_toolchain():
    native.register_toolchains(
        "//third_party/cc_toolchains/aarch64-rpi3-linux-gnu:aarch64_linux_toolchain",
    )
