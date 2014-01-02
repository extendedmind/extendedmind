/*global angular */
'use strict';

function UserSessionService($q, base64, httpBasicAuth, userLocalStorage, userSessionStorage) {
  var rememberMe = false;

  return {
    setUserData: function(authenticateResponse) {
      var authEpoch = Date.now();

      this.setCredentials('token', authenticateResponse.token);
      userSessionStorage.setHttpAuthorizationHeader(this.getCredentials());

      userSessionStorage.setUserUUID(authenticateResponse.userUUID);
      userSessionStorage.setUserType(authenticateResponse.userType);
      userSessionStorage.setCollectives(authenticateResponse.collectives);
      userSessionStorage.setActiveUUID(authenticateResponse.userUUID);
      userSessionStorage.setAuthenticated(authEpoch);

      if (this.getUserRemembered()) {
        userLocalStorage.setUserUUID(authenticateResponse.userUUID);
        userLocalStorage.setHttpAuthorizationHeader(this.getCredentials());
        userLocalStorage.setUserType(authenticateResponse.userType);
        userLocalStorage.setCollectives(authenticateResponse.collectives);
        userLocalStorage.setAuthenticated(authEpoch);
      }

    },
    setUserSessionStorageData: function() {
      userSessionStorage.setUserUUID(userLocalStorage.getUserUUID());
      userSessionStorage.setHttpAuthorizationHeader(userLocalStorage.getHttpAuthorizationHeader());
      userSessionStorage.setUserType(userLocalStorage.getUserType());
      userSessionStorage.setCollectives(userLocalStorage.getCollectives());
      userSessionStorage.setActiveUUID(userLocalStorage.getUserUUID());
      userSessionStorage.setAuthenticated(userLocalStorage.getAuthenticated());
      this.setEncodedCredentials(userSessionStorage.getHttpAuthorizationHeader());
    },
    setCredentials: function(username, password) {
      this.setEncodedCredentials(base64.encode(username + ':' + password));
    },
    setEncodedCredentials: function(userpass) {
      httpBasicAuth.setEncodedCredentials(userpass);
    },
    getCredentials: function() {
      return httpBasicAuth.getCredentials();
    },
    setUserRemembered: function(remember) {
      rememberMe = remember || false;
    },
    getUserRemembered: function() {
      return rememberMe;
    },
    getAuth: function() {
      if (localStorage.getItem('authenticated') && sessionStorage.getItem('authenticated') !== localStorage.getItem('authenticated')) {

        userSessionStorage.setUserUUID(userLocalStorage.getUserUUID());
        userSessionStorage.setHttpAuthorizationHeader(userLocalStorage.getHttpAuthorizationHeader());
        userSessionStorage.setUserType(userLocalStorage.getUserType());
        userSessionStorage.setCollectives(userLocalStorage.getCollectives());
        userSessionStorage.setActiveUUID(userLocalStorage.getUserUUID());
        userSessionStorage.setAuthenticated(userLocalStorage.getAuthenticated());

        this.setEncodedCredentials(userSessionStorage.getHttpAuthorizationHeader());
      }
    }
  };
}
UserSessionService.$inject = ['$q', 'base64', 'httpBasicAuth', 'userLocalStorage', 'userSessionStorage'];
angular.module('em.services').factory('UserSessionService', UserSessionService);
