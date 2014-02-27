/* global angular, urlPrefix */
'use strict';

function BackendClientService($q, $rootScope, base64, HttpClientService, UserSessionService) {
  var methods = {};

  function getUrlPrefix() {
    // http://stackoverflow.com/a/3390426
    return (typeof urlPrefix !== 'undefined') ? urlPrefix : '';
  }

  methods.uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  methods.apiPrefixRegex = /\/api\//;
  methods.undeleteRegex = /\/undelete/;

  var refreshCredentialsCallback;

  function refreshCredentials() {
    function doRefreshCredentials(){
      var credentials = UserSessionService.getCredentials();
      if (HttpClientService.getCredentials() !== credentials){
        HttpClientService.setCredentials(credentials);
      }
    }
    if (refreshCredentialsCallback){
      return refreshCredentialsCallback().then(function(){
        doRefreshCredentials();
      });
    }else{
      var deferred = $q.defer();
      doRefreshCredentials();
      deferred.resolve();
      return deferred.promise;
    }
  }

  function emitRegexException(regex, method, url){
    $rootScope.$emit('emException', {type: 'regex', regex: regex, method: method, url: url});
  }

  // Method for setting credentials to all subsequent http calls
  methods.setCredentials = function(credentials) {
    return HttpClientService.setCredentials(credentials);
  };
  methods.setUsernamePassword = function(username, password) {
    return HttpClientService.setCredentials(base64.encode(username + ':' + password));
  };

  methods.get = function(url, regex, skipRefresh) {
    function doGet(){
      if (regex.test(url)){
        return HttpClientService.get(getUrlPrefix() + url);
      }else {
        emitRegexException(regex, 'get', url);
      }
    }
    if (!skipRefresh){
      return refreshCredentials().then(function(){
        return doGet();
      });
    }else{
      return doGet();
    }
  };

  methods.getSecondary = function(url, regex, params) {
    return refreshCredentials().then(function(){
      if (regex.test(url)){
        return HttpClientService.getSecondary(getUrlPrefix() + url, params);
      }else {
        emitRegexException(regex, 'get', url);
      }
    });
  };

  methods.deleteOffline = function(url, regex, params) {
    return refreshCredentials().then(function(){
      if (regex.test(url)){
        return HttpClientService.deleteOffline(getUrlPrefix() + url, params);
      }else {
        emitRegexException(regex, 'delete', url);
      }
    });

  };

  methods.deleteOnline = function(url, regex) {
    return refreshCredentials().then(function(){
      if (regex.test(url)){
        return HttpClientService.deleteOnline(getUrlPrefix() + url);
      }else {
        emitRegexException(regex, 'delete', url);
      }
    });
  };

  methods.put = function(url, regex, params, data) {
    return refreshCredentials().then(function(){
      if (regex.test(url)){
        return HttpClientService.put(getUrlPrefix() + url, params, data);
      }else {
        emitRegexException(regex, 'put', url);
      }
    });
  };

  methods.putOnline = function(url, regex, data) {
    return refreshCredentials().then(function(){
      if (regex.test(url)){
        return HttpClientService.putOnline(getUrlPrefix() + url, data);
      }else {
        emitRegexException(regex, 'post', url);
      }
    });
  };

  methods.postPrimary = function(url, regex, data) {
    if (regex.test(url)){
      return HttpClientService.postPrimary(getUrlPrefix() + url, data);
    }else {
      emitRegexException(regex, 'post', url);
    }
  };

  methods.postOnline = function(url, regex, data, skipRefresh, skipLogStatus) {
    function doPostOnline(url, regex, data, skipLogStatus){
      if (regex.test(url)){
        return HttpClientService.postOnline(getUrlPrefix() + url, data, skipLogStatus);
      }else {
        emitRegexException(regex, 'post', url);
      }
    }
    if (!skipRefresh){
      return refreshCredentials().then(function(){
        return doPostOnline(url, regex, data, skipLogStatus);
      });
    }else{
      return doPostOnline(url, regex, data, skipLogStatus);
    }
  };

  methods.post = function(url, regex, params, data) {
    return refreshCredentials().then(function(){
      if (regex.test(url)){
        return HttpClientService.post(getUrlPrefix() + url, params, data);
      }else {
        emitRegexException(regex, 'post', url);
      }
    });
  };

  // Callback registration
  methods.registerRefreshCredentialsCallback = function(callback){
    refreshCredentialsCallback = callback;
  };
  methods.registerPrimaryPostCallback = function(callback){
    HttpClientService.registerCallback('primary', callback);
  };
  methods.registerSecondaryGetCallback = function(callback){
    HttpClientService.registerCallback('secondary', callback);
  };
  methods.registerDefaultCallback = function(callback){
    HttpClientService.registerCallback('default', callback);
  };
  methods.registerOnlineStatusCallback = function(callback){
    HttpClientService.registerCallback('online', callback);
  };

  return methods;
}

BackendClientService.$inject = ['$q', '$rootScope', 'base64', 'HttpClientService', 'UserSessionService'];
angular.module('em.services').factory('BackendClientService', BackendClientService);
