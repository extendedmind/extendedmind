#!/bin/bash
echo "starting phonegap build.sh"

# make new iOS project from sources
cd app

# make phonegap build
cordova build ios
