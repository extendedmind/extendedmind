#!/bin/sh

SERVER_ID=$(($(hostname | sed s/.*-//) + 1))
echo "Guessed server id: $SERVER_ID"

if [ -z "$2" ]
then
  echo "Usage: discover-backend.sh [CONF_DIRECTORY] [DATA_DIRECTORY] (OPERATION_MODE)"
  exit 1
fi

CONF_DIRECTORY=$1
DATA_DIRECTORY=$2
NEO4J_PROPS=$CONF_DIRECTORY/neo4j.properties
HA=false
if [ "$3" = "HA" ] || [ "$3" = "HA_BOOTSTRAP" ]; then
  HA=true
fi

# Add a clean exit trap
trap 'echo exiting generate neo4j properties script..; exit' SIGINT SIGQUIT SIGTERM

# Create/empty the properties file
> $NEO4J_PROPS

if [ "$HA" = false ]; then 
  echo "dbms.allow_format_migration=true" >> $NEO4J_PROPS
else
  # TODO: Use actual "replicas" value from kubernetes #31218
  echo "HA: assuming exactly 3 nodes"
  HOSTS=backend-0.backend.default.svc.cluster.local:5001,backend-1.backend.default.svc.cluster.local:5001,backend-2.backend.default.svc.cluster.local:5001
  PF=2
  echo "dbms.mode=ha" >> $NEO4J_PROPS
  echo "ha.server_id=$SERVER_ID" >> $NEO4J_PROPS
  echo "ha.initial_hosts=$HOSTS" >> $NEO4J_PROPS
  echo "ha.tx_push_factor=$PF" >> $NEO4J_PROPS
fi

# Fix permissions
chown -R 1000:1000 $CONF_DIRECTORY
chown -R 1000:1000 $DATA_DIRECTORY
