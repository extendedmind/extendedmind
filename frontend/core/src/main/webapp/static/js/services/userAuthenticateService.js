'use strict';

emServices.factory('User', ['HttpBasicAuth', 'UserCookie', 'UserSessionStorage',
function(HttpBasicAuth, UserCookie, UserSessionStorage) {
  var rememberMe;
  return {
    setUserSessionData : function(authenticateResponse) {
      this.setCredentials('token', authenticateResponse.token);
      var token = HttpBasicAuth.getCredentials();
      UserSessionStorage.setUserToken(token);
      UserSessionStorage.setUserUUID(authenticateResponse.userUUID);
      if (this.getUserRemembered()) {
        UserCookie.setUserToken(token);
      }
    },
    setCredentials : function(username, password) {
      HttpBasicAuth.setCredentials(username, password);
    },
    setUserRemembered : function(remember) {
      rememberMe = remember;
    },
    getUserRemembered : function() {
      return rememberMe === true;
    }
  };
}]);

emServices.factory('UserAuthenticate', ['$rootScope', 'User', 'UserCookie', 'UserLogin', 'UserSessionStorage',
function($rootScope, User, UserCookie, UserLogin, UserSessionStorage) {
  return {
    userAuthenticate : function() {
      if (UserCookie.isUserRemembered()) {
        User.setCredentials('token', UserCookie.getUserToken());
        User.setUserRemembered(true);

        this.userLogin(function() {
          $rootScope.$broadcast('event:loginSuccess');
        }, function(error) {
        });

      } else if (UserSessionStorage.isUserAuthenticated()) {
        User.setCredentials('token', UserSessionStorage.getUserToken());
      } else {
        $rootScope.$broadcast('event:loginRequired');
      }
    },
    userLogin : function(success, error) {
      UserLogin.userLogin(function(authenticateResponse) {
        User.setUserSessionData(authenticateResponse);
        success();
      }, function(authenticateResponse) {
        error(authenticateResponse);
      });
    }
  };
}]);

emServices.factory('UserLogin', ['$http', 'User',
function($http, User) {
  return {
    userLogin : function(success, error) {
      $http({
        method : 'POST',
        url : '/api/authenticate',
        data : {
          rememberMe : User.getUserRemembered()
        }
      }).success(function(authenticateResponse) {
        success(authenticateResponse);
      }).error(function(authenticateResponse) {
        error(authenticateResponse);
      });
    }
  };
}]);

emServices.factory('UserCookie', [
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

emServices.factory('UserSessionStorage', [
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
