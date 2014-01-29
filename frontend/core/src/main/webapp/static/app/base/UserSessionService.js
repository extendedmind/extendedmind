'use strict';

function UserSessionService($q, base64, HttpBasicAuthenticationService, LocalStorageService, SessionStorageService) {
  var swapTokenBufferTime = 10*60*1000; // 10 minutes in milliseconds

  return {
    isAuthenticated: function() {
      return SessionStorageService.getUserUUID() || LocalStorageService.getUserUUID();
    },
    isAuthenticateValid: function() {
      var authenticateExpiresTime, authenticateValidTime;

      authenticateValidTime = SessionStorageService.getExpires() || LocalStorageService.getExpires();
      authenticateExpiresTime = Date.now() - swapTokenBufferTime;

      if (authenticateValidTime > authenticateExpiresTime) {
        if (!SessionStorageService.getUserUUID()) {
          this.setUserSessionStorageData();
        } else if (!this.getCredentials()) {
          this.setEncodedCredentials(SessionStorageService.getHttpAuthorizationHeader());
        }
        return true;
      }
    },
    isAuthenticateReplaceable: function() {
      var authenticateExpiresTime, authenticateValidTime;

      if (LocalStorageService.getReplaceable()) {
        authenticateValidTime = LocalStorageService.getReplaceable();
        authenticateExpiresTime = Date.now() - swapTokenBufferTime;
        if (authenticateValidTime > authenticateExpiresTime) {
          return true;
        }
      }
    },
    clearUser: function() {
      SessionStorageService.clearUser();
      LocalStorageService.clearUser();
    },

    // setters
    setAuthenticateInformation: function(authenticateResponse) {
      var authExpiresDelta = authenticateResponse.expires - (Date.now() - authenticateResponse.authenticated);
      this.setCredentials('token', authenticateResponse.token);

      SessionStorageService.setActiveUUID(authenticateResponse.userUUID);
      SessionStorageService.setCollectives(authenticateResponse.collectives);
      SessionStorageService.setExpires(authExpiresDelta);
      SessionStorageService.setHttpAuthorizationHeader(this.getCredentials());
      SessionStorageService.setUserType(authenticateResponse.userType);
      SessionStorageService.setUserUUID(authenticateResponse.userUUID);

      if (authenticateResponse.replaceable) {
        LocalStorageService.setExpires(authExpiresDelta);
        LocalStorageService.setCollectives(authenticateResponse.collectives);
        LocalStorageService.setHttpAuthorizationHeader(this.getCredentials());
        LocalStorageService.setReplaceable(authenticateResponse.replaceable);
        LocalStorageService.setUserType(authenticateResponse.userType);
        LocalStorageService.setUserUUID(authenticateResponse.userUUID);
      }
    },
    setUserSessionStorageData: function() {
      SessionStorageService.setActiveUUID(LocalStorageService.getUserUUID());
      SessionStorageService.setCollectives(LocalStorageService.getCollectives());
      SessionStorageService.setExpires(LocalStorageService.getExpires());
      SessionStorageService.setHttpAuthorizationHeader(LocalStorageService.getHttpAuthorizationHeader());
      SessionStorageService.setUserType(LocalStorageService.getUserType());
      SessionStorageService.setUserUUID(LocalStorageService.getUserUUID());

      this.setEncodedCredentials(SessionStorageService.getHttpAuthorizationHeader());
    },
    setActiveUUID: function(uuid) {
      SessionStorageService.setActiveUUID(uuid);
    },
    setCredentials: function(username, password) {
      this.setEncodedCredentials(base64.encode(username + ':' + password));
    },
    setEncodedCredentials: function(userpass) {
      HttpBasicAuthenticationService.setEncodedCredentials(userpass);
    },
    setEncodedCredentialsFromLocalStorage: function() {
      this.setEncodedCredentials(LocalStorageService.getHttpAuthorizationHeader());
    },

    // getters
    getAuth: function() {
      if (localStorage.getItem('expires') && sessionStorage.getItem('expires') !== localStorage.getItem('expires')) {
        this.setUserSessionStorageData();
      }
    },
    getActiveUUID: function() {
      return SessionStorageService.getActiveUUID();
    },
    getCollectives: function() {
      return SessionStorageService.getCollectives();
    },
    getCredentials: function() {
      return HttpBasicAuthenticationService.getCredentials();
    },
    getUserUUID: function() {
      return SessionStorageService.getUserUUID();
    }
  };
}
UserSessionService.$inject = ['$q', 'base64', 'HttpBasicAuthenticationService', 'LocalStorageService', 'SessionStorageService'];
angular.module('em.services').factory('UserSessionService', UserSessionService);
