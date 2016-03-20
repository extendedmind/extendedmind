#!/bin/bash

if [ -d "src/platforms/ios/cordova" ]
then
  echo "iOS already prepared, skipping."
else
  # Work in the src directory
  cd src

  # move existing iOS source code temporarily elsewhere, added back in add_plugins.js
  if [ -d "platforms/ios" ]
  then
    mv platforms/ios platforms/ios-tmp
  fi

  # add iOS platform
  ./node/node ./node_modules/.bin/cordova platform add ios@4.1.0

  # copy edited iOS sources
  cp -Rf assets/build/ios/*.m platforms/ios/extmd/Classes/

  # copy edited .plist
  cp -Rf assets/build/ios/*.plist platforms/ios/extmd/

  # clear generated Cordova icons
  rm platforms/ios/extmd/Images.xcassets/AppIcon.appiconset/*.png

  # copy icons to Cordova iOS directories and filenames
  cp -Rf assets/icons/ios/*.png platforms/ios/extmd/Images.xcassets/AppIcon.appiconset/

fi
