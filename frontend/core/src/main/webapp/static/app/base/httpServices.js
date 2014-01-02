/*global angular, urlPrefix */
'use strict';

angular.module('em.services').config(['$httpProvider',
  function($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
  }]);

function httpInterceptor($q, errorHandler) {

  return {
    request : function(config) {
      return config || $q.when(config);
    },
    requestError : function(rejection) {
      return $q.reject(rejection);
    },
    response : function(response) {
      return response || $q.when(response);
    },
    responseError : function(rejection) {
      errorHandler.setError(rejection.data);
      return $q.reject(rejection);
    }
  };
}
httpInterceptor.$inject = ['$q', 'errorHandler'];
angular.module('em.services').factory('httpInterceptor', httpInterceptor);

angular.module('em.services').factory('httpBasicAuth', ['$http',
  function($http) {
    $http.defaults.headers.common.Authorization = 'Basic ';
    var encoded;

    return {
      setEncodedCredentials : function(userpass) {
        encoded = userpass;
        $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
      },
      getCredentials : function() {
        return encoded;
      },
      clearCredentials : function() {
        $http.defaults.headers.common.Authorization = 'Basic ';
      }
    };
  }]);

angular.module('em.services').factory('httpRequest', ['$http', 'UserSessionService',
  function($http, UserSessionService) {

    var httpRequest = {};

    function getUrlPrefix() {
      // http://stackoverflow.com/a/3390426
      if (typeof urlPrefix !== 'undefined') {
        return urlPrefix;
      }
      return '';
    }

    httpRequest.config = function(config) {
      UserSessionService.getAuth();

      return $http(config).then(function(success) {
        return success;
      });
    };

    httpRequest.get = function(url) {
      UserSessionService.getAuth();

      return $http({
        method : 'GET',
        url : getUrlPrefix() + url
      }).then(function(success) {
        return success;
      });
    };

    angular.forEach(['delete', 'head', 'jsonp'], function(name) {
      httpRequest[name] = function(url) {
        UserSessionService.getAuth();

        return $http({
          method : name,
          url : getUrlPrefix() + url
        }).then(function(success) {
          return success;
        });
      };
    });

    angular.forEach(['post', 'put'], function(name) {
      httpRequest[name] = function(url, data) {
        UserSessionService.getAuth();

        return $http[name](getUrlPrefix() + url, data).then(function(success) {
          return success;
        });
      };
    });

    return httpRequest;
  }]);
