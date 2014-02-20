'use strict';

function HttpClientService($http, $rootScope, HttpRequestQueueService, UUIDService) {

  var methods = {};

  function getRequest(method, url, data){
    var request = {
      uuid: UUIDService.randomUUID(),
      method: method,
      url: url
    }
    if (data){
      request.data = data;
    }
    return request;
  }

  // Callbacks
  var primaryCallback, secondaryCallback, defaultCallback;
  
  // Recursive method to emtpy queue
  function executeHeadRequest() {
    var headRequest = HttpRequestQueueService.head;
    if (headRequest){
      $http(headRequest).
        success(function(data, status, headers, config) {
          // First, execute callback
          if (headRequest.primary && primaryCallback){
            primaryCallback(headRequest, data);
          }else if (headRequest.secondary && secondaryCallback){            
            secondaryCallback(headRequest, data);
          }else if (defaultCallback){
            defaultCallback(headRequest, data);
          }
          // Then remove the request from queue and release lock
          HttpRequestQueueService.remove(headRequest);
          // Try to execute the next request in the queue
          executeHeadRequest();
        }).
        error(function(data, status, headers, config) {
          if (status === 404){
            // Seems to be offline, stop processing
            HttpRequestQueueService.setOffline(headRequest);
          }else {
            // Emit unsuspected error to root scope, so that
            // it can be listened on at by the application
            $rootScope.$emit('emException', {type: 'http', status: status, data: data})
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

  // Custom method for a primary POST, i.e. authentication
  methods.postPrimary = function (url, data) {
    var request = getRequest('post', url, data);
    request.primary = true;
    HttpRequestQueueService.push(request);
    executeHeadRequest();
  }
  
  // Custom method for secondary GET, i.e. delta getter
  methods.getSecondary = function(url) {
    var request = getRequest('get', url);
    request.secondary = true;
    HttpRequestQueueService.push(request);
    executeHeadRequest();
  }

  // DELETE, POST and PUT are methods which utilize
  // the offline request queue

  methods.delete = function(url) {
    var request = getRequest('delete', url);
    HttpRequestQueueService.push(request);
    executeHeadRequest();
  }

  methods.post = function(url, data, reverse) {
    var request = getRequest('post', url);
    request.reverse = reverse;
    HttpRequestQueueService.push(request);
    executeHeadRequest();
  }

  methods.postOnline = function(url, data) {
    return $http({method: 'post', url: url, data: data}).then(function(success) {
      return success;
    });
  }

  methods.put = function(url, data) {
    var request = getRequest('post', url);
    HttpRequestQueueService.push(request);
    executeHeadRequest();
  }

  // Methods to register callbacks when 
  methods.registerCallback = function(type, callback){
    if (type === 'primary'){
      primaryCallback = callback;
    }else if (type === 'secondary'){
      secondaryCallback = callback;
    }else if (type === 'default'){
      defaultCallback = callback;
    }
  }

  return methods;
}

HttpClientService['$inject'] = ['$http', '$rootScope', 'HttpRequestQueueService', 'UUIDService'];
angular.module('em.services').factory('HttpClientService', HttpClientService);
