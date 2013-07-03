"use strict";

var emAuthenticate = angular.module('em.userAuthenticate', []);

emAuthenticate.factory('UserAuthenticate', function($http) {
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
