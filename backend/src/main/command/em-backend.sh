#!/bin/bash
if [ $# -eq 0 ]
  then
    echo "No arguments supplied"
else
  export LOGBACK_CONFIG_FILE_LOCATION=$2
  java -Dconfig.file=$1 -Dlogback.configurationFile$
fi
