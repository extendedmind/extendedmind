'use strict';

const helpers = require('./testHelpers.js');

exports.config = {
  specs: ['spec/*.js'],
  directConnect: true,
  jasmineNodeOpts: {defaultTimeoutInterval: 40000},
  onPrepare: function () {
    browser.driver.manage().window().setSize(1280, 1024);
  },
  params: {
    // Mock out visual review as live browser looks very different from the headless one
    visualreview: {
      takeScreenshot: function(){}
    },
    helpers: helpers,
    emailTestPath: '../target/email-tests'
  }
};