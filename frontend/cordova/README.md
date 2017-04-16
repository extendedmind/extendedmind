Extended Mind - Cordova
========================

Extended Mind - Cordova builds

Android
-------

### Miminal setup

1. download and install Android Studio, and setup ANDROID_HOME enviroment variable with:
```
export ANDROID_HOME="[PATH_TO_ANDROID_SDK_FOLDER]"
```

e.g. typically on OSX:

```
export ANDROID_HOME="$HOME/Library/Android/sdk"
```

and then add $ANDROID_HOME/tools and $ANDROID_HOME/platform-tools to PATH.
2. run `$ANDROID_HOME/tools/android` command
3. install SDK with API level 24

### Debugging on phone

```
adb devices
cd src
./node_modules/.bin/cordova run --device --target=[DEVICE_ID] android
```

iOS
---

Install latest XCode and Xcode Command Line Tools from the App Store.

Updating plugins
----------------

Steps needed in XCode when updating cordova sources to new version, so that share extension is back.

1. Prevent everything from src/platform/ios to be copied over Cordova generated sources, by editing the end of add-plugins.sh.
2. Open the extmd Cordova project the way Cordova generated it.
3. See that the project compiles and installs.
4. Add a new target to the project by clicking "extmd" next to the General tab in the project settings, and from there selecting "Add target..".
5. Select Application Extension -> Share Extension.
6. Set "extmd-share" as the product name, "Extended Mind Technologies Oy" as the organization name, and change language to Swift.
7. Change deployment target in the extmd-share target match extmd app.
8. Resurrect Bridging-Header.h file and under extmd-share -> Build Settings (select show All) -> Swift Compiler Code Generation -> Objective C Bridging Header select "$(PROJECT_DIR)/extmd-share/Bridging-Header.h".
9. Resurrect SharePreprocessor.js and add is as new source to the project.
10. Resurrect images.xcassets and add it to the share extension.
11. Select the Capabilities tab and turn on App Groups for both extmd-share and extmd.
12. Replace content in ShareViewController.swift with code from version control.
13. Replace content in info.plist with code from version control.
14. Select "Use Legacy Swift Language Version" to Yes and iOS deployment version to match main project version.
