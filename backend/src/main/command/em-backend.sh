#!/bin/bash
if [ $# -eq 0 ]
  then
    echo "No arguments supplied"
else
  java -Dconfig.file=$1 -cp "../lib/*" org.extendedmind.Server
fi

