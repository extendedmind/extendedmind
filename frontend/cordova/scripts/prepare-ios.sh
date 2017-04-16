#!/bin/bash

if [ -d "src/platforms/ios/cordova" ]
then
  echo "iOS already prepared, skipping."
else
  # Work in the src directory
  cd src

  # add iOS platform
  ./node/node ./node_modules/.bin/cordova platform add ios@4.3.1

  # copy edited iOS sources
  cp -Rf assets/build/ios/*.m platforms/ios/$1/Classes/

  # copy edited .plist
  cp -Rf assets/build/ios/*.plist platforms/ios/$1/

  # clear generated Cordova icons
  rm platforms/ios/$1/Images.xcassets/AppIcon.appiconset/*.png

  # copy icons to Cordova iOS directories and filenames
  cp -Rf assets/icons/ios/*.png platforms/ios/$1/Images.xcassets/AppIcon.appiconset/

fi
