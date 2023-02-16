#!/bin/bash
set -euo pipefail

rm -rf target/data
mkdir -p target/data
TARGET_PATH=$(echo "$(cd "$(dirname "target")"; pwd -P)/$(basename "target")")
bazel run //ui/cli:extendedmind_cli -- \
    --data-root-dir ${TARGET_PATH}/data \
    create \
    --encrypted


# --hub-domain localhost
# --hub-port 3002
