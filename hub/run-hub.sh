#!/bin/bash
BACKUP_OPTS=""
if [ -n "$1" ]; then
    BACKUP_OPTS="--backup-ssh-recipients-file $1"
fi

set -euo pipefail

mkdir -p target/data
TARGET_PATH=$(echo "$(cd "$(dirname "target")"; pwd -P)/$(basename "target")")
../ui/web/node_modules/.bin/ibazel run //hub:extendedmind_hub_bin -- \
    --data-root-dir ${TARGET_PATH}/data \
    --tcp-port 3000 \
    --verbose true \
    --backup-dir ${TARGET_PATH} --backup-interval-min 1 ${BACKUP_OPTS}
