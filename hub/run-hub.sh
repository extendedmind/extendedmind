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

mkdir -p target/logs/metrics
TARGET_PATH=$(echo "$(cd "$(dirname "target")"; pwd -P)/$(basename "target")")
../ui/web/node_modules/.bin/ibazel run //hub:extendedmind_hub -- \
    --admin-socket-file ${TARGET_PATH}/extendedmind_hub.sock \
    --data-root-dir ${TARGET_PATH} --http-port 3001 \
    ${STATIC_OPT} \
    --skip-compress-mime application/wasm --skip-compress-mime application/json \
    --cache-ttl-sec 5 --cache-tti-sec 5 \
    --inline-css-path /blog/* --immutable-path /_app/*.css --immutable-path /_app/*.js \
    --inline-css-skip-referer http://localhost* \
    --verbose true --log-dir ${TARGET_PATH}/logs --log-precision 18 \
    --metrics-dir ${TARGET_PATH}/logs/metrics --metrics-precision 16 \
    --metrics-endpoint /api/metrics --metrics-secret top \
    --backup-dir ${TARGET_PATH} --backup-interval-min 1 ${BACKUP_OPTS}
