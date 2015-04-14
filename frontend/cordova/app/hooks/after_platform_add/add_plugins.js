#!/usr/bin/env node

//this hook installs all your plugins

var pluginlist = [
    "https://github.com/driftyco/ionic-plugins-keyboard.git",
    "org.apache.cordova.vibration",
    "org.apache.cordova.media",
    "https://github.com/apache/cordova-plugin-splashscreen.git",
    "https://github.com/extendedmind/Calendar-PhoneGap-Plugin.git",
    "https://github.com/katzer/cordova-plugin-local-notifications",
    "https://github.com/leohenning/KeepScreenOnPlugin",
    "org.apache.cordova.device"
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
