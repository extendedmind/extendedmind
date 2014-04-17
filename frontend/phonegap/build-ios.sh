#!/bin/bash

# make new iOS project from sources
cd app

# copy platform specific index file
cp -rf www/phonegap-ios.html platforms/ios/www/index.html

# make phonegap build
cordova build ios
