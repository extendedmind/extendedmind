#!/bin/bash

if [ -z "$2" ]
then
  echo "Usage: sync-folder.sh [FROM_LOCATION] [TO_DIRECTORY] ([RSYNC PREFIX])"
  exit 1
fi

FROM_LOCATION=$1
TO_DIRECTORY=$2

if [ -z "$3" ]; then
  RSYNC_PRE_COMMAND=""
else
  RSYNC_PRE_COMMAND=$3
fi

if [ ! -d $TO_DIRECTORY ]
then
  mkdir -p $TO_DIRECTORY
fi

# Add a clean exit trap
trap 'echo exiting sync folder script..; exit' SIGINT SIGQUIT SIGTERM

echo "Executing:" $RSYNC_PRE_COMMAND rsync -r -d $FROM_LOCATION $TO_DIRECTORY
$RSYNC_PRE_COMMAND rsync -r -d $FROM_LOCATION $TO_DIRECTORY
