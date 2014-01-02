/*global angular, urlPrefix */
'use strict';

angular.module('em.services').factory('HttpBasicAuthenticationService', ['$http',
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
