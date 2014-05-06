#!/usr/bin/env node
 
//this hook installs all your plugins
 
var pluginlist = [
    "https://github.com/apache/cordova-plugins.git#master:keyboard"
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
