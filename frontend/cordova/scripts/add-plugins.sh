#!/bin/bash

if [ -d "src/plugins" ]
then
  echo "Plugins already added, skipping."
else

  # add plugins from sources
  cd src

  # Create needed empty directories
  mkdir -p plugins

  # Temporarily add downloaded node to path to make hooks work from inside cordova
  export PATH=$PATH:./node/

  ./node/node ./node_modules/.bin/cordova plugin add https://github.com/extendedmind/ionic-plugin-keyboard
  ./node/node ./node_modules/.bin/cordova plugin add cordova-plugin-vibration@2.1.2
  ./node/node ./node_modules/.bin/cordova plugin add cordova-plugin-media@2.4.0
  ./node/node ./node_modules/.bin/cordova plugin add cordova-plugin-splashscreen@4.0.0
  ./node/node ./node_modules/.bin/cordova plugin add https://github.com/extendedmind/Calendar-PhoneGap-Plugin.git
  ./node/node ./node_modules/.bin/cordova plugin add https://github.com/extendedmind/cordova-plugin-local-notifications.git
  ./node/node ./node_modules/.bin/cordova plugin add https://github.com/extendedmind/KeepScreenOnPlugin.git
  ./node/node ./node_modules/.bin/cordova plugin add https://github.com/extendedmind/cordova-webintent.git
  ./node/node ./node_modules/.bin/cordova plugin add https://github.com/extendedmind/phonegap-backbutton-plugin.git
  ./node/node ./node_modules/.bin/cordova plugin add cordova-plugin-device@1.1.3
  ./node/node ./node_modules/.bin/cordova plugin add cordova-plugin-whitelist@1.3.0
  ./node/node ./node_modules/.bin/cordova plugin add cordova-plugin-inappbrowser@1.5.0
  ./node/node ./node_modules/.bin/cordova plugin add cordova-plugin-globalization@1.0.4
  ./node/node ./node_modules/.bin/cordova plugin add https://github.com/extendedmind/cordova-plugin-nsuserdefaults-for-app-groups

  if [ -d "platforms/android" ]
  then
    # copy AndroidManifest.xml
    cp -f assets/build/android/AndroidManifest.xml platforms/android/
  fi
fi
