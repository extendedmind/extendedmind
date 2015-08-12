#!/bin/bash

if [ -z "$2" ]
then
  echo "Usage: backend-restore.sh [BACKUP_TAR_GZ_FILE] [NEO4J_DIRECTORY_LOCATION]"
  exit 1
fi

BACKUP_FILE=$1
NEO4J_DIRECTORY=$2
NEO4J_DB="$NEO4J_DIRECTORY/neo4j"
NEO4J_DB_BAK="$NEO4J_DIRECTORY/neo4j-bak" 

if [ ! -d $NEO4J_DIRECTORY ]
then
  echo "Directory: $NEO4j_DIRECTORY does not exist, exiting."
  exit 2
fi

if [ -z "$3" ]
then
  CP_PRE_COMMAND=""
else
  CP_PRE_COMMAND=$3
fi

# Add a clean exit trap
trap 'echo exiting restore script..; exit' SIGINT SIGQUIT SIGTERM

# Begin restore process
echo "Begin restore from file: $BACKUP_FILE to $NEO4J_DIRECTORY"

# Empty work directory
rm -fR /usr/src/extendedmind/work
mkdir /usr/src/extendedmind/work
echo "Executing: $CP_PRE_COMMAND cp $BACKUP_FILE  /usr/src/extendedmind/work/backup.tar.gz"
$CP_PRE_COMMAND cp $BACKUP_FILE /usr/src/extendedmind/work/backup.tar.gz
rc=$?; if [[ $rc != 0 ]]; then echo "Failed copying backup file $BACKUP_FILE"; exit $rc; fi

# Unpack tar.gz backup file
tar -xzf /usr/src/extendedmind/work/backup.tar.gz -C /usr/src/extendedmind/work
rc=$?; if [[ $rc != 0 ]]; then
  echo "Failed unpacking .tar.gz backup file $BACKUP_FILE, exiting";
  exit $rc;
fi

if [ ! -d /usr/src/extendedmind/work/neo4j ]
then
  echo "Backup file $BACKUP_FILE does not contain folder neo4j, exiting."
  exit 3
fi

if [ -d $NEO4J_DB_BAK ]
then
  echo "Backup directory $NEO4J_DB_BAK already exist, deleting it first"
  rm -fR $NEO4J_DB_BAK
fi

mv $NEO4J_DB $NEO4J_DB_BAK
rc=$?; if [[ $rc != 0 ]]; then echo "Failed moving neo4j directory to bak, are you sure it's not in use?"; exit $rc; fi

mv /usr/src/extendedmind/work/neo4j $NEO4J_DB
echo "Restore complete"
exit 0;
