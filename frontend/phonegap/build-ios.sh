#!/bin/bash

# make new iOS project from sources
cd app

# make phonegap build
cordova build ios

# copy platform specific index file
cp -rf www/phonegap-ios.html platforms/ios/www/index.html
