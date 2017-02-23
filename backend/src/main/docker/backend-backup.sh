#!/bin/bash

if [ -z "$1" ]; then
  BACKUP_LOCATION_PREFIX=backup
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

# Only backup if current backend is available
IS_AVAILABLE=$(curl --write-out %{http_code} --silent --output /dev/null http://backend:8081/v2/ha/available)
if [ $IS_AVAILABLE -eq 200 ]; then
  echo "Begin full backend backup"
  TODAY=$(date +"%Y-%m-%d")
  BACKUP_LOCATION=$BACKUP_LOCATION_PREFIX/$TODAY/
  rm -fR work
  mkdir work
  cd bin
  ./backend-backup-neo4j.sh -host backend -to ../work/neo4j
  status=$?
  if [ $status -ne 0 ]; then
    echo "Problems in the backup, errored with $status"
    exit $status
  else
    cd ..
    BACKUP_FILE=work/em-$(date +"%Y-%m-%d-%H%M%S").tar.gz
    tar -zcf $BACKUP_FILE work/neo4j 2>&1 | grep -v 'Removing leading'

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
