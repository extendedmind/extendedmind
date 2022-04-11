#!/bin/bash
set -euo pipefail

mkdir -p target
TARGET_PATH=$(echo "$(cd "$(dirname "target")"; pwd -P)/$(basename "target")")
../ui/web/node_modules/.bin/ibazel run //hub:extendedmind_hub -- --data-root-dir ${TARGET_PATH} --http-port 3001 --tcp-port 3002
