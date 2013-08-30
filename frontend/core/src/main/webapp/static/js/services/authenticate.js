/*global $, angular*/

( function() {'use strict';

    angular.module('em.services').factory('userAuthenticate', ['$rootScope', 'authenticateRequest', 'userSession', 'userCookie', 'userSessionStorage',
    function($rootScope, authenticateRequest, userSession, userCookie, userSessionStorage) {
      return {
        authenticate : function() {

          if (userCookie.isUserRemembered()) {
            userSession.setCredentials('token', userCookie.getUserToken());
            userSession.setUserRemembered(true);

            authenticateRequest.login(function(authenticateResponse) {
              userSession.setUserSessionData(authenticateResponse);
              $rootScope.$broadcast('event:loginSuccess');
            }, function(error) {
              $rootScope.$broadcast('event:loginRequired');
            });

          } else if (userSessionStorage.isUserAuthenticated()) {
            userSession.setCredentials('token', userSessionStorage.getUserToken());
          } else {
            $rootScope.$broadcast('event:loginRequired');
          }
        }
      };
    }]);

    angular.module('em.services').factory('userSession', ['httpBasicAuth', 'userCookie', 'userSessionStorage',
    function(httpBasicAuth, userCookie, userSessionStorage) {

      var rememberMe = false;

      return {
        setUserSessionData : function(authenticateResponse) {

          var token = authenticateResponse.token;
          this.setCredentials('token', token);
          userSessionStorage.setUserToken(token);

          if (this.getUserRemembered()) {
            userCookie.setUserToken(token);
          }

          userSessionStorage.setUserUUID(authenticateResponse.userUUID);
        },
        setCredentials : function(username, password) {
          httpBasicAuth.setCredentials(username, password);
        },
        setUserRemembered : function(remember) {
          rememberMe = remember;
        },
        getUserRemembered : function() {
          return rememberMe === true;
        }
      };
    }]);

    angular.module('em.services').factory('authenticateRequest', ['httpRequest', 'userSession',
    function(httpRequest, userSession) {
      return {
        login : function(success, error) {

          httpRequest.post('/api/authenticate', {
            rememberMe : userSession.getUserRemembered()
          }, function(authenticateResponse) {
            success(authenticateResponse);
          }, function(authenticateResponse) {
            error(authenticateResponse);
          });
        }
      };
    }]);

    angular.module('em.services').factory('userCookie', [
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
          return $.cookie('token') !== undefined;
        }
      };
    }]);

    angular.module('em.services').factory('userSessionStorage', [
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
          return sessionStorage.getItem('token') !== null;
        }
      };
    }]);
  }());
