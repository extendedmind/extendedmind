"use strict";

var emAuthenticate = angular.module('em.userAuthenticate', []);

emAuthenticate.factory('UserAuthenticate', function($http) {
  var userLoggedIn = false;
  var loggedUser = {};
  return {
    isUserLoggedIn : function(user) {
      return userLoggedIn;
    },
    userLogin : function(user, success, error) {
      $http.post('/api/authenticate', user).success(function(authenticateResponse) {
        userLoggedIn = true;
        loggedUser = authenticateResponse;
        success(authenticateResponse);
      }).error(error);
    },
    getUser : function() {
      return loggedUser;
    }
  };
});
