/*global sessionStorage */
/*jslint eqeq: true, white: true */
'use strict';

function userAuthenticate($injector, $location, $rootScope, authenticateRequest, itemsRequest, userSession, userCookie, userSessionStorage) {

  function initData() {
    itemsRequest.getItems();
  }

  function isUserAuthenticated() {
    if (userSessionStorage.isUserAuthenticated()) {
      if (!userSession.getCredentials()) {
        userSession.setEncodedCredentials(userSessionStorage.getHttpAuthorizationHeader());
        initData();
      }
      return true;
    }      
  }

  return {
    authenticate : function(deferred) {

      if (isUserAuthenticated()) {
        deferred.resolve();
      } else if (userCookie.isUserRemembered()) {

        userSession.setCredentials('token', userCookie.getUserToken());
        userSession.setUserRemembered(true);

        authenticateRequest.login().then(function(authenticateResponse) {
          userSession.setUserSessionData(authenticateResponse);
          deferred.resolve();
          initData();
        }, function() {
          $location.path('/login');
          deferred.reject();
        });
      } else {
        $location.path('/login');
        deferred.reject();
      }
      return deferred.promise;
    },
    setActiveUUID : function(uuid) {
      userSessionStorage.setActiveUUID(uuid);
      initData();
    },
    checkActiveUUIDOnResponseError : function() {
      return userSessionStorage.isUserAuthenticated();
    },
    authenticateOnResponseError : function() {

      if (userCookie.isUserRemembered()) {

        userSession.setCredentials('token', userCookie.getUserToken());
        userSession.setUserRemembered(true);

        return true;
      }
      return false;
    },
    loginAndRetryRequest : function(rejection) {
      var httpRequest;

      authenticateRequest.login().then(function(authenticateResponse) {
        userSession.setUserSessionData(authenticateResponse);

        httpRequest = httpRequest || $injector.get('httpRequest');
        httpRequest.config(rejection.config).then(function(response) {
          return response;
        }, function(response) {
          return response;
        });
      });
    }
  };
}


userAuthenticate.$inject = ['$injector', '$location', '$rootScope', 'authenticateRequest', 'itemsRequest', 'userSession', 'userCookie', 'userSessionStorage'];
angular.module('em.services').factory('userAuthenticate', userAuthenticate);

function userSession(base64, httpBasicAuth, userCookie, userSessionStorage) {

  var rememberMe = false;

  return {
    setUserSessionData : function(authenticateResponse) {

      userSessionStorage.setUserUUID(authenticateResponse.userUUID);

      userSessionStorage.setActiveUUID(authenticateResponse.userUUID);

      this.setCredentials('token', authenticateResponse.token);
      userSessionStorage.setHttpAuthorizationHeader(this.getCredentials());

      if (this.getUserRemembered()) {
        userCookie.setUserToken(authenticateResponse.token);
      } else {
          // temporary token cookie clear for new user login, when !rememberMe
          // TODO: no login page when user is logged in
          userCookie.clearUserToken();
        }

        if (authenticateResponse.collectives) {
          userSessionStorage.setCollectives(authenticateResponse.collectives);
        }

      },
      setCredentials : function(username, password) {
        this.setEncodedCredentials(base64.encode(username + ':' + password));
      },
      setEncodedCredentials : function(userpass) {
        httpBasicAuth.setEncodedCredentials(userpass);
      },
      getCredentials : function() {
        return httpBasicAuth.getCredentials();
      },
      setUserRemembered : function(remember) {
        rememberMe = remember;
      },
      getUserRemembered : function() {
        return rememberMe;
      }
    };
  }


  userSession.$inject = ['base64', 'httpBasicAuth', 'userCookie', 'userSessionStorage'];
  angular.module('em.services').factory('userSession', userSession);

  angular.module('em.services').factory('authenticateRequest', ['httpRequest', 'userCookie', 'userSession', 'userSessionStorage',
    function(httpRequest, userCookie, userSession, userSessionStorage) {

      function clearUser() {
        userSessionStorage.clearActiveUUID();
        userSessionStorage.clearUserUUID();
        userSessionStorage.clearCollectives();
        userSessionStorage.clearHttpAuthorizationHeader();

        userCookie.clearUserToken();
      }

      return {
        login : function() {
          return httpRequest.post('/api/authenticate', {
            rememberMe : userSession.getUserRemembered()
          }).then(function(authenticateResponse) {
            return authenticateResponse.data;
          });
        },
        logout : function() {
          return httpRequest.post('/api/logout').then(function(logoutResponse) {
            clearUser();
            return logoutResponse.data;
          });
        },
        account : function() {
          return httpRequest.get('/api/account').then(function(accountResponse) {
            return accountResponse.data;
          });
        }
      };
    }]);

angular.module('em.services').factory('userCookie', [
  function() {

    return {
      setUserToken : function(token) {
        $.cookie('token', token, {
          expires : 7,
          path : '/'
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

angular.module('em.services').factory('userSessionStorage', [
  function() {

    return {
      setHttpAuthorizationHeader : function(authorizationHeader) {
        sessionStorage.setItem('authorizationHeader', authorizationHeader);
      },
      getHttpAuthorizationHeader : function() {
        return sessionStorage.getItem('authorizationHeader');
      },
      clearHttpAuthorizationHeader : function() {
        sessionStorage.removeItem('authorizationHeader');
      },
      setActiveUUID : function(uuid) {
        sessionStorage.setItem('activeUUID', uuid);
      },
      getActiveUUID : function() {
        return sessionStorage.getItem('activeUUID');
      },
      clearActiveUUID : function() {
        sessionStorage.removeItem('activeUUID');
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
      setCollectives : function(collectives) {
        sessionStorage.setItem('collectives', JSON.stringify(collectives));
      },
      getCollectives : function() {
        return JSON.parse(sessionStorage.getItem('collectives'));
      },
      clearCollectives : function() {
        sessionStorage.removeItem('collectives');
      },
      isUserAuthenticated : function() {
        return sessionStorage.getItem('authorizationHeader') != null;
      }
    };
  }]);
