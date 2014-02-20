/* global angular, urlPrefix */
'use strict';

function BackendClientService($rootScope, HttpClientService, HttpBasicAuthenticationService, UserSessionService) {
  var methods = {};

  function getUrlPrefix() {
    // http://stackoverflow.com/a/3390426
    return (typeof urlPrefix !== 'undefined') ? urlPrefix : '';
  }

  methods.uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  methods.apiPrefixRegex = /\/api\//;
  methods.undeleteRegex = /\/undelete/;

  function refreshCredentials() {
    var credentials = UserSessionService.getCredentials();
    if (HttpBasicAuthenticationService.getCredentials() !== credentials){
      HttpBasicAuthenticationService.setCredentials(credentials);
    }
  }

  function emitRegexException(regex, method, url){
    $rootScope.$emit('emException', {type: 'regex', regex: regex, method: method, url: url});
  }

  methods.get = function(url, regex) {
    refreshCredentials();
    if (regex.test(url)){
      return HttpClientService.get(getUrlPrefix() + url);
    }else {
      emitRegexException(regex, 'get', url);
    }
  };

  methods.getSecondary = function(url, regex) {
    refreshCredentials();
    if (regex.test(url)){
      return HttpClientService.getSecondary(getUrlPrefix() + url);
    }else {
      emitRegexException(regex, 'get', url);
    }
  };

  methods.delete = function(url, regex, params) {
    refreshCredentials();
    if (regex.test(url)){
      return HttpClientService.delete(getUrlPrefix() + url, params);
    }else {
      emitRegexException(regex, 'delete', url);
    }
  };

  methods.deleteOnline = function(url, regex) {
    refreshCredentials();
    if (regex.test(url)){
      return HttpClientService.deleteOnline(getUrlPrefix() + url);
    }else {
      emitRegexException(regex, 'delete', url);
    }
  };

  methods.put = function(url, regex, params, data) {
    refreshCredentials();
    if (regex.test(url)){
      return HttpClientService.put(getUrlPrefix() + url, params, data);
    }else {
      emitRegexException(regex, 'put', url);
    }
  };

  methods.putOnline = function(url, regex, data) {
    refreshCredentials();
    if (regex.test(url)){
      return HttpClientService.putOnline(getUrlPrefix() + url, data);
    }else {
      emitRegexException(regex, 'post', url);
    }
  };

  methods.postPrimary = function(url, regex, data) {
    refreshCredentials();
    if (regex.test(url)){
      return HttpClientService.postPrimary(getUrlPrefix() + url, data);
    }else {
      emitRegexException(regex, 'post', url);
    }
  };

  methods.postOnline = function(url, regex, data) {
    refreshCredentials();
    if (regex.test(url)){
      return HttpClientService.postOnline(getUrlPrefix() + url, data);
    }else {
      emitRegexException(regex, 'post', url);
    }
  };

  methods.post = function(url, regex, params, data) {
    refreshCredentials();
    if (regex.test(url)){
      return HttpClientService.post(getUrlPrefix() + url, params, data);
    }else {
      emitRegexException(regex, 'post', url);
    }
  };

  // Callback registration
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

BackendClientService.$inject = ['$rootScope', 'HttpClientService', 'HttpBasicAuthenticationService', 'UserSessionService'];
angular.module('em.services').factory('BackendClientService', BackendClientService);
