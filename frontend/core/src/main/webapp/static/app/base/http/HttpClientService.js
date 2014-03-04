/* global angular */
'use strict';

function HttpClientService($q, $http, $rootScope, HttpRequestQueueService) {

  var methods = {};
  var credentials;
  var online = true;

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
  var primaryCallback, secondaryCallback, defaultCallback, onlineCallback;
  
  // Recursive method to empty the queue
  function executeRequests() {
    var headRequest = HttpRequestQueueService.getHead();
    if (headRequest){
      $http(headRequest.content).
        success(function(data /*, status, headers, config*/) {
          // First, execute callback
          if (headRequest.primary && primaryCallback){
            primaryCallback(headRequest, data);
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
        error(function(data, status/*, headers, config*/) {
          if (status && (status === 404 || status === 502)){
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
            $rootScope.$emit('emException', {type: 'http', status: status, data: data});
          }
        });
    }
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
        if (error && (error.status === 404 || error.status === 502)){
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
      if (error && (error.status === 404 || error.status === 502)){
        online = false;
        if (onlineCallback) {
          onlineCallback(online);
        }
      }
      if(!skipLogStatuses || skipLogStatuses.indexOf(error.status) === -1){
        $rootScope.$emit('emException', {type: 'http', status: error.status, data: error.data});
      }
      return $q.reject(error);
    });
  };

  methods.putOnline = function(url, data) {
    return $http({method: 'put', url: url, data: data}).then(function(success) {
      return success;
    }, function(error) {
      $rootScope.$emit('emException', {type: 'http', status: error.status, data: error.data});
      return $q.reject(error);
    });
  };

  methods.deleteOnline = function(url) {
    return $http({method: 'delete', url: url}).then(function(success) {
      return success;
    }, function(error) {
      $rootScope.$emit('emException', {type: 'http', status: error.status, data: error.data});
      return $q.reject(error);
    });
  };

  // Custom method for a primary POST, i.e. authentication
  methods.postPrimary = function (url, data) {
    var request = getRequest('post', url, undefined, data);
    request.primary = true;
    HttpRequestQueueService.push(request);
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

  // Methods to register callbacks when 
  methods.registerCallback = function(type, callback){
    if (type === 'primary'){
      primaryCallback = callback;
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
