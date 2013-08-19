'use strict';

emServices.config(['$httpProvider',
function($httpProvider) {
  $httpProvider.interceptors.push('httpInterceptor');
}]);

emServices.factory('httpInterceptor', ['$q', '$rootScope',
function($q, $rootScope) {
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
      // Http 401 will cause a browser to display a login dialog
      // http://stackoverflow.com/questions/86105/how-can-i-supress-the-browsers-authentication-dialog
      if (rejection.status === 403) {
        $rootScope.$broadcast('event:authenticationRequired');
      } else if (rejection.status === 419) {
        $rootScope.$broadcast('event:authenticationRequired');
      }
      return $q.reject(rejection);
    }
  };
}]);

emServices.factory('HttpBasicAuth', ['$http', 'Base64',
function($http, Base64) {
  $http.defaults.headers.common['Authorization'] = 'Basic ';
  var encoded;

  return {
    setCredentials : function(username, password) {
      encoded = Base64.encode(username + ':' + password);
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
