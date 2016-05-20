'use strict';

const request = require('request');

const waitForUrlToChangeTo = function (newUrl, timeout) {
  let currentUrl;
  return browser.driver.getCurrentUrl().then(function(url) {
    currentUrl = url;
  }).then(function() {
      return browser.driver.wait(function() {
        return browser.driver.getCurrentUrl().then(function(url) {
          return newUrl === url;
        });
      }, timeout);
    }
  );
};

const waitForBackendReady = function(timeout) {
  return browser.driver.wait(function() {
    let deferred = protractor.promise.defer();
    browser.driver.executeAsyncScript(function() {
      var callback = arguments[arguments.length - 1];
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
          callback(true);
        }else{
          setTimeout(function(){
            callback(false);
          }, 500);
        }
      };
      xmlHttp.open('GET', 'http://localhost:8008/api/info', true); // true for asynchronous
      xmlHttp.timeout = 500; // time in milliseconds
      xmlHttp.ontimeout = function() {
        xmlHttp.abort();
        callback(false);
      };
      xmlHttp.send(null);
    }).then(function(success){
      if (success)
        deferred.fulfill(true);
      else
        deferred.fulfill(false);
    });
    return deferred.promise;
  }, timeout);
};


const waitForVisualReviewReady = (function() {
  let count = 0;

  return function(max, timeout, next) {
    request('http://localhost:7000', function (error, response) {
      if (error || response.statusCode !== 200) {
        if (count++ < max) {
          return setTimeout(function() {
            waitForVisualReviewReady(max, timeout, next);
          }, timeout);
        } else {
          return next(false);
        }
      }
      next(true);
    });
  };
})();
exports.waitForUrlToChangeTo = waitForUrlToChangeTo;
exports.waitForBackendReady = waitForBackendReady;
exports.waitForVisualReviewReady = waitForVisualReviewReady;

// MOCKS

exports.mockTimestampFormatterService = function(){
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
};

// CONSTANTS

// Animations
exports.MENU_ANIMATION_SPEED = 200;
exports.SWIPER_ANIMATION_SPEED = 300;

// XPath searches
exports.XPATH_FOCUS_TASKS_TODAY_SLIDE = '//div[@swiper-slide="focus/tasks/left"]';
exports.XPATH_FOCUS_TASKS_SLIDE = '//div[@swiper-slide="focus/tasks"]';
exports.XPATH_FOCUS_NOTES_SLIDE = '//div[@swiper-slide="focus/notes"]';
exports.XPATH_TASKS_ALL_SLIDE = '//div[@swiper-slide="tasks/all"]';
exports.XPATH_MENU_BUTTON = '//button[@ng-click="toggleMenu()"]';
exports.XPATH_FOOTER_NAVIGATION_LINK = '//footer//a[contains(@class, "link-navigation") and ./span/text()="${linkText}"]';
exports.XPATH_LINK_LIST_ITEM = '//a[contains(@class, "link-list-item") and ./span/text()="${linkText}"]';
exports.XPATH_TASK_EDITOR_BASIC_SLIDE = '//div[@swiper-slide="taskEditor/basic"]';
exports.XPATH_EDITOR_CLOSE = '//div[contains(@class, "container-editor")]//div[contains(@class, "container-titlebar")]//a[@swiper-click="end${ItemType}Edit()"]';
exports.XPATH_MENU_LINK = '//div[contains(@class, "container-menu")]//div[contains(@class, "link-menu") and ./span/text()="${linkText}"]';
exports.XPATH_USER_HOME_SLIDE = '//div[@swiper-slide="user/home"]';
exports.XPATH_LINK_ITEM = '//a[contains(@class, "link") and ./span/text()="${linkText}"]';
exports.XPATH_INBOX_CONTENT = '//section[@ng-show="isContentVisible(\'inbox\')"]';
exports.XPATH_NOTES_CONTENT = '//div[@ng-show="isContentVisible(\'notes\')"]';
exports.XPATH_LISTS_ACTIVE_SLIDE = '//div[@swiper-slide="lists/active"]';
exports.XPATH_LIST_TASKS_SLIDE = '//div[@swiper-slide="list/tasks"]';