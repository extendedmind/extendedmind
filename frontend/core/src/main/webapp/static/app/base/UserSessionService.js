'use strict';

function UserSessionService(base64, HttpBasicAuthenticationService, LocalStorageService, SessionStorageService) {
  var swapTokenBufferTime = 10*60*1000; // 10 minutes in milliseconds
  var latestModified = {};
  var itemsSynchronize = {};
  var ownerPrefix = 'my'; // default owner

  function setOwnerPrefix(owner) {
    ownerPrefix = owner;
  }

  return {
    isAuthenticated: function() {
      return SessionStorageService.getUserUUID() || LocalStorageService.getUserUUID();
    },
    isAuthenticateValid: function() {
      var authenticateExpiresTime, authenticateValidTime;

      authenticateValidTime = SessionStorageService.getExpires() || LocalStorageService.getExpires();
      authenticateExpiresTime = Date.now() - swapTokenBufferTime;

      // If authentication valid, refresh session storage and encoded credentials for
      // HTTP Authorization header.
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

    // owner
    setCollectivePrefix: function() {
      setOwnerPrefix('collective' + '/' + SessionStorageService.getActiveUUID());
    },
    setMyPrefix: function() {
      setOwnerPrefix('my');
    },
    getOwnerPrefix: function() {
      return ownerPrefix;
    },

    // Web storage setters
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
      HttpBasicAuthenticationService.setCredentials(userpass);
    },
    setEncodedCredentialsFromLocalStorage: function() {
      this.setEncodedCredentials(LocalStorageService.getHttpAuthorizationHeader());
    },
    setLatestModified: function(modified, ownerUUID) {
      // Only set if given value is larger than set value
      if (!latestModified[ownerUUID] || latestModified[ownerUUID] < modified){
        latestModified[ownerUUID] = modified;
      }
    },
    setItemsSynchronizing: function(ownerUUID) {
      if (!itemsSynchronize[ownerUUID]) {
        itemsSynchronize[ownerUUID] = {};
      }
      itemsSynchronize[ownerUUID].itemsSynchronizing = true;
    },
    setItemsSynchronized: function(ownerUUID) {
      if (!itemsSynchronize[ownerUUID]) {
        itemsSynchronize[ownerUUID] = {};
      }
      itemsSynchronize[ownerUUID].itemsSynchronizing = false;
      itemsSynchronize[ownerUUID].itemsSynchronized = Date.now();
    },

    // Web storage getters
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
    },
    getLatestModified: function(ownerUUID) {
      return latestModified[ownerUUID];
    },
    isItemsSynchronizing: function(ownerUUID) {
      if (itemsSynchronize[ownerUUID]) {
        return itemsSynchronize[ownerUUID].itemsSynchronizing;
      }
    },
    getItemsSynchronized: function(ownerUUID) {
      return (itemsSynchronize[ownerUUID]) ? itemsSynchronize[ownerUUID].itemsSynchronized : undefined;
    }
  };
}
UserSessionService['$inject'] = ['base64', 'HttpBasicAuthenticationService', 'LocalStorageService', 'SessionStorageService'];
angular.module('em.services').factory('UserSessionService', UserSessionService);
