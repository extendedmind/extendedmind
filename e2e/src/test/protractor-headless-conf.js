'use strict';

const VisualReview = require('visualreview-protractor');
var vr = new VisualReview({
  hostname: 'localhost',
  port: 7000,
  propertiesFn: function () {
    return {
      'browser': 'chrome',
    };
  }
});

const helpers = require('./testHelpers.js');
const q = require('q');

exports.config = {
  specs: ['spec/*.js'],
  jasmineNodeOpts: {defaultTimeoutInterval: 40000},
  beforeLaunch: function () {
    let deferred = q.defer();
    helpers.waitForVisualReviewReady(80, 500, function(success){
      if (success){
        vr.initRun('extendedmind', 'visualtest').then(function(){
          deferred.resolve();
        });
      }else{
        deferred.reject();
      }
    });
    return deferred.promise;
  },
  onPrepare: function () {
    browser.driver.manage().window().setSize(1280, 1024);
    var timestampServiceMock = function() {
      angular.module('e2eMock', []).factory("TimestampFormatterService",
        ['$filter', function($filter){
          return {
            formatToLocaleTime: function(date, useHour12) {
              if (useHour12) return '9:35 am';
              else return '09:35';
            },
            formatToLocaleTimeWithDate: function(date, useHour12) {
              if (useHour12) return 'tue 1 september 9:35 am';
              else return 'tue 1 september 09:35';
            },
            formatToLocaleDateWithTime: function(date, useHour12) {
              if (useHour12) return 'tue 1 september 2015 9:35 am';
              else return 'tue 1 september 2015 09:35';
            }
          };
        }]);
    };
    browser.addMockModule('e2eMock', timestampServiceMock);
  },
  afterLaunch: function (exitCode) {
    // finalizes the run, cleans up temporary files
    return vr.cleanup(exitCode);
  },
  params: {
    visualreview: vr,
    helpers: helpers,
    emailTestPath: '/protractor/backend-emails'
  }
};
