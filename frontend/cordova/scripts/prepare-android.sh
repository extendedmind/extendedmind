#!/bin/bash

# check required environment variables are there
: ${ANDROID_HOME:?"Need to set ANDROID_HOME non-empty"}

if [ -d "src/platforms/android" ]
then
  echo "Android already prepared, skipping."
else
  # Work in the src directory
  cd src

  # add android platform
  ./node/node ./node_modules/.bin/cordova platform add android@6.2.1

  # copy java sources
  if [ -d "platforms/android/src/org/extendedmind/nightly" ]
  then
    cp -f assets/build/android/*.java platforms/android/src/org/extendedmind/nightly/
  else
    cp -f assets/build/android/*.java platforms/android/src/org/extendedmind/
  fi

  # Delete generated drawable directories to avoid Cordova splash from appearing anywhere
  rm -rf platforms/android/res/drawable*

  drawables=( "-hdpi" "-mdpi" "-xhdpi" "-xxhdpi" "-xxxhdpi" )

  for item in "${drawables[@]}"
  do
    # create directory
    mkdir platforms/android/res/drawable${item}
    # icon
    cp -f assets/icons/android/*${item}.png platforms/android/res/drawable${item}/icon.png
    # splash
    cp -f assets/screens/android/*${item}.png platforms/android/res/drawable${item}/splash.9.png
  done

  # Use XHDPI as default size
  mkdir platforms/android/res/drawable
  cp -f assets/icons/android/icon-96-xhdpi.png platforms/android/res/drawable/icon.png
  cp -f assets/screens/android/launch-xhdpi.png platforms/android/res/drawable/splash.9.png

  # copy build properties
  cp -f assets/build/android/build-extras.gradle platforms/android/

fi
