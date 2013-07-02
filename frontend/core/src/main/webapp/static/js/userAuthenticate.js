"use strict";

var emAuth = angular.module('em.userAuthenticate', []);

emAuth.factory('UserAuthenticate', function($http) {
  return {
    isUserLoggedIn : function(user) {
    },
    userLogin : function(user, success, error) {
      $http.post('/api/authenticate', user).success(function(user) {
        success(user);
      }).error(error);
    }
  };
});
