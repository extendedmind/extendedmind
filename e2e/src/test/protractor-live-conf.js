'use strict';

const helpers = require('./testHelpers.js');

exports.config = {
  specs: ['spec/*.js'],
  directConnect: true,
  jasmineNodeOpts: {defaultTimeoutInterval: 40000},
  params: {
    // Mock out visual review as live browser looks very different from the headless one
    visualreview: {
      takeScreenshot: function(){}
    },
    helpers: helpers
  }
};