#!/usr/bin/env node

//this hook installs all your plugins

var pluginlist = [
    "https://github.com/driftyco/ionic-plugins-keyboard.git#v1.0.4",
    "cordova-plugin-vibration",
    "cordova-plugin-media",
    "https://github.com/apache/cordova-plugin-splashscreen.git",
    "https://github.com/extendedmind/Calendar-PhoneGap-Plugin.git",
    "https://github.com/extendedmind/cordova-plugin-local-notifications",
    "https://github.com/leohenning/KeepScreenOnPlugin",
    "https://github.com/extendedmind/cordova-webintent",
    "cordova-plugin-device",
    "cordova-plugin-whitelist"
];

// no need to configure below

var fs = require('fs');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;

function puts(error, stdout, stderr) {
    sys.puts(stdout)
}

pluginlist.forEach(function(plug) {
    exec("cordova plugin add " + plug, puts);
});
