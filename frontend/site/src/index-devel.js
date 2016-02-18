'use strict'

// Imports babel - auto transpiles the other stuff
require('babel-core/register')({
    presets: ["stage-0"],
    plugins: ["syntax-async-functions", "syntax-async-generators"],
    extensions: [".js"],
    // Only these files are included
    only: ['./es7']
});

/**
 * Load development configuration file and set backend to value optionally given as command line parameter
 */
let config = require('./config-devel.js');
if (process.argv.length > 2) {
  console.log('setting backend to: ' + process.argv[2]);
  config.backend = process.argv[2];
}
const server = require('./es7/server.js')(config); // this is es7 - gets transpiled
