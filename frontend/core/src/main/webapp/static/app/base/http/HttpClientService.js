/* global angular */
'use strict';

function HttpClientService($http, $rootScope, HttpRequestQueueService, UUIDService) {

  var methods = {};

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
          if (onlineCallback) {
            onlineCallback(true);
          }

          // Try to execute the next request in the queue
          executeRequests();
        }).
        error(function(data, status/*, headers, config*/) {
          console.log("GOT ERROR: " + status);
          if (status === 404 || status === 502){
            // Seems to be offline, stop processing
            HttpRequestQueueService.setOffline(headRequest);
            // Execute callback
            if (onlineCallback) {
              onlineCallback(false);
            }
          }else {
            // Emit unsuspected error to root scope, so that
            // it can be listened on at by the application
            $rootScope.$emit('emException', {type: 'http', status: status, data: data});
          }
        });
    }
  }

  // GET, HEAD and JSONP return chained promises
  angular.forEach(['get', 'head', 'jsonp'], function(name) {
    methods[name] = function(url) {
      return $http({method: name, url: url}).then(function(success) {
        return success;
      });
    };
  });

  // Online alternatives for POST, PUT and DELETE
  methods.postOnline = function(url, data) {
    return $http({method: 'post', url: url, data: data}).then(function(success) {
      return success;
    });
  };

  methods.putOnline = function(url, data) {
    return $http({method: 'put', url: url, data: data}).then(function(success) {
      return success;
    });
  };

  methods.deleteOnline = function(url) {
    return $http({method: 'delete', url: url}).then(function(success) {
      return success;
    });
  };

  // Custom method for a primary POST, i.e. authentication
  methods.postPrimary = function (url, data) {
    var request = getRequest('post', url, data);
    request.primary = true;
    HttpRequestQueueService.push(request);
    executeRequests();
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

  methods.delete = function(url, params) {
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

HttpClientService.$inject = ['$http', '$rootScope', 'HttpRequestQueueService', 'UUIDService'];
angular.module('em.services').factory('HttpClientService', HttpClientService);
