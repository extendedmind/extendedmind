"use strict";

var emAuth = angular.module('auth', []);

emAuth.factory('Auth', function($http) {
  return {
    isLoggedIn : function(user) {
    },
    userLogin : function(user, success, error) {
      $http.post('/api/authenticate', user).success(function(user) {
        success(user);
      }).error(error);
    }
  };
});
