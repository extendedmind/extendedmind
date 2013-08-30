/*global $, angular*/

( function() {'use strict';

    angular.module('em.services').factory('userFactory', ['httpBasicAuth', 'userCookie', 'userSessionStorage',
    function(httpBasicAuth, userCookie, userSessionStorage) {
      var rememberMe;
      return {
        setUserSessionData : function(authenticateResponse) {
          this.setCredentials('token', authenticateResponse.token);
          var token = httpBasicAuth.getCredentials();
          userSessionStorage.setUserToken(token);
          userSessionStorage.setUserUUID(authenticateResponse.userUUID);
          if (this.getUserRemembered()) {
            userCookie.setUserToken(token);
          }
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

    angular.module('em.services').factory('userAuthenticate', ['$rootScope', 'httpRequest', 'userFactory', 'userCookie', 'userSessionStorage',
    function($rootScope, httpRequest, userFactory, userCookie, userSessionStorage) {
      return {
        authenticate : function() {
          if (userCookie.isUserRemembered()) {
            userFactory.setCredentials('token', userCookie.getUserToken());
            userFactory.setUserRemembered(true);

            this.login(function() {
              $rootScope.$broadcast('event:loginSuccess');
            }, function(error) {
            });

          } else if (userSessionStorage.isUserAuthenticated()) {
            userFactory.setCredentials('token', userSessionStorage.getUserToken());
          } else {
            $rootScope.$broadcast('event:loginRequired');
          }
        },
        login : function(success, error) {
          httpRequest.post('/api/authenticate', {
            rememberMe : userFactory.getUserRemembered()
          }, function(authenticateResponse) {
            userFactory.setUserSessionData(authenticateResponse);
            success();
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
