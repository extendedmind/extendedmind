Extended Mind - Cordova
========================

Extended Mind - Cordova builds

Cordova
-------

* Arch Linux

sudo pacman -S npm
export NODE_PATH="/usr/lib/node_modules"
sudo npm install -g cordova shelljs

* Mac

brew install nodejs
export NODE_PATH="/usr/local/lib/node_modules"
sudo npm install -g cordova shelljs

Android
-------

Download android-sdk
Add android-sdk-linux/tools and /platform-tools to PATH (Platform tools does not exist at this point but add it anyway).
Install ADT Tools to Eclipse

To get adb to run, it might be necessary in Arch linux to enable [multilib] in /etc/pacman.conf and run:
sudo pacman -S lib32-glibc lib32-zlib lib32-libstdc++5 lib32-ncurses lib32-gcc-libs

Open in Eclipse Window->Customize Perspective.. and enable Android links.
Open Window->Android SDK Manager and install API 18, API 17 and Tools.
NOTE: You need to try to install them multiple times, as everything won't be installed with one click!

Setup ANDROID_HOME enviroment variable with:
export ANDROID_HOME="[PATH_TO_ANDROID_SDK_FOLDER]"

* Import project

Window->Android Virtual Device Manager
Add Nexus 4 as "nexus4_17" using 4.2.2 and ARM.

In Eclipse Import.. Existing Android ..
Run Debug as.. Android Application
Open Logcat from Window->Show View->Android->Logcat


* Debugging on phone

adb devices
cordova run --device --target=[DEVICE_ID] android

iOS
---

TODO
