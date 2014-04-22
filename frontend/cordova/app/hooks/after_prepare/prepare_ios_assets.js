#!/usr/bin/env node
var path = require( "path" ),
    fs = require( "fs" ),
    shell = require( "shelljs" ),
    rootdir = process.argv[ 2 ],
    iosroot = rootdir + "/platforms/ios",
    buildroot = rootdir + "/assets/build/ios";

if (shell.test('-d', iosroot)){
  // copy edited iOS sources
  shell.exec( "cp -Rf " + buildroot + "/*.m " + iosroot + "/extmd/Classes/", {silent:false} );

  // copy edited .plist
  shell.exec( "cp -Rf " + buildroot + "/*.plist " + iosroot + "/extmd/", {silent:false} );

}

process.exit(0);
