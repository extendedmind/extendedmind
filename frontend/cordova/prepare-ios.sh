#!/bin/bash

if [ -d "src/platforms/ios/cordova" ]
then
  echo "iOS already prepared, skipping."
else
  # Work in the src directory
  cd src

  # Create needed empty directories
  mkdir -p platforms
  mkdir -p plugins

  # move existing iOS source code temporarily elsewhere
  mv platforms/ios platforms/ios-tmp

  # add iOS platform
  ./node/node ./node_modules/.bin/cordova platform add ios

  # copy sourced code back
  cp -R platforms/ios-tmp/* platforms/ios
  rm -rf platforms/ios-tmp

fi
