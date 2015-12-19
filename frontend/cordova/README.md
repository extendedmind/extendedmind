Extended Mind - Cordova
========================

Extended Mind - Cordova builds

Android
-------

### Miminal setup

1. download and unpack Android SDK and then add [path_to_android_sdk]/tools and [path_to_android_sdk]/platform-tools to PATH.
2. run the android command
3. install SDK with API level 22

### Debugging

To get debugging on the phone using adb to work, it might be necessary in Arch linux to enable [multilib] in /etc/pacman.conf and run:

```
sudo pacman -S lib32-glibc lib32-zlib lib32-libstdc++5 lib32-ncurses lib32-gcc-libs
```

Open in Eclipse Window->Customize Perspective.. and enable Android links.
Open Window->Android SDK Manager and install API 18, API 17 and Tools.
NOTE: You need to try to install them multiple times, as everything won't be installed with one click!

Setup ANDROID_HOME enviroment variable with:
```
export ANDROID_HOME="[PATH_TO_ANDROID_SDK_FOLDER]"
```

* Import project

Window->Android Virtual Device Manager
Add Nexus 4 as "nexus4_17" using 4.2.2 and ARM.

In Eclipse Import.. Existing Android ..
Run Debug as.. Android Application
Open Logcat from Window->Show View->Android->Logcat

* Debugging on phone

``
adb devices
cordova run --device --target=[DEVICE_ID] android
```

iOS
---

Install latest XCode from App Store.
