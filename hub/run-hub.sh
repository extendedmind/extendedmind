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
    --data-root-dir ${TARGET_PATH} --http-port 3001 --tcp-port 3002 \
    ${STATIC_OPT} \
    --skip-compress-mime application/wasm --cache-ttl-sec 300 --cache-tti-sec 60 \
    --inline-css-path /blog/* --immutable-path /_app/*.css --immutable-path /_app/*.js \
    --verbose true --log-dir ${TARGET_PATH}/logs --log-precision 18 \
    --metrics-dir ${TARGET_PATH}/logs/metrics --metrics-precision 16 \
    --metrics-endpoint /api/metrics --metrics-secret top \
    --backup-dir ${TARGET_PATH} --backup-interval-min 1 ${BACKUP_OPTS}
