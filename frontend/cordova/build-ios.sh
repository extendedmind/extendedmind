#!/bin/bash

# make new iOS project from sources
cd src

# Temporarily add downloaded node to path to make hooks work from inside cordova
export PATH=$PATH:./node/

# make cordova build
./node/node ./node_modules/.bin/cordova build ios
