"use strict";

var emAuthenticate = angular.module('em.userAuthenticate', ['ngCookies']);

emAuthenticate.factory('UserAuthenticate', ['$http', 'User',function($http, User) {
  return {
    userLogin : function(user, success, error) {
      $http.post('/api/authenticate', user).success(function(authenticateResponse) {
        User.setUser(authenticateResponse);
        success();
      }).error(error);
    },
    userLogout : function() {
      User.setUser();
    }
  };
}]);

emAuthenticate.factory('User', ['$cookieStore',
function($cookieStore) {
  return {
    setUser : function(user) {
      if (user == undefined) {
        $cookieStore.remove('user');
      } else
        $cookieStore.put('user', user);
    },
    getUser : function() {
      return $cookieStore.get('user');
    },
    getUserUUID : function() {
      return $cookieStore.get('user').userUUID;
    },
    isUserAuthenticated : function() {
      return $cookieStore.get('user') != undefined;
    }
  };
}]);
