/* global angular, useOfflineBuffer */
'use strict';

function UserSessionService(base64, LocalStorageService, SessionStorageService) {
  var swapTokenBufferTime = 10*60*1000; // 10 minutes in milliseconds
  var latestModified = {};
  var itemsSynchronize = {};
  var offlineBufferEnabled = (typeof useOfflineBuffer !== 'undefined') ? useOfflineBuffer: false;

  // Sync session storage with local storage.
  function syncWebStorages() {
    if (LocalStorageService.getExpires() && SessionStorageService.getExpires() !== LocalStorageService.getExpires()) {
      setUserSessionStorageData();
    }
  }

  function setUserSessionStorageData() {
    SessionStorageService.setCollectives(LocalStorageService.getCollectives());
    SessionStorageService.setEmail(LocalStorageService.getEmail());
    SessionStorageService.setExpires(LocalStorageService.getExpires());
    SessionStorageService.setCredentials(LocalStorageService.getCredentials());
    SessionStorageService.setUserType(LocalStorageService.getUserType());
    SessionStorageService.setUserUUID(LocalStorageService.getUserUUID());
    SessionStorageService.setCohort(LocalStorageService.getCohort());
    SessionStorageService.setPreferences(LocalStorageService.getPreferences());
  }

  function encodeUsernamePassword(username, password) {
    return base64.encode(username + ':' + password);
  }

  function setEmail(email) {
    SessionStorageService.setEmail(email);
    if (offlineBufferEnabled || LocalStorageService.getReplaceable() !== null) {
      LocalStorageService.setEmail(email);
    }
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

    // Web storage setters
    setAuthenticateInformation: function(authenticateResponse, email) {
      var authExpiresDelta = Date.now() - authenticateResponse.authenticated;
      var credentials = encodeUsernamePassword('token', authenticateResponse.token);

      SessionStorageService.setCollectives(authenticateResponse.collectives);
      SessionStorageService.setExpires(authenticateResponse.expires + authExpiresDelta);
      SessionStorageService.setCredentials(credentials);
      SessionStorageService.setUserType(authenticateResponse.userType);
      SessionStorageService.setUserUUID(authenticateResponse.userUUID);
      SessionStorageService.setCohort(authenticateResponse.cohort);
      SessionStorageService.setPreferences(authenticateResponse.preferences);

      if (authenticateResponse.replaceable) {
        LocalStorageService.setExpires(authenticateResponse.expires + authExpiresDelta);
        LocalStorageService.setCollectives(authenticateResponse.collectives);
        LocalStorageService.setCredentials(credentials);
        LocalStorageService.setReplaceable(authenticateResponse.replaceable + authExpiresDelta);
        LocalStorageService.setUserType(authenticateResponse.userType);
        LocalStorageService.setUserUUID(authenticateResponse.userUUID);
        LocalStorageService.setCohort(authenticateResponse.cohort);
        LocalStorageService.setPreferences(authenticateResponse.preferences);
      }
      if (email) {
        setEmail(email);
      }
      return credentials;
    },
    setEmail: function(email) {
      setEmail(email);
    },
    setPreferences: function(name, value) {
      var preferences = this.getPreferences() || {};
      if (!preferences.name) {
        preferences[name] = value;
      }
      SessionStorageService.setPreferences(preferences);
      if (offlineBufferEnabled || LocalStorageService.getReplaceable() !== null) {
        LocalStorageService.setPreferences(preferences);
      }
    },
    setLatestModified: function(modified, ownerUUID) {
      // Only set if given value is larger than set value
      if (!latestModified[ownerUUID] || (modified && latestModified[ownerUUID] < modified)){
        latestModified[ownerUUID] = modified;
      }
    },
    setItemsSynchronized: function(ownerUUID) {
      if (!itemsSynchronize[ownerUUID]) {
        itemsSynchronize[ownerUUID] = {};
      }
      itemsSynchronize[ownerUUID].itemsSynchronized = Date.now();
    },

    // Web storage getters
    getCollectives: function() {
      syncWebStorages();
      return SessionStorageService.getCollectives();
    },
    getCredentials: function() {
      syncWebStorages();
      return SessionStorageService.getCredentials();
    },
    getEmail: function() {
      // Sync only email in Web Storages.
      if (LocalStorageService.getEmail()) {
        SessionStorageService.setEmail(LocalStorageService.getEmail());
      }
      return SessionStorageService.getEmail();
    },
    getUserUUID: function() {
      syncWebStorages();
      return SessionStorageService.getUserUUID();
    },
    getCohort: function() {
      syncWebStorages();
      return SessionStorageService.getCohort();
    },
    getLatestModified: function(ownerUUID) {
      return latestModified[ownerUUID];
    },
    getItemsSynchronized: function(ownerUUID) {
      return (itemsSynchronize[ownerUUID]) ? itemsSynchronize[ownerUUID].itemsSynchronized : undefined;
    },
    getPreferences: function() {
      syncWebStorages();
      return SessionStorageService.getPreferences();
    },
    getRememberByDefault: function() {
      return offlineBufferEnabled;
    },
    getUser: function() {
      syncWebStorages();
      if (SessionStorageService.getUserUUID()){
        var user = {
          uuid: SessionStorageService.getUserUUID(),
          type: parseInt(SessionStorageService.getUserType())
        };
        if (SessionStorageService.getCohort()){
          user.cohort = parseInt(SessionStorageService.getCohort());
        }
        return user;
      }
    },
    getUserType: function() {
      return parseInt(SessionStorageService.getUserType());
    }
  };
}
UserSessionService.$inject = ['base64', 'LocalStorageService', 'SessionStorageService'];
angular.module('em.services').factory('UserSessionService', UserSessionService);
