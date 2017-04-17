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
