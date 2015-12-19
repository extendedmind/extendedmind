#!/bin/bash

source setup-environment.sh

# make new iOS project from sources
cd src

# make phonegap build
cordova build ios
