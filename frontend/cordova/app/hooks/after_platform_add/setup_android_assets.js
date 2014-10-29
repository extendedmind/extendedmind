#!/usr/bin/env node
var path = require( "path" ),
    fs = require( "fs" ),
    shell = require( "shelljs" ),
    rootdir = process.argv[ 2 ],
    androidroot = rootdir + "/platforms/android",
    iconroot = rootdir + "/assets/icons/android",
    screenroot = rootdir + "/assets/screens/android",
    buildroot = rootdir + "/assets/build/android";

if (shell.test('-d', androidroot)){
  [ "-hdpi", "-mdpi", "-xhdpi", "-xxhdpi", "-xxxhdpi" ].forEach( function( item ) {
      // copy icons to Cordova Android directories and filenames
      shell.exec( "cp -f " + iconroot + "/*" + item + ".png " + androidroot + "/res/drawable" + item + "/icon.png", {silent:false} );
      // copy splash screens to Cordova Android directory
      shell.exec( "cp -f " + screenroot + "/*" + item + ".png " + androidroot + "/res/drawable" + item + "/splash.9.png", {silent:false} );
  });

  // Using XHDPI as default size

  shell.exec( "cp -f " + iconroot + "/icon-96-xhdpi.png " + androidroot + "/res/drawable/icon.png", {silent:false} );

  shell.exec( "cp -f " + screenroot + "/launch-xhdpi.png " + androidroot + "/res/drawable/splash.9.png", {silent:false} );

  // copy ant.properties
  shell.exec( "cp -f " + buildroot + "/ant.properties " + androidroot, {silent:false} );

  // copy AndroidManifest.xml
  shell.exec( "cp -f " + buildroot + "/AndroidManifest.xml " + androidroot, {silent:false} );
}

process.exit(0);
