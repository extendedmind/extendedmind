#!/usr/bin/env bash

# NB: Needs musl cross compiler, arch linux: "yay aarch64-linux-musl-cross-bin"

set -Eeuo pipefail

if [[ $# -eq 0 ]] ; then
    echo "Usage: build-openwrt.sh [OpenWrt SDK directory]"
    exit 1
fi

OPENWRT_SDK_DIR="$1"
OPENWRT_TOOLCHAIN_DIR=`ls -d $OPENWRT_SDK_DIR/staging_dir/toolchain-*`
export PKG_CONFIG_SYSROOT_DIR="$OPENWRT_SDK_DIR/staging_dir/host"
export PKG_CONFIG_PATH="$OPENWRT_SDK_DIR/staging_dir/host/lib/pkgconfig"
export OPENSSL_DIR="$OPENWRT_SDK_DIR/staging_dir/host"
export CARGO_TARGET_AARCH64_UNKNOWN_LINUX_MUSL_LINKER="$OPENWRT_TOOLCHAIN_DIR/bin/aarch64-openwrt-linux-musl-ld"
RUST_BACKTRACE=1 cargo build --target aarch64-unknown-linux-musl --release
