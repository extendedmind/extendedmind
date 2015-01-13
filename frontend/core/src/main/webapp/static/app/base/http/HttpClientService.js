/* Copyright 2013-2014 Extended Mind Technologies Oy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /* global $, console */
 'use strict';

 function HttpClientService($http, $q, $rootScope, HttpRequestQueueService) {

  var methods = {};
  var credentials;
  var cacheOnly;

  // Offline checker for the entire application
  function isOffline(status) {
    if (status === 0 || status === 404 || status === 502) {
      return true;
    }
  }

  function handleOnlineCallback(value) {
    if (onlineCallback) {
      if (value === true) {
        onlineCallback(true);
      }
      else if (value === false || (value && isOffline(value.status))) {
        onlineCallback(false);
      }
    }
  }

  function getRequest(method, url, params, data, timestamp) {
    var request = {
      content: {
        method: method,
        url: url
      },
      params: params
    };
    if (data) {
      request.content.data = data;
    }
    if (timestamp){
      request.content.timestamp = timestamp;
    }
    return request;
  }

  // Callbacks
  var primaryResultCallback, primaryCreateCallback, secondaryCallback, beforeLastCallback,
  defaultCallback, onlineCallback, queueEmptiedCallback;


  function executeLastRequest(lastRequest){
    $.ajax({
      type: lastRequest.content.method.toUpperCase(),
      url: lastRequest.content.url,
      data: JSON.stringify(lastRequest.content.data),
      contentType: 'application/json',
      dataType: 'json',
      success: function() {
        // Then remove the request and release lock
        HttpRequestQueueService.remove(lastRequest);
      },
      error: function() {
        HttpRequestQueueService.releaseLock();
      }
    });
  }

  var retryingExecution = false;
  // Recursive method to empty the queue
  function executeRequests(previousRequest) {

    // When cacheOnly is set to true, the only thing that needs to be done here
    // is analytics
    if (cacheOnly){
      var lastRequest = HttpRequestQueueService.getLast();
      if (lastRequest){
        executeLastRequest(lastRequest);
      }
      return;
    }

    // First always check if primary should be created first
    // to avoid errors with authentication
    if (!HttpRequestQueueService.isPrimaryHead() && primaryCreateCallback) {
      var primaryRequestInfo = primaryCreateCallback();
      if (primaryRequestInfo) {
        processPrimaryRequest(primaryRequestInfo.url, primaryRequestInfo.data);
      }
    }
    // Get head request but skip the secondary request if recursively emptying queue,
    // (and previous was not the primary request in which case secondary will need
    // to be next). This is needed to prevent secondary requests from being called
    // in between emptying a long queue, where the secondary request would get results of
    // earlier queue operations and cause all sorts of problems.
    var skipSecondary = previousRequest && !previousRequest.primary;
    var headRequest = HttpRequestQueueService.getHead(skipSecondary);
    if (headRequest) {
      if (!headRequest.last) {
        headRequest.executing = true;
        $http(headRequest.content)
        .success(function(data /*, status, headers, config*/) {
          delete headRequest.executing;
          retryingExecution = false;
          // First, execute callback
          if (headRequest.primary && primaryResultCallback) {
            primaryResultCallback(headRequest, data);
          } else if (headRequest.secondary && secondaryCallback) {
            secondaryCallback(headRequest, data, HttpRequestQueueService.getQueue());
            HttpRequestQueueService.saveQueue();
          } else if (headRequest.beforeLast && beforeLastCallback) {
            beforeLastCallback(headRequest, data, HttpRequestQueueService.getQueue());
            HttpRequestQueueService.saveQueue();
          } else if (defaultCallback) {
            defaultCallback(headRequest, data, HttpRequestQueueService.getQueue());
            HttpRequestQueueService.saveQueue();
          }

          // Then remove the request from queue and release lock
          var queueEmptyBeforeRemove = HttpRequestQueueService.isQueueEmpty();
          HttpRequestQueueService.remove(headRequest);

          // Execute online callback
          handleOnlineCallback(true);

          // Execute queue emptied callback if queue was not empty before this request but is empty now
          if (queueEmptiedCallback && !queueEmptyBeforeRemove && HttpRequestQueueService.isQueueEmpty()){
            queueEmptiedCallback().then(function(){
              // Execute requests again, but proceed normally from the start
              executeRequests();
            });
          }else {
            // Try to execute the next request in the queue
            executeRequests(headRequest);
          }
        }).error(function(data, status, headers, config) {
          delete headRequest.executing;
          if (isOffline(status)) {
            retryingExecution = false;
            // Seems to be offline, stop processing
            HttpRequestQueueService.setOffline(headRequest);
            // Execute callback
            handleOnlineCallback(false);
          } else {
            // Add retrying to 403 Forbidden which may have to do with
            // an old request being run on refocus to app after 12 hours
            // from last authentication
            if (!retryingExecution && status === 403) {
              retryingExecution = true;
              HttpRequestQueueService.releaseLock();
              executeRequests(headRequest);
            } else {
              retryingExecution = false;
              if (headRequest.errorStatus !== undefined && headRequest.errorStatus === status) {
                // This error was already thrown and error emitted, the best thing
                // now is to remove the request and continue with the next request in the
                // queue to prevent endless error loop. NOTE: This leaves the transient model
                // unchanged, so it looks like something is stored even though it isn't. It
                // is still a better alternative than endless looping.
                HttpRequestQueueService.remove(headRequest);
                executeRequests(headRequest);
              } else {
                // Emit error to root scope, so that
                // it can be listened on at by the application
                headRequest.errorStatus = status;
                HttpRequestQueueService.saveQueue();
                HttpRequestQueueService.releaseLock();
                $rootScope.$emit('emException', {type: 'http', value: {status: status, data: data,
                 url: config.url}});
              }
            }
          }
        });
        // Last is executed without any expectations of a result
      } else {
        executeLastRequest(headRequest);
      }
    }
  }


  var checkRequestsExecutionInterval = 50;
  var periodicChecker;
  function checkRequestsPeriodic(deferred){
    return setTimeout(function() {
      checkRequestExecuting(deferred);
      periodicChecker = checkRequestsPeriodic(deferred);
    }, checkRequestsExecutionInterval);
  }

  function checkRequestExecuting(deferred){
    if (!HttpRequestQueueService.isProcessing() && !HttpRequestQueueService.isEmpty()){
      var headErrorValue = HttpRequestQueueService.getHeadError();
      if (headErrorValue){
        deferred.reject({type:'http', value: headErrorValue});
      }else{
        deferred.reject({type:'internal'});
      }
    } else if (HttpRequestQueueService.isEmpty()){
      deferred.resolve();
    }
  }

  function waitForRequestsExecution(){
    // There are requests in queue, start looping them, and check back once every 500ms to see
    // if the queue is empty and we're not offline
    var deferred = $q.defer();
    if (HttpRequestQueueService.isProcessing()){
      periodicChecker = checkRequestsPeriodic(deferred);
      deferred.promise.then(function(){
        clearTimeout(periodicChecker);
      },
      function(error){
        clearTimeout(periodicChecker);
        return $q.reject(error);
      });
    }else{
      deferred.reject({type:'internal'});
    }
    return deferred.promise;
  }

  function executeRequestsAndPoll(doFn, urlPrefix, url, data){
    var deferred = $q.defer();
    executeRequests();
    var exectionReadyPromise = waitForRequestsExecution();
    exectionReadyPromise.then(function(){
      doFn(urlPrefix, url, data)
      .then(function (success){
        deferred.resolve(success);
      },function(failure){
        deferred.reject(failure);
      });
    },
    function(failure){
      deferred.reject(failure);
    });
    return deferred.promise;
  }

  function processPrimaryRequest(url, data) {
    var request = getRequest('post', url, undefined, data);
    request.primary = true;
    HttpRequestQueueService.push(request);
  }

  // Methods for credentials
  methods.setCredentials = function(encodedCredentials) {
    credentials = encodedCredentials;
    $http.defaults.headers.common.Authorization = 'Basic ' + credentials;
  };

  methods.getCredentials = function() {
    return credentials;
  };

  // GET, HEAD and JSONP return chained promises
  angular.forEach(['get', 'head', 'jsonp'], function(name) {
    methods[name] = function(url) {
      return $http({method: name, url: url}).then(function(success) {
        handleOnlineCallback(true);
        return success;
      }, function(error) {
        handleOnlineCallback(error);
        return $q.reject({type:'http', value: error});
      });
    };
  });

  function getRefreshedUrlString(urlPrefix, url){
    if (angular.isObject(url)){
      return urlPrefix + url.refresh(url.params);
    }else{
      return urlPrefix + url;
    }
  }

  // Online alternatives for POST, PUT and DELETE
  methods.postOnline = function(urlPrefix, url, data) {
    function doPostOnline(urlPrefix, url, data){
      return $http({method: 'post', url: getRefreshedUrlString(urlPrefix, url), data: data})
      .then(function(success) {
        handleOnlineCallback(true);
        return success;
      }, function(error) {
        handleOnlineCallback(error);
        return $q.reject({type:'http', value: error});
      });
    }
    if (HttpRequestQueueService.isEmpty()){
      return doPostOnline(urlPrefix, url, data);
    }else{
      return executeRequestsAndPoll(doPostOnline, urlPrefix, url, data);
    }
  };

  methods.putOnline = function(url, data) {
    return $http({method: 'put', url: url, data: data}).then(function(success) {
      handleOnlineCallback(true);
      return success;
    }, function(error) {
      handleOnlineCallback(error);
      return $q.reject({type:'http', value: error});
    });
  };

  methods.putOnlineWithCredentials = function(url, data, overrideCredentials) {
    return $http({
      method: 'put',
      url: url,
      data: data,
      headers: {'Authorization': 'Basic ' + overrideCredentials}
    })
    .then(function(success) {
      handleOnlineCallback(true);
      return success;
    }, function(error) {
      handleOnlineCallback(error);
      return $q.reject({type:'http', value: error});
    });
  };

  methods.deleteOnline = function(urlPrefix, url, data) {
    function doDeleteOnline(urlPrefix, url, data){
      return $http({method: 'delete', url: getRefreshedUrlString(urlPrefix, url), data: data})
      .then(function(success) {
        handleOnlineCallback(true);
        return success;
      }, function(error) {
        handleOnlineCallback(error);
        return $q.reject({type:'http', value: error});
      });
    }
    if (HttpRequestQueueService.isEmpty()){
      return doDeleteOnline(urlPrefix, url, data);
    }else{
      return executeRequestsAndPoll(doDeleteOnline, urlPrefix, url, data);
    }
  };

  // Custom method for a primary POST, i.e. authentication
  methods.postPrimary = function(url, data) {
    processPrimaryRequest(url, data);
    executeRequests();
  };

  methods.clearPrimary = function() {
    HttpRequestQueueService.clearPrimary();
  };

  // Custom method for secondary GET, i.e. delta getter
  methods.getSecondary = function(url, params) {
    var request = getRequest('get', url, params);
    request.secondary = true;
    HttpRequestQueueService.push(request);
    executeRequests();
  };

  // Custom method for beforeLast GET, i.e. user account
  methods.getBeforeLast = function(url, params) {
    var request = getRequest('get', url, params);
    request.beforeLast = true;
    HttpRequestQueueService.push(request);
    executeRequests();
  };

  // Custom method for last post, i.e. analytics
  methods.postLast = function(url, data) {
    var request = getRequest('post', url, undefined, data);
    request.last = true;
    HttpRequestQueueService.concatLastContentDataArray(request);
    // Don't execute requests, last is sent only after something else
  };
  methods.postLastOnline = function(url, data) {
    $.ajax({
      type: 'POST',
      url: url,
      data: JSON.stringify(data),
      contentType: 'application/json',
      dataType: 'json',
      success: function() {
        // Don't do anything
      },
      failure: function(/*data*/) {
        // Only log failure of analytics
        console.log('postLastOnline failed');
      }
    });
  };

  // DELETE, POST and PUT are methods which utilize
  // the offline request queue

  methods.deleteOffline = function(url, params, data, timestamp) {
    var request = getRequest('delete', url, params, data, timestamp);
    HttpRequestQueueService.push(request);
    executeRequests();
  };

  methods.postOffline = function(url, params, data, timestamp) {
    var request = getRequest('post', url, params, data, timestamp);
    var pushed = HttpRequestQueueService.push(request);
    executeRequests();
    return pushed;
  };

  methods.putOffline = function(url, params, data, timestamp) {
    var request = getRequest('put', url, params, data, timestamp);
    HttpRequestQueueService.push(request);
    executeRequests();
  };

  methods.isOffline = function(status) {
    return isOffline(status);
  };

  // Methods to register callbacks when
  methods.registerCallback = function(type, callback) {
    if (type === 'primaryResult') {
      primaryResultCallback = callback;
    } else if (type === 'primaryCreate') {
      primaryCreateCallback = callback;
    } else if (type === 'secondary') {
      secondaryCallback = callback;
    } else if (type === 'beforeLast') {
      beforeLastCallback = callback;
    } else if (type === 'default') {
      defaultCallback = callback;
    } else if (type === 'online') {
      onlineCallback = callback;
    } else if (type === 'queueEmptied') {
      queueEmptiedCallback = callback;
    }
  };

  methods.setCacheOnly = function(value) {
    cacheOnly = value;
  }

  return methods;
}

HttpClientService['$inject'] = ['$http', '$q', '$rootScope', 'HttpRequestQueueService'];
angular.module('em.base').factory('HttpClientService', HttpClientService);
