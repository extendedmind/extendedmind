#!/bin/bash
echo "starting phonegap build.sh"

# only for xcrun, Xcode build tool
# must install xcode xmd-line tools before using
PROVISIONING_PROFILE=$1
KEYCHAIN_PASSWORD=$2
RELEASE_BUILDDIR="app/platforms/ios/build/device"
BUILD_HISTORY_DIR="app/platforms/ios/build/archive"
APPLICATION_NAME="em"
CONFIGURATION_NAME="Release"
CODE_SIGN_IDENTITY="iPhone Distribution"
PROVISIONING_UUID="A6105942-B272-4FB0-BCB3-4999C39A7F70"

echo "unlocking security keychain"
security unlock-keychain -p ${KEYCHAIN_PASSWORD} /Users/Xcloud/Library/Keychains/Jenkins.keychain

echo "running .. phonegap build iOS"
# make new iOS project from sources
cd app

# make sure cordova assets are updated
# phonegap platform update ios

# make phonegap build? (maybe not needed)
cordova build ios

## change dir:
cd platforms/ios

# build xcode
xcodebuild -scheme em -configuration "${CONFIGURATION_NAME}" clean build archive -archivePath "build/archive" CODE_SIGN_IDENTITY="${CODE_SIGN_IDENTITY}" PROVISIONING_PROFILE="${PROVISIONING_UUID}" | grep -A 5 error

# makedir
rm -f build/package/release.ipa
mkdir -p build/package

# package for distribution
xcodebuild -archivePath "build/archive.xcarchive" -exportPath 'build/package/release' -exportArchive