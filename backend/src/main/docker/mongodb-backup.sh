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
trap 'echo exiting mongodb backup script..; exit' SIGINT SIGQUIT SIGTERM

# Poll infinitely every hour and one minute
POLL_INTERVAL=3660
while true;
do
  # Only backup if current mongodb instance is master
  echo "Trying to connect to mongo database at" $MONGODB_PORT_27017_TCP_ADDR
  IS_MASTER=$(mongo --host $MONGODB_PORT_27017_TCP_ADDR --quiet --eval "d=db.isMaster(); print( d['ismaster'] );")
  if [ "$IS_MASTER" == "true" ]; then
    echo "Begin full mongodb backup"
    TODAY=$(date +"%Y-%m-%d")
    BACKUP_LOCATION=$BACKUP_LOCATION_PREFIX/$TODAY/
    rm -fR /usr/src/extendedmind/work
    mkdir /usr/src/extendedmind/work
    cd /usr/src/extendedmind/work
    mongodump --host $MONGODB_PORT_27017_TCP_ADDR  &>> /var/log/mongodb-backup.log
    if [ $? -ne 0 ]; then
      echo "Problems in the mongodb backup, mongodump returned:" $?
    else
      if [ -d /usr/src/extendedmind/work/dump ]; then
        BACKUP_FILE=/usr/src/extendedmind/work/mongodb-$(date +"%Y-%m-%d-%H%M%S").tar.gz
        tar -zcf $BACKUP_FILE /usr/src/extendedmind/work/dump 2>&1 | grep -v 'Removing leading'
        if [ -z  $CP_PRE_COMMAND ]; then
          if [ ! -d $BACKUP_LOCATION ]; then
            mkdir -p $BACKUP_LOCATION
          fi
        fi
        echo "Executing:" $CP_PRE_COMMAND cp $BACKUP_FILE $BACKUP_LOCATION
        $CP_PRE_COMMAND cp $BACKUP_FILE $BACKUP_LOCATION
      else
        echo "Apparently there is no data in the mongodb database, skipping backup"
      fi
    fi
  fi
  sleep $POLL_INTERVAL
done
