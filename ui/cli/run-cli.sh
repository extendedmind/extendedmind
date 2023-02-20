#!/bin/bash
set -euo pipefail

rm -rf target/data
mkdir -p target/data
TARGET_PATH=$(echo "$(cd "$(dirname "target")"; pwd -P)/$(basename "target")")
# cargo run -- \
bazel run //ui/cli:extendedmind_cli -- \
    --data-root-dir ${TARGET_PATH}/data \
    create \
    --encrypted \
    --output ${TARGET_PATH}/secrets.txt

export $(grep -v '^#' ${TARGET_PATH}/secrets.txt | xargs)

HUB_SOCKET=$(echo "$(cd "$(dirname "../../hub/target/hub.sock")"; pwd)/$(basename "../../hub/target/hub.sock")")
SERVER_SOCKET=$(echo "$(cd "$(dirname "../../server/target/server.sock")"; pwd)/$(basename "../../server/target/server.sock")")
PORT=3002
if [ -S "$HUB_SOCKET" ]; then
    # Register created doc url to hub
    bazel run //hub:extendedmind_hub_bin -- \
          --admin-socket-file ${HUB_SOCKET} \
          register \
          --peermerge-doc-url ${PROXY_DOC_URL}
elif [ -S "$SERVER_SOCKET" ]; then
    # Register created doc url to server
    bazel run //server:extendedmind_server -- \
          --admin-socket-file ${SERVER_SOCKET} \
          register \
          --peermerge-doc-url ${PROXY_DOC_URL}
else
    echo "Neither hub nor server running, exiting"
    exit 0
fi

# Backup to hub or server
# cargo run -- \
bazel run //ui/cli:extendedmind_cli -- \
    --data-root-dir ${TARGET_PATH}/data \
    back-up \
    --hub-domain localhost \
    --hub-port ${PORT} \
    --encryption-key ${ENCRYPTION_KEY}
