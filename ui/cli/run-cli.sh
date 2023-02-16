#!/bin/bash
set -euo pipefail

rm -rf target/data
mkdir -p target/data
TARGET_PATH=$(echo "$(cd "$(dirname "target")"; pwd -P)/$(basename "target")")
bazel run //ui/cli:extendedmind_cli -- \
    --data-root-dir ${TARGET_PATH}/data \
    create \
    --encrypted \
    --output ${TARGET_PATH}/secrets.txt

export $(grep -v '^#' ${TARGET_PATH}/secrets.txt | xargs)

echo "HELO ${DOC_URL}"

# --hub-domain localhost
# --hub-port 3002
