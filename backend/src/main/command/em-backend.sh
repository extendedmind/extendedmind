#!/bin/bash
if [ $# -eq 0 ]
  then
    echo "No arguments supplied"
else
  java -Dconfig.file=$1 -Dlogback.configurationFile=$2 -cp "/usr/src/extendedmind/lib/*" org.extendedmind.Server
fi
