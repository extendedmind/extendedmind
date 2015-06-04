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

  // First, delete generated drawable directories to avoid Cordova splash from appearing anywhere
  shell.exec( "rm -rf " + androidroot + "/res/drawable*", {silent:false} );

  [ "-hdpi", "-mdpi", "-xhdpi", "-xxhdpi", "-xxxhdpi" ].forEach( function( item ) {
      // create directory
      shell.exec( "mkdir " + androidroot + "/res/drawable" + item, {silent:false} );
      // copy icons to Cordova Android directories and filenames
      shell.exec( "cp -f " + iconroot + "/*" + item + ".png " + androidroot + "/res/drawable" + item + "/icon.png", {silent:false} );
      // copy splash screens to Cordova Android directory
      shell.exec( "cp -f " + screenroot + "/*" + item + ".png " + androidroot + "/res/drawable" + item + "/splash.9.png", {silent:false} );
  });

  // Using XHDPI as default size
  shell.exec( "mkdir " + androidroot + "/res/drawable", {silent:false} );
  shell.exec( "cp -f " + iconroot + "/icon-96-xhdpi.png " + androidroot + "/res/drawable/icon.png", {silent:false} );
  shell.exec( "cp -f " + screenroot + "/launch-xhdpi.png " + androidroot + "/res/drawable/splash.9.png", {silent:false} );

  // Copy reminder icon
  shell.exec( "cp -f " + iconroot + "/ic_popup_reminder.png " + androidroot + "/res/drawable", {silent:false} );

  // copy build properties
  shell.exec( "cp -f " + buildroot + "/build-extras.gradle " + androidroot, {silent:false} );
}

process.exit(0);
