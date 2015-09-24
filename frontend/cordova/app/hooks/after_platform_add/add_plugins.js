#!/usr/bin/env node

//this hook installs all your plugins

var pluginlist = [
    "https://github.com/extendedmind/ionic-plugin-keyboard",
    "cordova-plugin-vibration",
    "cordova-plugin-media",
    "https://github.com/apache/cordova-plugin-splashscreen.git",
    "https://github.com/extendedmind/Calendar-PhoneGap-Plugin.git",
    "https://github.com/extendedmind/cordova-plugin-local-notifications",
    "https://github.com/leohenning/KeepScreenOnPlugin",
    "https://github.com/extendedmind/cordova-webintent",
    "https://github.com/extendedmind/phonegap-backbutton-plugin",
    "cordova-plugin-device",
    "cordova-plugin-whitelist@1.0.0",
    "cordova-plugin-inappbrowser",
    "cordova-plugin-globalization"
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
