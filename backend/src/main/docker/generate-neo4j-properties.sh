#!/bin/bash

SERVER_ID=$(($(hostname | sed s/.*-//) + 1))
echo "Guessed server id: $SERVER_ID"

if [ -z "$2" ]
then
  echo "Usage: generate-neo4j-properties.sh [POD_NAME] [TO_DIRECTORY] (OPERATION_MODE)"
  exit 1
fi

POD_NAME=$1
OUTPUT=$2/neo4j.properties
HA=false
if [ "$3" = "HA" ] || [ "$3" = "HA_BOOTSTRAP" ]; then
  HA=true
fi

# Add a clean exit trap
trap 'echo exiting generate neo4j properties script..; exit' SIGINT SIGQUIT SIGTERM

# Create/empty the properties file
> $OUTPUT

if [ "$HA" = false ]; then 
  echo "dbms.allow_format_migration=true" >> $OUTPUT
else
  # TODO: Use actual "replicas" value from kubernetes #31218
  echo "HA: assuming exactly 3 nodes"
  HOSTS=backend-0.backend.default.svc.cluster.local:5001,backend-1.backend.default.svc.cluster.local:5001,backend-2.backend.default.svc.cluster.local:5001
  PF=2
  echo "dbms.mode=ha" >> $OUTPUT
  echo "ha.server_id=$SERVER_ID" >> $OUTPUT
  echo "ha.initial_hosts=$HOSTS" >> $OUTPUT
  echo "ha.tx_push_factor=$PF" >> $OUTPUT
fi
