#!/usr/bin/env node
var path = require( "path" ),
    fs = require( "fs" ),
    shell = require( "shelljs" ),
    rootdir = process.argv[ 2 ],
    androidroot = rootdir + "/platforms/android",
    fontroot = rootdir + "/assets/fonts",
    buildroot = rootdir + "/assets/build/android";

if (shell.test('-d', androidroot)){
  // copy edited Android sources

  if (shell.test('-d', androidroot + "/src/org/extendedmind/nightly")){
    shell.exec( "cp -f " + buildroot + "/*.java " + androidroot + "/src/org/extendedmind/nightly", {silent:false} );
  }else {
    shell.exec( "cp -f " + buildroot + "/*.java " + androidroot + "/src/org/extendedmind", {silent:false} );
  }
}

process.exit(0);
