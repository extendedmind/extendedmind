#!/bin/bash
STATIC_OPT=""
if [ -n "$1" ]; then
    STATIC_OPT="--static-root-dir $1"
fi

set -euo pipefail

mkdir -p target
TARGET_PATH=$(echo "$(cd "$(dirname "target")"; pwd -P)/$(basename "target")")
../ui/web/node_modules/.bin/ibazel run //hub:extendedmind_hub -- \
    --data-root-dir ${TARGET_PATH} --http-port 3001 --tcp-port 3002 ${STATIC_OPT} \
    --skip-compress-mime application/wasm --cache-ttl-sec 300 --cache-tti-sec 60 \
    --inline-css-path /blog/*
