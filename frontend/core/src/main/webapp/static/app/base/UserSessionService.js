/*global angular */
'use strict';

function UserSessionService($q, base64, HttpBasicAuthenticationService, LocalStorageService, SessionStorageService) {
  var rememberMe = false;

  return {
    setUserData: function(authenticateResponse) {
      var authEpoch = Date.now();

      this.setCredentials('token', authenticateResponse.token);
      SessionStorageService.setHttpAuthorizationHeader(this.getCredentials());

      SessionStorageService.setUserUUID(authenticateResponse.userUUID);
      SessionStorageService.setUserType(authenticateResponse.userType);
      SessionStorageService.setCollectives(authenticateResponse.collectives);
      SessionStorageService.setActiveUUID(authenticateResponse.userUUID);
      SessionStorageService.setAuthenticated(authEpoch);

      if (this.getUserRemembered()) {
        LocalStorageService.setUserUUID(authenticateResponse.userUUID);
        LocalStorageService.setHttpAuthorizationHeader(this.getCredentials());
        LocalStorageService.setUserType(authenticateResponse.userType);
        LocalStorageService.setCollectives(authenticateResponse.collectives);
        LocalStorageService.setAuthenticated(authEpoch);
      }

    },
    setUserSessionStorageData: function() {
      SessionStorageService.setUserUUID(LocalStorageService.getUserUUID());
      SessionStorageService.setHttpAuthorizationHeader(LocalStorageService.getHttpAuthorizationHeader());
      SessionStorageService.setUserType(LocalStorageService.getUserType());
      SessionStorageService.setCollectives(LocalStorageService.getCollectives());
      SessionStorageService.setActiveUUID(LocalStorageService.getUserUUID());
      SessionStorageService.setAuthenticated(LocalStorageService.getAuthenticated());
      this.setEncodedCredentials(SessionStorageService.getHttpAuthorizationHeader());
    },
    setCredentials: function(username, password) {
      this.setEncodedCredentials(base64.encode(username + ':' + password));
    },
    setEncodedCredentials: function(userpass) {
      HttpBasicAuthenticationService.setEncodedCredentials(userpass);
    },
    getCredentials: function() {
      return HttpBasicAuthenticationService.getCredentials();
    },
    setUserRemembered: function(remember) {
      rememberMe = remember || false;
    },
    getUserRemembered: function() {
      return rememberMe;
    },
    getAuth: function() {
      if (localStorage.getItem('authenticated') && sessionStorage.getItem('authenticated') !== localStorage.getItem('authenticated')) {

        SessionStorageService.setUserUUID(LocalStorageService.getUserUUID());
        SessionStorageService.setHttpAuthorizationHeader(LocalStorageService.getHttpAuthorizationHeader());
        SessionStorageService.setUserType(LocalStorageService.getUserType());
        SessionStorageService.setCollectives(LocalStorageService.getCollectives());
        SessionStorageService.setActiveUUID(LocalStorageService.getUserUUID());
        SessionStorageService.setAuthenticated(LocalStorageService.getAuthenticated());

        this.setEncodedCredentials(SessionStorageService.getHttpAuthorizationHeader());
      }
    }
  };
}
UserSessionService.$inject = ['$q', 'base64', 'HttpBasicAuthenticationService', 'LocalStorageService', 'SessionStorageService'];
angular.module('em.services').factory('UserSessionService', UserSessionService);
