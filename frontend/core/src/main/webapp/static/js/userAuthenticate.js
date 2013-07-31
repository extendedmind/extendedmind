// AngularJS does not support cookie expiration:
// https://github.com/angular/angular.js/pull/2459.
//
// Using JQUery cookie instead
// http://stackoverflow.com/questions/1458724/how-to-set-unset-cookie-with-jquery
// http://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.3.1/jquery.cookie.min.js
// }

"use strict";

var emAuthenticate = angular.module('em.userAuthenticate', ['em.base64']);

emAuthenticate.factory('UserAuthenticate', ['Auth', 'User', 'UserLogin',
function(Auth, User, UserLogin) {
  return {
    userAuthenticate : function(username, password, remember) {
      Auth.setCredentials(username, password);
      UserLogin.userLogin(function(authenticateResponse) {
        User.setUserToken(authenticateResponse.token.toString(), remember);
        User.setUserUUID(authenticateResponse.userUUID);
        Auth.setCredentials('token', authenticateResponse.token);
      }, function(error) {
        return false;
      });
      return true;
    }
  };
}]);

emAuthenticate.factory('Auth', ['$http', 'Base64',
function($http, Base64) {
  // initialize to whatever is in the cookie, if anything
  $http.defaults.headers.common['Authorization'] = 'Basic ' + sessionStorage.getItem('token');
  // $http.defaults.headers.common['Authorization'] = '';

  return {
    setCredentials : function(username, password) {
      var encoded = Base64.encode(username + ':' + password);
      $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
      sessionStorage.setItem('token', encoded);
    },
    clearCredentials : function() {
      document.execCommand("ClearAuthenticationCache");
      sessionStorage.removeItem('token');
      $http.defaults.headers.common.Authorization = 'Basic ';
    }
  };
}]);

emAuthenticate.factory('UserLogin', ['$http', 'User',function($http, User) {

  return {
    userLogin : function(success, error) {
      $http({
        method : 'POST',
        url : '/api/authenticate'
      }).success(success).error(error);
    },
    userLogout : function() {
      // Auth.clearCredentials();
      // User.clearUser();
    }
  };
}]);

emAuthenticate.factory('User', [
function() {
  return {
    setUserToken : function(token, remember) {
      if (remember) {
        $.cookie('token', token, {
          expires : 7
        });
      }
      sessionStorage.setItem('token', token);
    },
    getUserToken : function() {
      return $.cookie('token');
    },
    clearUserToken : function() {
      $.removeCookie('token');
      sessionStorage.removeItem('token');
    },
    setUserUUID : function(userUUID) {
      sessionStorage.setItem('userUUID', userUUID);
    },
    getUserUUID : function() {
      return sessionStorage.getItem('userUUID');
    },
    isUserAuthenticated : function() {
      return sessionStorage.getItem('token') != null;
    },
    isUserRemembered : function() {
      return $.cookie('token') != null;
    }
  };
}]);
