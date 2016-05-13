'use strict';
var waitForUrlToChangeTo = function (newUrl, timeout) {
  var currentUrl;
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

var waitForBackendReady = function(timeout) {
  return browser.driver.wait(function() {
    var deferred = protractor.promise.defer();
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

exports.waitForUrlToChangeTo = waitForUrlToChangeTo;
exports.waitForBackendReady = waitForBackendReady;
