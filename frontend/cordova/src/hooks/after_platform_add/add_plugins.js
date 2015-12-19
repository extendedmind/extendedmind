#!/usr/bin/env node

//this hook installs all your plugins

var pluginlist = [
    "https://github.com/extendedmind/ionic-plugin-keyboard.git",
    "cordova-plugin-vibration@1.2.0",
    "cordova-plugin-media@1.0.1",
    "https://github.com/apache/cordova-plugin-splashscreen.git#r2.1.0",
    "https://github.com/extendedmind/Calendar-PhoneGap-Plugin.git",
    "https://github.com/extendedmind/cordova-plugin-local-notifications.git",
    "https://github.com/extendedmind/KeepScreenOnPlugin.git",
    "https://github.com/extendedmind/cordova-webintent.git",
    "https://github.com/extendedmind/phonegap-backbutton-plugin.git",
    "cordova-plugin-device@1.0.1",
    "cordova-plugin-whitelist@1.0.0",
    "cordova-plugin-inappbrowser@1.0.1",
    "cordova-plugin-globalization@1.0.1",
    "https://github.com/extendedmind/cordova-plugin-nsuserdefaults-for-app-groups"
];

// no need to configure below

var fs = require('fs');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;

var cmd = "";
for (var i=0; i < (pluginlist.length); i++){
  if (i>0){
    cmd += " && ";
  }
  cmd += "cordova plugin add " + pluginlist[i];
}

function puts(error, stdout, stderr) {
  sys.puts(stdout)
}
exec(cmd, puts);
