'use strict';

function BackendClientService(HttpClientService, HttpBasicAuthenticationService, UserSessionService, ErrorHandlerService) {
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

  methods.get = function(url, regex) {
    refreshCredentials();
    if (regex.test(url)){
      return HttpClientService.get(getUrlPrefix() + url);
    }else {
      ErrorHandlerService.setError('GET to URL ' + url + ' did not match pattern ' + regex);
    }
  };

  methods.delete = function(url, regex) {
    refreshCredentials();
    if (regex.test(url)){
      return HttpClientService.delete(getUrlPrefix() + url);
    }else {
      ErrorHandlerService.setError('DELETE to URL ' + url + ' did not match pattern ' + regex);
    }
  };

  methods.put = function(url, regex, data) {
    refreshCredentials();
    if (regex.test(url)){
      return HttpClientService.put(getUrlPrefix() + url, data);
    }else {
      ErrorHandlerService.setError('PUT to URL ' + url + ' did not match pattern ' + regex);
    }
  };

  methods.post = function(url, regex, data) {
    refreshCredentials();
    if (regex.test(url)){
      return HttpClientService.post(getUrlPrefix() + url, data);
    }else {
      ErrorHandlerService.setError('POST to URL ' + url + ' did not match pattern ' + regex);
    }
  };

  return methods;
}

BackendClientService['$inject'] = ['HttpClientService', 'HttpBasicAuthenticationService', 'UserSessionService', 'ErrorHandlerService'];
angular.module('em.services').factory('BackendClientService', BackendClientService);
