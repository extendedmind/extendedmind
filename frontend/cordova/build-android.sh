#!/bin/bash

source ./setup-environment.sh

# check required environment variables are there
: ${ANDROID_HOME:?"Need to set ANDROID_HOME non-empty"}

# new dir
cd src

# run phonegap command locally
cordova build android --release
