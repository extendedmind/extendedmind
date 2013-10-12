/*global $, angular*/
/*jslint eqeq: true */

( function() {'use strict';

    angular.module('em.services').factory('userAuthenticate', ['$location', '$q', 'authenticateRequest', 'userSession', 'userCookie', 'userSessionStorage',
    function($location, $q, authenticateRequest, userSession, userCookie, userSessionStorage) {
      return {
        authenticate : function() {

          if (userSessionStorage.isUserAuthenticated()) {
            if (!userSession.getCredentials()) {
              userSession.setEncodedCredentials(userSessionStorage.getHttpAuthorizationHeader());
            }
          } else if (userCookie.isUserRemembered()) {
            var deferred = $q.defer();
            userSession.setCredentials('token', userCookie.getUserToken());
            userSession.setUserRemembered(true);

            authenticateRequest.login(function(authenticateResponse) {
              deferred.resolve(userSession.setUserSessionData(authenticateResponse));
              $location.path('/my');
            }, function(error) {
              $location.path('/login');
            });
            return deferred.promise;
          } else {
            $location.path('/login');
          }
        }
      };
    }]);

    angular.module('em.services').factory('userSession', ['base64', 'httpBasicAuth', 'userCookie', 'userSessionStorage',
    function(base64, httpBasicAuth, userCookie, userSessionStorage) {

      var rememberMe = false;

      return {
        setUserSessionData : function(authenticateResponse) {

          this.setCredentials('token', authenticateResponse.token);
          userSessionStorage.setHttpAuthorizationHeader(this.getCredentials());

          if (this.getUserRemembered()) {
            userCookie.setUserToken(authenticateResponse.token);
          }

          userSessionStorage.setUserUUID(authenticateResponse.userUUID);
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
          return sessionStorage.getItem('authorizationHeader') != null;
        }
      };
    }]);
  }());
