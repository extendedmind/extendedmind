// AngularJS does not support cookie expiration:
// https://github.com/angular/angular.js/pull/2459.
//
// Using JQUery cookie instead
// http://stackoverflow.com/questions/1458724/how-to-set-unset-cookie-with-jquery
// http://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.3.1/jquery.cookie.min.js
// }

"use strict";

var emAuthenticate = angular.module('em.userAuthenticate', ['em.base64']);

emAuthenticate.factory('UserAuthenticate', ['$http', 'Auth', 'User',function($http, Auth, User) {

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

emAuthenticate.factory('Resu', ['Auth', 'User', 'UserAuthenticate',
function(Auth, User, UserAuthenticate) {
  return {
    loglog : function() {
      Auth.setCredentials('token', User.getUserToken());
      UserAuthenticate.userLogin(function(authenticateResponse) {
        User.setUser(authenticateResponse.token.toString(), true);
        Auth.setCredentials('token', authenticateResponse.token);
      }, function(error) {
      });
    }
  };
}]);

emAuthenticate.factory('User', [
function() {
  return {
    setUser : function(token, remember) {
      if (remember) {
        console.log('remember: ' + remember + ', token: ' + token);
        $.cookie('token', token, {
          expires : 7
        });
      }
      sessionStorage.setItem('token', token);
    },
    clearUser : function() {
      $.removeCookie('token');
      sessionStorage.removeItem('token');
    },
    getUserToken : function() {
      return $.cookie('token');
    },
    getUserUUID : function() {
      return sessionStorage.getItem('userUUID');
    },
    isUserRemembered : function() {
      return $.cookie('token') != null;
    },
    isUserAuthenticated : function() {
      return sessionStorage.getItem('token') != null;
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
