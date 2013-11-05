#!/bin/bash
if [ $# -eq 0 ]
  then
    echo "First argument is the path to the configuration file"
else
  java -Dconfig.file=$1 -cp "../lib/*" org.extendedmind.Server
fi
