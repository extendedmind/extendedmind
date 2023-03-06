#!/bin/bash
STATIC_OPT=""
if [ -n "$1" ]; then
    STATIC_OPT="--static-root-dir $1"
fi

BACKUP_OPTS=""
if [ -n "$2" ]; then
    BACKUP_OPTS="--backup-ssh-recipients-file $2"
fi

set -euo pipefail

mkdir -p target/data
mkdir -p target/logs/metrics
TARGET_PATH=$(echo "$(cd "$(dirname "target")"; pwd -P)/$(basename "target")")
# bazel run //server:extendedmind_server -- \
# ../ui/web/node_modules/.bin/ibazel run //server:extendedmind_server -- \
cargo run -- \
    --admin-socket-file ${TARGET_PATH}/server.sock \
    --verbose true \
    start \
    --data-root-dir ${TARGET_PATH}/data \
    --http-port 3001 \
    --tcp-port 3002 \
    ${STATIC_OPT} \
    --skip-compress-mime application/wasm \
    --cache-ttl-sec 60 --cache-tti-sec 60 --cache-max-size 60000 \
    --inline-css-path /blog/* --immutable-path /_app/*.css --immutable-path /_app/*.js \
    --inline-css-skip-referer http://localhost* \
    --log-dir ${TARGET_PATH}/logs --log-precision 18 \
    --metrics-dir ${TARGET_PATH}/logs/metrics --metrics-precision 16 \
    --metrics-endpoint /api/metrics --metrics-secret top \
    --backup-dir ${TARGET_PATH} --backup-interval-min 10 ${BACKUP_OPTS}
