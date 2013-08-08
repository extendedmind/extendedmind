// AngularJS does not support cookie expiration:
// https://github.com/angular/angular.js/pull/2459.
//
// Using JQUery cookie instead
// http://stackoverflow.com/questions/1458724/how-to-set-unset-cookie-with-jquery
// http://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.3.1/jquery.cookie.min.js
// }

"use strict";

var emAuthenticate = angular.module('em.userAuthenticate', ['em.base64']);

emAuthenticate.factory('UserAuthenticate', ['$http', '$location', '$rootScope', 'HttpBasicAuth', 'UserCookie', 'UserLogin', 'UserSessionStorage',
function($http, $location, $rootScope, HttpBasicAuth, UserCookie, UserLogin, UserSessionStorage) {

  return {
    userAuthenticate : function() {
      if (UserCookie.isUserRemembered()) {
        this.setCredentials('token', UserCookie.getUserToken());
        this.userLogin(true);
      } else {
        $rootScope.$broadcast('event:loginRequired');
      }
    },
    setCredentials : function(username, password) {
      HttpBasicAuth.setCredentials(username, password);
    },
    userLogin : function(remember) {
      UserLogin.userLogin(function(authenticateResponse) {
        HttpBasicAuth.setCredentials('token', authenticateResponse.token);
        var token = HttpBasicAuth.getCredentials();

        if (remember) {
          UserCookie.setUserToken(token);
        }

        UserSessionStorage.setUserToken(token);
        UserSessionStorage.setUserUUID(authenticateResponse.userUUID)
        $rootScope.$broadcast('event:loginSuccess');
      }, function(error) {
        $rootScope.$broadcast('event:loginRequired');
      });
    }
  };
}]);

emAuthenticate.factory('UserLogin', ['$http',
function($http) {
  return {
    userLogin : function(success, error) {
      $http({
        method : 'POST',
        url : '/api/authenticate'
      }).success(function(authenticateResponse) {
        success(authenticateResponse);
      }).error(function(authenticateResponse) {
        error(authenticateResponse);
      });
    }
  };
}]);

emAuthenticate.factory('HttpBasicAuth', ['$http', 'Base64',
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
