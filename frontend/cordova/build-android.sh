#!/bin/bash

# check required environment variables are there
: ${ANDROID_HOME:?"Need to set ANDROID_HOME non-empty"}

# new dir
cd src

# run cordova command locally
./node/node ./node_modules/.bin/cordova build android --release
