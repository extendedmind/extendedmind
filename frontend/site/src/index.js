'use strict'

// Imports babel - auto transpiles the other stuff
require('babel-core/register')({
    presets: ["stage-0"],
    plugins: ["syntax-async-functions", "syntax-async-generators"],
    extensions: [".js"],
    // Only these files are included
    only: ['./js', './node-modules/extendedmind-siteutils']
});

/**
 * Load configuration file given as command line parameter
 */
let config;
if (process.argv.length > 2) {
  console.log('loading configuration file: ' + process.argv[2]);
  config = require(process.argv[2]);
  if (process.argv.length > 3){
    config.backend = process.argv[3];
  }
}else{
  console.error('no configuration file provided');
  process.exit();
};

const server = require('./js/server.js')(config); // this is es7 - gets transpiled
