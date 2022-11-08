#!/bin/bash
set -euo pipefail

mkdir -p target
rm -rf target/true.db
TARGET_PATH=$(echo "$(cd "$(dirname "target")"; pwd -P)/$(basename "target")")
PUBLIC_KEY=$(cat ../../hub/target/KEY.txt)
bazel run //ui/cli:extendedmind_cli -- ${TARGET_PATH} localhost:3002 $PUBLIC_KEY
