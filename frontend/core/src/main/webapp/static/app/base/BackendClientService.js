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
  methods.hexCodeRegex = /[0-9a-f]+/;

  var refreshCredentialsCallback;

  function refreshCredentials(online) {
    function doRefreshCredentials() {
      var credentials = UserSessionService.getCredentials();
      if (HttpClientService.getCredentials() !== credentials) {
        HttpClientService.setCredentials(credentials);
      }
    }
    if (UserSessionService.isFakeUser()){
      var deferred = $q.defer();
      deferred.resolve();
      HttpClientService.setCacheOnly(true);
      return deferred.promise;
    }else{
      HttpClientService.setCacheOnly(false);
    }

    if (refreshCredentialsCallback) {
      return refreshCredentialsCallback(online).then(function() {
        return doRefreshCredentials();
      }, function(error){
        return $q.reject(error);
      });
    } else {
      var deferred = $q.defer();
      doRefreshCredentials();
      deferred.resolve();
      return deferred.promise;
    }
  }

  function emitRegexException(regex, method, url) {
    var regexError = {type: 'regex', value: {regex: regex.source, method: method, url: url}};
    $rootScope.$emit('emException', regexError);
    return $q.reject(regexError);
  }

  /**
   * @param {Object} Http result.
   * @returns {Object} Result data.
   */
   function handleHttpSuccess(httpResult) {
    return httpResult.data;
  }

  function handleHttpError(httpError) {
    if (httpError.value.status === 400) {
      return $q.reject({type: 'badRequest', value: httpError.value});
    } else if (httpError.value.status === 403) {
      return $q.reject({type: 'forbidden', value: httpError.value});
    } else if (HttpClientService.isOffline(httpError.value.status)) {
      return $q.reject({type: 'offline', value: httpError.value});
    } else {
      return emitHttpException(httpError);
    }
  }

  function emitHttpException(httpError) {
    $rootScope.$emit('emException', httpError);
    return $q.reject(httpError);
  }

  // Method for setting credentials to all subsequent http calls
  methods.setCredentials = function(credentials) {
    return HttpClientService.setCredentials(credentials);
  };
  methods.setUsernamePassword = function(username, password) {
    return HttpClientService.setCredentials(base64.encode(username + ':' + password));
  };

  methods.get = function(url, regex, skipRefresh) {
    function doGet() {
      if (regex.test(url)) {
        return HttpClientService.get(getUrlPrefix() + url).then(handleHttpSuccess, handleHttpError);
      } else {
        return emitRegexException(regex, 'get', url);
      }
    }
    if (!skipRefresh) {
      return refreshCredentials(true).then(function() {
        return doGet();
      });
    } else {
      return doGet();
    }
  };

  methods.getSecondary = function(url, regex, params, online) {
    return refreshCredentials(online).then(function() {
      if (regex.test(url)) {
        if (online) {
          return HttpClientService.get(getUrlPrefix() + url).then(handleHttpSuccess, handleHttpError);
        } else {
          return HttpClientService.getSecondary(getUrlPrefix() + url, params);
        }
      } else {
        return emitRegexException(regex, 'get', url);
      }
    });
  };

  methods.getBeforeLast = function(url, regex, params, online) {
    return refreshCredentials(online).then(function() {
      if (regex.test(url)) {
        if (online) {
          return HttpClientService.get(getUrlPrefix() + url).then(handleHttpSuccess, handleHttpError);
        } else {
          return HttpClientService.getBeforeLast(getUrlPrefix() + url, params);
        }
      } else {
        return emitRegexException(regex, 'get', url);
      }
    });
  };

  methods.deleteOffline = function(url, regex, params, data, timestamp) {
    return refreshCredentials().then(function() {
      if (regex.test(url)) {
        return HttpClientService.deleteOffline(getUrlPrefix() + url, params, data, timestamp);
      } else {
        return emitRegexException(regex, 'delete', url);
      }
    });

  };

  methods.deleteOnline = function(url, regex, data) {
    return refreshCredentials(true).then(function() {
      if (regex.test(angular.isObject(url) ? url.value : url)) {
        return HttpClientService.deleteOnline(getUrlPrefix(), url, data).then(handleHttpSuccess,
                                                                              handleHttpError);
      } else {
        return emitRegexException(regex, 'delete', url);
      }
    });
  };

  methods.putOffline = function(url, regex, params, data, timestamp) {
    return refreshCredentials().then(function() {
      if (regex.test(url)) {
        return HttpClientService.putOffline(getUrlPrefix() + url, params, data, timestamp);
      } else {
        return emitRegexException(regex, 'put', url);
      }
    });
  };

  methods.putOnline = function(url, regex, data) {
    return refreshCredentials(true).then(function() {
      if (regex.test(url)) {
        return HttpClientService.putOnline(getUrlPrefix() + url, data).then(handleHttpSuccess,
                                                                            handleHttpError);
      } else {
        return emitRegexException(regex, 'put', url);
      }
    });
  };

  methods.putOnlineWithUsernamePassword = function(url, regex, data, username, password) {
    if (regex.test(url)) {
      var usernamePasswordCredentials = base64.encode(username + ':' + password);
      return HttpClientService.putOnlineWithCredentials(getUrlPrefix() + url, data,
                                                        usernamePasswordCredentials)
      .then(handleHttpSuccess, handleHttpError);
    } else {
      return emitRegexException(regex, 'put', data);
    }
  };

  methods.postPrimary = function(url, regex, data) {
    if (regex.test(url)) {
      return HttpClientService.postPrimary(getUrlPrefix() + url, data);
    } else {
      return emitRegexException(regex, 'post', url);
    }
  };

  methods.clearPrimary = function() {
    HttpClientService.clearPrimary();
  };

  methods.postOnline = function(url, regex, data, skipRefresh, bypassQueue) {
    function doPostOnline(url, regex, data, bypassQueue) {
      if (regex.test(angular.isObject(url) ? url.value : url)) {
        return HttpClientService.postOnline(getUrlPrefix(),
                                            url, data, bypassQueue).then(handleHttpSuccess,
                                                                         handleHttpError);
      } else {
        return emitRegexException(regex, 'post', url);
      }
    }
    if (!skipRefresh) {
      return refreshCredentials(true).then(function() {
        return doPostOnline(url, regex, data, bypassQueue);
      });
    } else {
      return doPostOnline(url, regex, data, bypassQueue);
    }
  };

  methods.postOffline = function(url, regex, params, data, timestamp) {
    return refreshCredentials().then(function() {
      if (regex.test(url)) {
        return HttpClientService.postOffline(getUrlPrefix() + url, params, data, timestamp);
      } else {
        return emitRegexException(regex, 'post', url);
      }
    });
  };

  methods.getUrlPrefix = function() {
    return getUrlPrefix();
  };

  methods.generateFakeTimestamp = function() {
    // Use the backend delta that's received from authentication, or 0 if backend delta is not found
    var backendDelta = UserSessionService.getBackendDelta();
    if (!backendDelta) backendDelta = 0;
    return Date.now() + backendDelta;
  };

  methods.notifyOwnerUUIDChange = function(oldUUID, newUUID){
    HttpClientService.notifyOwnerUUIDChange(oldUUID, newUUID);
  };

  methods.executeRequests = function(){
    return refreshCredentials().then(function() {
      HttpClientService.executeRequests();
    });
  };

  // Callback registration
  methods.registerRefreshCredentialsCallback = function(callback) {
    refreshCredentialsCallback = callback;
  };
  methods.registerPrimaryPostResultCallback = function(callback) {
    HttpClientService.registerCallback('primaryResult', callback);
  };
  methods.registerPrimaryPostCreateCallback = function(callback) {
    HttpClientService.registerCallback('primaryCreate', callback);
  };
  methods.registerSecondaryGetCallback = function(callback) {
    HttpClientService.registerCallback('secondary', callback);
  };
  methods.registerBeforeLastGetCallback = function(callback) {
    HttpClientService.registerCallback('beforeLast', callback);
  };
  methods.registerDefaultCallback = function(callback) {
    HttpClientService.registerCallback('default', callback);
  };
  methods.registerOnlineStatusCallback = function(callback) {
    HttpClientService.registerCallback('online', callback);
  };
  methods.registerQueueEmptiedCallback = function(callback) {
    HttpClientService.registerCallback('queueEmptied', callback);
  };

  return methods;
}

BackendClientService['$inject'] = ['$q', '$rootScope', 'base64', 'HttpClientService', 'UserSessionService'];
angular.module('em.base').factory('BackendClientService', BackendClientService);
