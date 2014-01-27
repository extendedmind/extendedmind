#!/bin/bash
echo "starting phonegap build.sh"

# only for xcrun, Xcode build tool
# must install xcode xmd-line tools before using
PROVISIONING_PROFILE=$1
KEYCHAIN_PASSWORD=$2
RELEASE_BUILDDIR="app/platforms/ios/build/device"
BUILD_HISTORY_DIR="app/platforms/ios/build/archive"
APPLICATION_NAME="em"
CONFIGURATION="Release"
DEVELOPER_NAME="iPhone\ Distribution:\ Extended\ Mind\ Technologies\ Oy\ (Z9X5PYT4CA)"
PROVISIONING_UUID="9F8C79AB-2F00-46EE-9250-FB8962687B77"

echo "unlocking security keychain"
security unlock-keychain -p KEYCHAIN_PASSWORD

echo "running .. phonegap build iOS"
# make new iOS project from sources
cd app

# make sure cordova assets are updated
cordova platform update ios

# make build
phonegap build ios

#/usr/bin/xcrun -sdk iphoneos PackageApplication -v "${RELEASE_BUILDDIR}/${APPLICATION_NAME}.app" -o "${BUILD_HISTORY_DIR}/${APPLICATION_NAME}.ipa" --sign "${DEVELOPER_NAME}" --embed "${PROVISONING_PROFILE}"

## change dir:
cd platforms/ios

# builds .xcarchive file that is archive of the build, but not packaged for distribution
xcodebuild -scheme em -configuration ${CONFIGURATION} -sdk iphoneos archive -archivePath "~/Desktop/em" CODE_SIGN_IDENTITY="${DEVELOPER_NAME}" PROVISIONING_PROFILE="${PROVISIONING_UUID}"
# xcodebuild -exportArchive -exportFormat IPA -archivePath MyMacApp.xcarchive -exportPath em-testflight.ipa # -exportSigningIdentity 'Developer ID Application: My Team'

# package for distribution
xcodebuild -archivePath ~/Desktop/em.xcarchive -exportPath '~/Desktop/emrelease' -exportArchive