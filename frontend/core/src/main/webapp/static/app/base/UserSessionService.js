/* global angular, useOfflineBuffer */
'use strict';

function UserSessionService(base64, LocalStorageService, SessionStorageService) {
  var swapTokenBufferTime = 10*60*1000; // 10 minutes in milliseconds
  var latestModified = {};
  var itemsSynchronize = {};
  var ownerPrefix = 'my'; // default owner
  var offlineBufferEnabled = (typeof useOfflineBuffer !== 'undefined') ? useOfflineBuffer: false;

  function setOwnerPrefix(owner) {
    ownerPrefix = owner;
  }

  // Sync session storage with local storage.
  function syncWebStorages() {
    if (LocalStorageService.getExpires() && SessionStorageService.getExpires() !== LocalStorageService.getExpires()) {
      setUserSessionStorageData();
    }
  }
  
  function setUserSessionStorageData() {
    SessionStorageService.setActiveUUID(LocalStorageService.getUserUUID());
    SessionStorageService.setCollectives(LocalStorageService.getCollectives());
    SessionStorageService.setExpires(LocalStorageService.getExpires());
    SessionStorageService.setCredentials(LocalStorageService.getCredentials());
    SessionStorageService.setUserType(LocalStorageService.getUserType());
    SessionStorageService.setUserUUID(LocalStorageService.getUserUUID());
  }

  function encodeUsernamePassword(username, password) {
    return base64.encode(username + ':' + password);
  }

  return {
    isAuthenticated: function() {
      return SessionStorageService.getExpires() || LocalStorageService.getExpires();
    },
    isAuthenticateValid: function() {
      var authenticateCurrentReferenceTime, authenticateValidTime;

      authenticateValidTime = SessionStorageService.getExpires() || LocalStorageService.getExpires();
      authenticateCurrentReferenceTime = Date.now() + swapTokenBufferTime;

      if (authenticateValidTime > authenticateCurrentReferenceTime) {
        return true;
      }
    },
    isAuthenticateReplaceable: function() {
      var authenticateCurrentReferenceTime, authenticateValidTime;

      if (LocalStorageService.getReplaceable()) {
        authenticateValidTime = LocalStorageService.getReplaceable();
        authenticateCurrentReferenceTime = Date.now() + swapTokenBufferTime;
        if (authenticateValidTime > authenticateCurrentReferenceTime) {
          return true;
        }
      }
    },
    isOfflineEnabled: function() {
      return offlineBufferEnabled;
    },
    clearUser: function() {
      SessionStorageService.clearUser();
      LocalStorageService.clearUser();
      latestModified = {};
      itemsSynchronize = {};
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
    setAuthenticateInformation: function(authenticateResponse, email) {
      var authExpiresDelta = Date.now() - authenticateResponse.authenticated;
      var credentials = encodeUsernamePassword('token', authenticateResponse.token);

      SessionStorageService.setActiveUUID(authenticateResponse.userUUID);
      SessionStorageService.setCollectives(authenticateResponse.collectives);
      SessionStorageService.setExpires(authenticateResponse.expires - authExpiresDelta);
      SessionStorageService.setCredentials(credentials);
      SessionStorageService.setUserType(authenticateResponse.userType);
      SessionStorageService.setUserUUID(authenticateResponse.userUUID);

      if (authenticateResponse.replaceable) {
        LocalStorageService.setExpires(authenticateResponse.expires - authExpiresDelta);
        LocalStorageService.setCollectives(authenticateResponse.collectives);
        LocalStorageService.setCredentials(credentials);
        LocalStorageService.setReplaceable(authenticateResponse.replaceable - authExpiresDelta);
        LocalStorageService.setUserType(authenticateResponse.userType);
        LocalStorageService.setUserUUID(authenticateResponse.userUUID);
      }
      if (email) {
        this.setEmail(email);
      }
      return credentials;
    },
    setActiveUUID: function(uuid) {
      SessionStorageService.setActiveUUID(uuid);
    },
    setEmail: function(email) {
      SessionStorageService.setEmail(email);
      if (this.getRememberByDefault()) {
        LocalStorageService.setEmail(email);
      }
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
      syncWebStorages();
      return SessionStorageService.getActiveUUID();
    },
    getCollectives: function() {
      syncWebStorages();
      return SessionStorageService.getCollectives();
    },
    getCredentials: function() {
      syncWebStorages();
      return SessionStorageService.getCredentials();
    },
    getUserUUID: function() {
      syncWebStorages();
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
    },
    getRememberByDefault: function() {
      return offlineBufferEnabled;
    }
  };
}
UserSessionService.$inject = ['base64', 'LocalStorageService', 'SessionStorageService'];
angular.module('em.services').factory('UserSessionService', UserSessionService);
