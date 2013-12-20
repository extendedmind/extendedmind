#!/bin/bash

echo "starting phonegap build.sh"
echo $1
echo $2

# copy www source files to project
cp -rf www app/

echo "running .. phonegap build iOS"
# make new iOS project from sources
cd app
phonegap build ios

# only for xcrun, Xcode build tool
# must install xcode xmd-line tools before using
RELEASE_BUILDDIR="app/platforms/ios/build/device"
BUILD_HISTORY_DIR="app/platforms/ios/build/archive"
APPLICATION_NAME="em"
CONFIGURATION="Release"
DEVELOPER_NAME="iPhone\ Distribution:\ Extended\ Mind\ Technologies\ Oy\ (Z9X5PYT4CA)"
PROVISONING_PROFILE="phonegap_certs/Testflight_Distribution_Profile.mobileprovision"
PROVISIONING_UUID="lkqwjrkl-rqwljk-qwrkjl"
#/usr/bin/xcrun -sdk iphoneos PackageApplication -v "${RELEASE_BUILDDIR}/${APPLICATION_NAME}.app" -o "${BUILD_HISTORY_DIR}/${APPLICATION_NAME}.ipa" --sign "${DEVELOPER_NAME}" --embed "${PROVISONING_PROFILE}"

## this is enough to make a build:
cd platforms/ios
xcodebuild -scheme em -configuration ${CONFIGURATION} -sdk iphoneos CODE_SIGN_IDENTITY="${DEVELOPER_NAME}" PROVISIONING_PROFILE="${PROVISIONING_UUID}"