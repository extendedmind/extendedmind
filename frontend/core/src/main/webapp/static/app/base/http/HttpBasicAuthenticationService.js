/*global angular */
'use strict';

angular.module('em.services').factory('HttpBasicAuthenticationService', ['$http',
  function($http) {
    $http.defaults.headers.common.Authorization = 'Basic ';
    var credentials;

    return {
      setCredentials: function(encodedCredentials) {
        credentials = encodedCredentials;
        $http.defaults.headers.common.Authorization = 'Basic ' + credentials;
      },
      getCredentials: function() {
        return credentials;
      }
    };
  }]);
