/* global $ */
'use strict';

function HttpClientService($q, $http, $rootScope, HttpRequestQueueService) {

  var methods = {};
  var credentials;
  var online = true;

  // Offline checker for the entire application
  function isOffline(status) {
    if (status === 0 || status === 404 || status === 502){
      return true;
    }
  }

  function emitException(error, skipLogStatuses) {
    var exceptionType = 'http';
    if (error && isOffline(error.status)){
      online = false;
      if (onlineCallback) {
        onlineCallback(online);
      }
      exceptionType = 'onlineRequired';
    }
    if (!skipLogStatuses || skipLogStatuses.indexOf(error.status) === -1){
      $rootScope.$emit('emException', {type: exceptionType, status: error.status, data: error.data});
    }
  }

  function getRequest(method, url, params, data){
    var request = {
      content: {
        method: method,
        url: url
      },
      params: params
    };
    if (data){
      request.content.data = data;
    }
    return request;
  }

  // Callbacks
  var primaryResultCallback, primaryCreateCallback, secondaryCallback, defaultCallback, onlineCallback;

  // Recursive method to empty the queue
  function executeRequests() {
    // First always check if primary should be created first
    // to avoid errors with authentication
    if (!HttpRequestQueueService.isPrimaryHead() && primaryCreateCallback){
      var primaryRequestInfo = primaryCreateCallback();
      if (primaryRequestInfo){
        processPrimaryRequest(primaryRequestInfo.url, primaryRequestInfo.data);
      }
    }
    var headRequest = HttpRequestQueueService.getHead();
    if (headRequest){
      if (!headRequest.last){
        $http(headRequest.content).
        success(function(data /*, status, headers, config*/) {
            // First, execute callback
            if (headRequest.primary && primaryResultCallback){
              primaryResultCallback(headRequest, data);
            }else if (headRequest.secondary && secondaryCallback){
              secondaryCallback(headRequest, data, HttpRequestQueueService.getQueue());
              HttpRequestQueueService.saveQueue();
            }else if (defaultCallback){
              defaultCallback(headRequest, data, HttpRequestQueueService.getQueue());
              HttpRequestQueueService.saveQueue();
            }
            // Then remove the request from queue and release lock
            HttpRequestQueueService.remove(headRequest);

            // Execute online callback
            online = true;
            if (onlineCallback) {
              onlineCallback(online);
            }

            // Try to execute the next request in the queue
            executeRequests();
          }).
        error(function(data, status, headers, config) {
          if (isOffline(status)){
            // Seems to be offline, stop processing
            HttpRequestQueueService.setOffline(headRequest);
            online = false;
            // Execute callback
            if (onlineCallback) {
              onlineCallback(online);
            }
          }else {
            // Emit unsuspected error to root scope, so that
            // it can be listened on at by the application
            HttpRequestQueueService.releaseLock();
            $rootScope.$emit('emException', {type: 'http', status: status, data: data, url: config.url});
          }
        });
      }else{
        // Last is executed without any expectations of a result
        $.ajax({
          type: headRequest.content.method.toUpperCase(),
          url: headRequest.content.url,
          data: JSON.stringify(headRequest.content.data),
          contentType: "application/json",
          dataType: "json",
          success: function () {
            // Then remove the request and release lock
            HttpRequestQueueService.remove(headRequest);
          },
          error: function () {
            HttpRequestQueueService.releaseLock();
          }
        });
      }
    }
  }

  function processPrimaryRequest(url, data){
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
        online = true;
        if (onlineCallback) {
          onlineCallback(online);
        }
        return success;
      }, function(error){
        if (error && isOffline(error.status)){
          online = false;
          if (onlineCallback) {
            onlineCallback(online);
          }
        }
        return $q.reject(error);
      });
    };
  });

  // Online alternatives for POST, PUT and DELETE
  methods.postOnline = function(url, data, skipLogStatuses) {
    return $http({method: 'post', url: url, data: data}).then(function(success) {
      online = true;
      if (onlineCallback) {
        onlineCallback(online);
      }
      return success;
    }, function(error) {
      emitException(error, skipLogStatuses);
      return $q.reject(error);
    });
  };

  methods.putOnline = function(url, data) {
    return $http({method: 'put', url: url, data: data}).then(function(success) {
      return success;
    }, function(error) {
      emitException(error);
      return $q.reject(error);
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
      return success;
    }, function(error) {
      emitException(error);
      return $q.reject(error);
    });
  };

  methods.deleteOnline = function(url) {
    return $http({method: 'delete', url: url}).then(function(success) {
      return success;
    }, function(error) {
      emitException(error);
      return $q.reject(error);
    });
  };

  // Custom method for a primary POST, i.e. authentication
  methods.postPrimary = function (url, data) {
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

  // Custom method for last post, i.e. analytics
  methods.postLast = function(url, data) {
    var request = getRequest('post', url, undefined, data);
    request.last = true;
    HttpRequestQueueService.concatLastContentDataArray(request);
    // Don't execute requests, last is sent only after something else
  }
  methods.postLastOnline = function(url, data) {
    $.ajax({
      type: 'POST',
      url: url,
      data: JSON.stringify(data),
      contentType: "application/json",
      dataType: "json",
      success: function () {
        // Don't do anything
      },
      failure: function (data) {
        // Only log failure of analytics
        console.log("postLastOnline failed")
      }
    });
  }

  // DELETE, POST and PUT are methods which utilize
  // the offline request queue

  methods.deleteOffline = function(url, params) {
    var request = getRequest('delete', url, params);
    HttpRequestQueueService.push(request);
    executeRequests();
  };

  methods.post = function(url, params, data) {
    var request = getRequest('post', url, params, data);
    var pushed = HttpRequestQueueService.push(request);
    executeRequests();
    return pushed;
  };

  methods.put = function(url, params, data) {
    var request = getRequest('put', url, params, data);
    HttpRequestQueueService.push(request);
    executeRequests();
  };

  methods.isOffline = function(status) {
    return isOffline(status);
  }

  // Methods to register callbacks when
  methods.registerCallback = function(type, callback){
    if (type === 'primaryResult'){
      primaryResultCallback = callback;
    }else if (type === 'primaryCreate'){
      primaryCreateCallback = callback;
    }else if (type === 'secondary'){
      secondaryCallback = callback;
    }else if (type === 'default'){
      defaultCallback = callback;
    }else if (type === 'online'){
      onlineCallback = callback;
    }
  };



  return methods;
}

HttpClientService.$inject = ['$q', '$http', '$rootScope', 'HttpRequestQueueService'];
angular.module('em.services').factory('HttpClientService', HttpClientService);
