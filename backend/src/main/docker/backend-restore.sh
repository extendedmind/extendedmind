#!/bin/bash

if [ -z "$3" ]
then
  echo "Usage: backend-restore.sh [BACKUP_TAR_GZ_FILE] [NEO4J_DIRECTORY_LOCATION] [OPERATION_MODE] ([COPY_PRE_COMMOND])"
  exit 1
fi

if [ "$3" = "HA_BOOTSTRAP" ]; then
  SERVER_ID=$(cat /app/backend-conf/neo4j.properties | grep ha.server_id= | cut -d'=' -f 2)
elif [ "$3" = "SINGLE" ]; then
  SERVER_ID=1
else
  echo Restoring only possible for operation modes HA_BOOTSTRAP and SINGLE
  exit 2
fi

if [ "$SERVER_ID" = "1" ]; then 

  BACKUP_FILE=$1
  NEO4J_DIRECTORY=$2
  NEO4J_DB="$NEO4J_DIRECTORY/neo4j"
  NEO4J_DB_BAK="$NEO4J_DIRECTORY/neo4j-bak" 
  
  if [ ! -d $NEO4J_DIRECTORY ]
  then
    echo "Directory: $NEO4j_DIRECTORY does not exist, exiting."
    exit 2
  fi

  if [ -z "$4" ]
  then
    CP_PRE_COMMAND=""
  else
    CP_PRE_COMMAND=$4
  fi

  # Add a clean exit trap
  trap 'echo exiting restore script..; exit' SIGINT SIGQUIT SIGTERM

  # Begin restore process
  echo "Begin restore from file: $BACKUP_FILE to $NEO4J_DIRECTORY"

  # Empty work directory
  rm -fR work
  mkdir work
  echo "Executing: $CP_PRE_COMMAND cp $BACKUP_FILE work/backup.tar.gz"
  $CP_PRE_COMMAND cp $BACKUP_FILE work/backup.tar.gz
  rc=$?; if [[ $rc != 0 ]]; then echo "Failed copying backup file $BACKUP_FILE"; exit $rc; fi

  # Unpack tar.gz backup file
  tar -xzf work/backup.tar.gz -C work
  rc=$?; if [[ $rc != 0 ]]; then
    echo "Failed unpacking .tar.gz backup file $BACKUP_FILE, exiting";
    exit $rc;
  fi

  if [ ! -d work/neo4j ]
  then
    echo "Backup file $BACKUP_FILE does not contain folder neo4j, exiting."
    exit 3
  fi

  if [ -d $NEO4J_DB_BAK ]
  then
    echo "Backup directory $NEO4J_DB_BAK already exist, deleting it first"
    rm -fR $NEO4J_DB_BAK
  fi

  if [ -d $NEO4J_DB ]; then
    mv $NEO4J_DB $NEO4J_DB_BAK
    rc=$?; if [[ $rc != 0 ]]; then echo "Failed moving neo4j directory to bak, are you sure it's not in use?"; exit $rc; fi
  fi

  mv work/neo4j $NEO4J_DB
  echo "Restore complete"
else
  echo Only restore database for server id 1
fi
exit 0;
