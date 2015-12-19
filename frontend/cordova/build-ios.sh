#!/bin/bash

# make new iOS project from sources
cd src

# make cordova build
./node/node ./node_modules/.bin/cordova build ios
