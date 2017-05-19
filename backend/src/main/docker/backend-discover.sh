#!/bin/sh

SERVER_ID=$(($(hostname | sed s/.*-//) + 1))
echo "Guessed server id: $SERVER_ID"

if [ -z "$2" ]
then
  echo "Usage: backend-discover.sh [CONF_DIRECTORY] [DATA_DIRECTORY] [OPERATION_MODE]"
  exit 1
fi

CONF_DIRECTORY=$1
DATA_DIRECTORY=$2
NEO4J_PROPS=$CONF_DIRECTORY/neo4j.properties
OPERATION_MODE=$3
HA=false
if [ "$OPERATION_MODE" = "HA" ] || [ "$OPERATION_MODE" = "HA_BOOTSTRAP" ]; then
  HA=true
fi

# Add a clean exit trap
trap 'echo exiting generate neo4j properties script..; exit' SIGINT SIGQUIT SIGTERM

# Create/empty the properties file
> $NEO4J_PROPS
echo "dbms.backup.enabled=true" >> $NEO4J_PROPS
echo "dbms.backup.address=0.0.0.0:6362" >> $NEO4J_PROPS

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

# Now initialize application.conf using envsubst
echo Preparing /app/backend-conf/application.conf
envsubst < "/app/backend-discovery/application.conf.tmpl" > "/app/backend-conf/application.conf"

# for HA_BOOTSTRAP, server id 1 uses its database but ids > 2 need to start from an empty database 

if [ "$OPERATION_MODE" = "HA_BOOTSTRAP" ]; then
  echo HA bootstrap: also prepare databases
  NEO4J_DB=/app/backend-data/neo4j
  NEO4J_DB_PREVIOUS=/app/backend-data/neo4j-previous
  if [ -d $NEO4J_DB_PREVIOUS ]
  then
    echo "Backup directory $NEO4J_DB_PREVIOUS already exist, deleting it first"
    rm -fR $NEO4J_DB_PREVIOUS
  fi

  if [ -d $NEO4J_DB ]; then
    if [ "$SERVER_ID" = "1" ]; then
      echo "For server id 1: copy database over to $NEO4J_DB_PREVIOUS"
      cp -r $NEO4J_DB $NEO4J_DB_PREVIOUS
      rc=$?; if [[ $rc != 0 ]]; then echo "Failed copying $NEO4J_DB directory to $NEO4J_DB_PREVIOUS, are you sure it's not in use?"; exit $rc; fi
    else
      echo "For server id >1: move database over to $NEO4J_DB_PREVIOUS"
      mv $NEO4J_DB $NEO4J_DB_PREVIOUS
      rc=$?; if [[ $rc != 0 ]]; then echo "Failed moving $NEO4J_DB directory to $NEO4J_DB_PREVIOUS, are you sure it's not in use?"; exit $rc; fi
    fi
  fi
fi

# Fix permissions
chown -R 1000:1000 $CONF_DIRECTORY
chown -R 1000:1000 $DATA_DIRECTORY
if [ -d /app/backend-backup-data ]; then
  chown -R 1000:1000 /app/backend-backup-data
fi
