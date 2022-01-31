#!/bin/bash
set -euo pipefail

mkdir -p target
TARGET_PATH=$(echo "$(cd "$(dirname "target")"; pwd -P)/$(basename "target")")
../ui/web/node_modules/.bin/ibazel run //hub:extendedmind_hub -- 3001 ${TARGET_PATH} ${TARGET_PATH}
