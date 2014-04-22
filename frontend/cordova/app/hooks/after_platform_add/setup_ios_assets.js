#!/usr/bin/env node
var path = require( "path" ),
    fs = require( "fs" ),
    shell = require( "shelljs" ),
    rootdir = process.argv[ 2 ],
    iosroot = rootdir + "/platforms/ios",
    iconroot = rootdir + "/assets/icons/ios",
    screenroot = rootdir + "/assets/screens/ios",
    buildroot = rootdir + "/assets/build/ios";

if (shell.test('-d', iosroot)){

  // clear generated Cordova icons
  shell.exec( "rm " + iosroot + "/extmd/Resources/icons/*.png", {silent:false} );

  // copy icons to Cordova iOS directories and filenames
  shell.exec( "cp -Rf " + iconroot + "/*.png " + iosroot + "/extmd/Resources/icons/", {silent:false} );

  // clear generated Cordova splashes TODO: Create rest of splashes for us!
  //shell.exec( "rm " + iosroot + "/extmd/Resources/splash/*.png", {silent:false} );

  // copy splash screens to iOS directories and filenames
  shell.exec( "cp -Rf " + screenroot + "/*.png " + iosroot + "/extmd/Resources/splash/", {silent:false} );
}

process.exit(0);
