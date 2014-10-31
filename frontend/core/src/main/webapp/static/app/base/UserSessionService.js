/* Copyright 2013-2014 Extended Mind Technologies Oy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /* global angular, useOfflineBuffer */
 'use strict';

 function UserSessionService(base64, LocalStorageService, SessionStorageService) {
  var swapTokenBufferTime = 10*60*1000; // 10 minutes in milliseconds
  var latestModified = {};
  var itemsSynchronized = {};
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
    SessionStorageService.setUserModified(LocalStorageService.getUserModified());
  }

  function encodeUsernamePassword(username, password) {
    return base64.encode(username + ':' + password);
  }

  function setEmail(email) {
    if (email) {
      SessionStorageService.setEmail(email);
      if (offlineBufferEnabled || LocalStorageService.getReplaceable() !== null) {
        LocalStorageService.setEmail(email);
      }
    }
  }

  function migrateTransportPreferences(transportPreferences) {
    if (transportPreferences) {
      var preferences = {
        onboarded: transportPreferences.onboarded
      };
      if (transportPreferences.ui) {
        preferences.ui = JSON.parse(transportPreferences.ui);
      }
      return preferences;
    } else {
      return {};
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
      itemsSynchronized = {};
    },

    // Web storage setters
    setAuthenticateInformation: function(authenticateResponse, email) {
      var authExpiresDelta = Date.now() - authenticateResponse.authenticated;
      var credentials = encodeUsernamePassword('token', authenticateResponse.token);
      var preferences = migrateTransportPreferences(authenticateResponse.preferences);

      SessionStorageService.setCollectives(authenticateResponse.collectives);
      SessionStorageService.setExpires(authenticateResponse.expires + authExpiresDelta);
      SessionStorageService.setCredentials(credentials);
      SessionStorageService.setUserType(authenticateResponse.userType);
      SessionStorageService.setUserUUID(authenticateResponse.userUUID);
      SessionStorageService.setCohort(authenticateResponse.cohort);
      SessionStorageService.setPreferences(preferences);
      SessionStorageService.setUserModified(authenticateResponse.modified);

      if (authenticateResponse.replaceable) {
        LocalStorageService.setExpires(authenticateResponse.expires + authExpiresDelta);
        LocalStorageService.setCollectives(authenticateResponse.collectives);
        LocalStorageService.setCredentials(credentials);
        LocalStorageService.setReplaceable(authenticateResponse.replaceable + authExpiresDelta);
        LocalStorageService.setUserType(authenticateResponse.userType);
        LocalStorageService.setUserUUID(authenticateResponse.userUUID);
        LocalStorageService.setCohort(authenticateResponse.cohort);
        LocalStorageService.setPreferences(preferences);
        LocalStorageService.setUserModified(authenticateResponse.modified);
      }
      if (email) {
        setEmail(email);
      }
      return credentials;
    },
    setEmail: function(email) {
      setEmail(email);
    },
    setPreference: function(name, value) {
      var preferences = this.getPreferences() || {};
      if (value !== undefined) {
        preferences[name] = value;
      } else if (preferences[name] !== undefined) {
        delete preferences[name];
      }
      this.setPreferences(preferences);
    },
    setUIPreference: function(name, value) {
      var preferences = this.getPreferences() || {};
      if (!preferences.ui) preferences.ui = {};

      if (value !== undefined){
        preferences.ui[name] = value;
      }else if (preferences.ui[name] !== undefined) {
        delete preferences.ui[name];
      }
      this.setPreferences(preferences);
    },
    setPreferences: function(preferences) {
      SessionStorageService.setPreferences(preferences);
      if (offlineBufferEnabled || LocalStorageService.getReplaceable() !== null) {
        LocalStorageService.setPreferences(preferences);
      }
    },
    setTransportPreferences: function(transportPreferences) {
      this.setPreferences(migrateTransportPreferences(transportPreferences));
    },
    setLatestModified: function(modified, ownerUUID) {
      // Only set if given value is larger than set value
      if (!latestModified[ownerUUID] || (modified && latestModified[ownerUUID] < modified)) {
        latestModified[ownerUUID] = modified;
      }
    },
    setUserModified: function(modified) {
      SessionStorageService.setUserModified(modified);
      if (offlineBufferEnabled || LocalStorageService.getReplaceable() !== null) {
        LocalStorageService.setUserModified(modified);
      }
    },
    setItemsSynchronized: function(timestamp, ownerUUID) {
      itemsSynchronized[ownerUUID] = timestamp;
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
      return itemsSynchronized[ownerUUID];
    },
    isItemsSynchronized: function(ownerUUID) {
      return itemsSynchronized[ownerUUID] !== undefined;
    },
    getTransportPreferences: function() {
      syncWebStorages();
      var preferences = SessionStorageService.getPreferences();

      var transportPreferences = {};
      for (var property in preferences){
        if (preferences.hasOwnProperty(property)){
          transportPreferences[property] = preferences[property];
        }
      }
      if (transportPreferences.ui) {
        transportPreferences.ui = JSON.stringify(preferences.ui);
      }
      return transportPreferences;
    },
    getPreferences: function() {
      syncWebStorages();
      return SessionStorageService.getPreferences();
    },
    getUIPreference: function(key) {
      syncWebStorages();
      var preferences = SessionStorageService.getPreferences();
      if (preferences && preferences.ui) {
        return preferences.ui[key];
      }
    },
    getRememberByDefault: function() {
      return offlineBufferEnabled;
    },
    getUser: function() {
      syncWebStorages();
      if (SessionStorageService.getUserUUID()) {
        var user = {
          uuid: SessionStorageService.getUserUUID(),
          type: parseInt(SessionStorageService.getUserType()),
          modified: SessionStorageService.getUserModified()
        };
        if (SessionStorageService.getCohort()) {
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
UserSessionService['$inject'] = ['base64', 'LocalStorageService', 'SessionStorageService'];
angular.module('em.base').factory('UserSessionService', UserSessionService);
