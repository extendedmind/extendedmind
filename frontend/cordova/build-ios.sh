#!/bin/bash

source setup-environment.sh

# make new iOS project from sources
cd app

# make phonegap build
cordova build ios
