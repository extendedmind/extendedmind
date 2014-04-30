#!/bin/bash

source setup-environment.sh

if [ -d "app/platforms/ios" ]
then
  echo "iOS already prepared, skipping."
else
  # Work in the app directory
  cd app

  # Create needed empty directories
  mkdir -p platforms
  mkdir -p plugins

  # add iOS platform
  cordova platform add ios
fi
