#!/bin/bash

# make new iOS project from sources
cd app

# copy platform specific index file
cp -rf ../src/main/resources/www/phonegap-ios.html www/index.html

# make phonegap build
cordova build ios
