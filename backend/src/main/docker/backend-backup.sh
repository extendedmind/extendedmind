#!/bin/bash

if [ -z "$3" ]
then
  echo "Usage: backend-backup.sh [BACKEND_HOST] [BACKUP_LOCATION_PREFIX] [BACKUP_BUFFER_IN_DAYS] ([FS_PRE_COMMAND])"
  exit 1
fi

BACKEND_HOST=$1
BACKUP_LOCATION_PREFIX=$2
BACKUP_BUFFER=$3

if [ -z "$4" ]; then
  FS_PRE_COMMAND=""
else
  FS_PRE_COMMAND=$4
fi

# Add a clean exit trap
trap 'echo exiting backup script..; exit' SIGINT SIGQUIT SIGTERM

# Only backup if current backend is available
IS_AVAILABLE=$(curl --write-out %{http_code} --silent --output /dev/null http://$BACKEND_HOST:8081/v2/ha/available)
if [ $IS_AVAILABLE -eq 200 ]; then
  echo "Begin full backend backup"
  TODAY=$(date +"%Y-%m-%d")
  BACKUP_LOCATION=$BACKUP_LOCATION_PREFIX/$TODAY/
  rm -fR work
  mkdir work
  cd bin
  ./backend-admin-neo4j.sh backup --backup-dir=../work --name=neo4j --from=$BACKEND_HOST:6362
  status=$?
  if [ $status -ne 0 ]; then
    echo "Problems in the backup, errored with $status"
    exit $status
  else
    cd ../work
    BACKUP_FILE=em-$(date +"%Y-%m-%d-%H%M%S").tar.gz
    tar -zcf $BACKUP_FILE neo4j 2>&1 | grep -v 'Removing leading'

    # When not using a pre-command, such as "gsutil" directories will have to be created
    if [ -z  $FS_PRE_COMMAND ]; then
      if [ ! -d $BACKUP_LOCATION ]; then
        mkdir -p $BACKUP_LOCATION
      fi
    fi

    echo "Executing: " $FS_PRE_COMMAND cp $BACKUP_FILE $BACKUP_LOCATION
    $FS_PRE_COMMAND cp $BACKUP_FILE $BACKUP_LOCATION

    # Now also check if there are too many days worth of backups
    if [ "$FS_PRE_COMMAND" = "gsutil" ]; then
      NUMBER_OF_DIRS=$($FS_PRE_COMMAND ls $BACKUP_LOCATION_PREFIX | grep ^gs: | wc -l)
    else
      NUMBER_OF_DIRS=$($FS_PRE_COMMAND ls -l $BACKUP_LOCATION_PREFIX | grep ^d | wc -l)
    fi

    if [ "$NUMBER_OF_DIRS" -gt "$BACKUP_BUFFER" ]; then
      echo There are $NUMBER_OF_DIRS worth of backups but the given buffer is only $BACKUP_BUFFER, cleaning up

      # Get the oldest directory...
      if [ "$FS_PRE_COMMAND" = "gsutil" ]; then
        OLDEST_DIR=$($FS_PRE_COMMAND ls $BACKUP_LOCATION_PREFIX | grep ^gs: | head -1)
      else
        FIRST_DIR_LINE=$($FS_PRE_COMMAND ls -l $BACKUP_LOCATION_PREFIX | grep ^d | head -1 )
        OLDEST_DIR=$BACKUP_LOCATION_PREFIX/${FIRST_DIR_LINE##* }
      fi

      # ...and then delete it
      echo "Executing: " $FS_PRE_COMMAND rm -rf $OLDEST_DIR
      $FS_PRE_COMMAND rm -rf $OLDEST_DIR
    else
      echo There are $NUMBER_OF_DIRS worth of backups and the given buffer $BACKUP_BUFFER, no need to clean up.
    fi
  fi
else
  echo "Backend not available, can not backup!"
fi
