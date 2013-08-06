// AngularJS does not support cookie expiration:
// https://github.com/angular/angular.js/pull/2459.
//
// Using JQUery cookie instead
// http://stackoverflow.com/questions/1458724/how-to-set-unset-cookie-with-jquery
// http://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.3.1/jquery.cookie.min.js
// }

"use strict";

var emAuthenticate = angular.module('em.userAuthenticate', ['em.base64']);

emAuthenticate.factory('UserAuthenticate', ['$http', 'Auth', 'UserCookie', 'UserSessionStorage',
function($http, Auth, UserCookie, UserSessionStorage) {
  var isUserRemembered = false;
  return {
    userAuthenticate : function(user) {
      if (user === undefined) {
        var user = {
          username : 'token',
          password : UserCookie.getUserToken(),
          remember : UserCookie.isUserRemembered()
        };
      }
      Auth.setCredentials(user.username, user.password);
      isUserRemembered = user.remember;
    },
    userLogin : function(success, error) {
      $http({
        method : 'POST',
        url : '/api/authenticate'
      }).success(function(authenticateResponse) {
        Auth.setCredentials('token', authenticateResponse.token);
        var token = Auth.getCredentials();

        if (isUserRemembered) {
          UserCookie.setUserToken(token);
        }

        UserSessionStorage.setUserToken(token);
        UserSessionStorage.setUserUUID(authenticateResponse.userUUID);
        success(authenticateResponse.email);
      }).error(function(authenticateResponse) {
        error(authenticateResponse);
      });
    },
    userLogout : function() {
      Auth.clearCredentials();
      UserCookie.clearUserToken();
      UserSessionStorage.clearUserToken();
    }
  };
}]);

emAuthenticate.factory('Auth', ['$http', 'Base64', 'UserCookie', 'UserSessionStorage',
function($http, Base64, UserCookie, UserSessionStorage) {
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

emAuthenticate.factory('UserCookie', [
function() {
  return {
    setUserToken : function(token) {
      $.cookie('token', token, {
        expires : 7
      });
    },
    getUserToken : function() {
      return $.cookie('token');
    },
    clearUserToken : function() {
      $.removeCookie('token');
    },
    isUserRemembered : function() {
      return $.cookie('token') != null;
    }
  };
}]);

emAuthenticate.factory('UserSessionStorage', [
function() {
  return {
    setUserToken : function(token) {
      sessionStorage.setItem('token', token);
    },
    getUserToken : function() {
      return sessionStorage.getItem('token');
    },
    clearUserToken : function() {
      sessionStorage.removeItem('token');
    },
    setUserUUID : function(userUUID) {
      sessionStorage.setItem('userUUID', userUUID);
    },
    getUserUUID : function() {
      return sessionStorage.getItem('userUUID');
    },
    clearUserUUID : function() {
      sessionStorage.removeItem('userUUID');
    },
    isUserAuthenticated : function() {
      return sessionStorage.getItem('token') != null;
    }
  };
}]);
