#!/bin/bash

if [ -z "$1" ]; then
  BACKUP_LOCATION_PREFIX=/var/extendedmind/backup
else
  BACKUP_LOCATION_PREFIX=$1
fi

if [ -z "$2" ]; then
  CP_PRE_COMMAND=""
else
  CP_PRE_COMMAND=$2
fi

# Add a clean exit trap
trap 'echo exiting backup script..; exit' SIGINT SIGQUIT SIGTERM

# Poll infinitely every hour
POLL_INTERVAL=3600
while true;
do
  # Only backup if current backend is available
  IS_AVAILABLE=$(curl --write-out %{http_code} --silent --output /dev/null http://$BACKEND_PORT_8081_TCP_ADDR:8081/v2/ha/available)
  if [ $IS_AVAILABLE -eq 200 ]; then
    echo "Begin full backend backup"
    TODAY=$(date +"%Y-%m-%d")
    BACKUP_LOCATION=$BACKUP_LOCATION_PREFIX/$TODAY/
    rm -fR /usr/src/extendedmind/work
    mkdir /usr/src/extendedmind/work
    cd /usr/src/extendedmind/bin
    ./backend-backup-neo4j.sh -host $BACKEND_PORT_6362_TCP_ADDR -to /usr/src/extendedmind/work/neo4j &>> /var/log/neo4j-backup.log
    if [ $? -ne 0 ]; then
      status=$?
      echo "Problems in the backup, errored with $status"
      exit $status
    else
      BACKUP_FILE=/usr/src/extendedmind/work/em-$(date +"%Y-%m-%d-%H%M%S").tar.gz
      tar -zcf $BACKUP_FILE /usr/src/extendedmind/work/neo4j 2>&1 | grep -v 'Removing leading'

      if [ -z  $CP_PRE_COMMAND ]; then
        if [ ! -d $BACKUP_LOCATION ]; then
          mkdir -p $BACKUP_LOCATION
        fi
      fi
      echo "Executing: " $CP_PRE_COMMAND cp $BACKUP_FILE $BACKUP_LOCATION
      $CP_PRE_COMMAND cp $BACKUP_FILE $BACKUP_LOCATION
    fi
  else
    echo "Backend not available, can not backup!"
  fi
  sleep $POLL_INTERVAL
done
