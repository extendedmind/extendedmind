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

 /* global angular */
 'use strict';

 function UserSessionService(base64, LocalStorageService, SessionStorageService, enableOffline, UUIDService) {
  var swapTokenBufferTime = 10*60*1000; // 10 minutes in milliseconds
  // When offline isn't enabled, use transient value for latest modified
  var latestModified = {};
  var itemsSynchronized = {};
  var itemsSynchronizeAttempted = {};
  var persistentStorageEnabled = enableOffline;
  var offlineEnabledBypass = false;
  var notifyOwnerCallbacks = {};
  var persistentDataLoaded = false;

  // Sync session storage with local storage.
  function syncWebStorages() {
    // Fake user
    if (UUIDService.isFakeUUID(LocalStorageService.getUserUUID()) && !SessionStorageService.getUserUUID()){
      setUserSessionStorageData();
    // Synced user
    } else if (LocalStorageService.getExpires() &&
               SessionStorageService.getExpires() !== LocalStorageService.getExpires()) {
      setUserSessionStorageData();
    }
  }

  function setUserSessionStorageData() {
    SessionStorageService.setBackendDelta(LocalStorageService.getBackendDelta());
    SessionStorageService.setCollectives(LocalStorageService.getCollectives());
    SessionStorageService.setEmail(LocalStorageService.getEmail());
    SessionStorageService.setExpires(LocalStorageService.getExpires());
    SessionStorageService.setCredentials(LocalStorageService.getCredentials());
    SessionStorageService.setUserType(LocalStorageService.getUserType());
    SessionStorageService.setUserUUID(LocalStorageService.getUserUUID());
    SessionStorageService.setCohort(LocalStorageService.getCohort());
    SessionStorageService.setPreferences(LocalStorageService.getPreferences());
    SessionStorageService.setUserModified(LocalStorageService.getUserModified());
    SessionStorageService.setState(LocalStorageService.getState());
    SessionStorageService.setLatestModified(LocalStorageService.getLatestModified());
    SessionStorageService.setItemsSynchronized(LocalStorageService.getItemsSynchronized());
    SessionStorageService.setOffline(LocalStorageService.getOffline());
  }

  function encodeUsernamePassword(username, password) {
    return base64.encode(username + ':' + password);
  }

  function setEmail(email) {
    if (email) {
      SessionStorageService.setEmail(email);
      if (persistentStorageEnabled || LocalStorageService.getReplaceable() !== null) {
        LocalStorageService.setEmail(email);
      }
    }
  }

  function migrateTransportPreferences(transportPreferences) {
    if (transportPreferences) {
      var preferences = {};
      if (transportPreferences.onboarded){
        if (transportPreferences.onboarded.startsWith('{')) {
          // new format
          preferences.onboarded = JSON.parse(transportPreferences.onboarded);
        }else{
          // old format
          preferences.onboarded = transportPreferences.onboarded;
        }
      }
      if (transportPreferences.ui) {
        preferences.ui = JSON.parse(transportPreferences.ui);
      }
      return preferences;
    } else {
      return {};
    }
  }

  function executeNotifyOwnerCallbacks(userUUID, collectives) {
    for (var id in notifyOwnerCallbacks) {
      notifyOwnerCallbacks[id](userUUID);
      if (collectives){
        for (var uuid in collectives){
          notifyOwnerCallbacks[id](uuid, true);
        }
      }
    }
  }

  return {
    enableOffline: function() {
      persistentStorageEnabled = true;
      offlineEnabledBypass = true;
      // when bypassing store the value to stores
      LocalStorageService.setOffline(true);
      SessionStorageService.setOffline(true);
    },
    isAuthenticated: function() {
      return SessionStorageService.getExpires() || LocalStorageService.getExpires();
    },
    isAuthenticateValid: function() {
      var authenticateCurrentReferenceTime, authenticateValidTime;

      authenticateValidTime = parseInt(SessionStorageService.getExpires() ||
                                       LocalStorageService.getExpires());
      authenticateCurrentReferenceTime = Date.now() + swapTokenBufferTime;

      if (authenticateValidTime && (authenticateValidTime > authenticateCurrentReferenceTime)) {
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
    isPersistentStorageEnabled: function() {
      syncWebStorages();
      var storedOffline = SessionStorageService.getOffline();
      if (storedOffline !== undefined){
        persistentStorageEnabled = storedOffline;
      }
      return persistentStorageEnabled;
    },
    clearUser: function() {
      persistentStorageEnabled = enableOffline;
      SessionStorageService.clearUser();
      LocalStorageService.clearUser();
      latestModified = {};
      itemsSynchronized = {};
      itemsSynchronizeAttempted = {};
      persistentDataLoaded = false;
      persistentStorageEnabled = enableOffline;
      offlineEnabledBypass = false;
    },

    // Web storage setters
    setAuthenticateInformation: function(authenticateResponse, email) {
      var backendDelta = Date.now() - authenticateResponse.authenticated;
      var credentials = encodeUsernamePassword('token', authenticateResponse.token);
      var preferences = migrateTransportPreferences(authenticateResponse.preferences);

      SessionStorageService.setBackendDelta(backendDelta);
      SessionStorageService.setCollectives(authenticateResponse.collectives);
      SessionStorageService.setExpires(authenticateResponse.expires + backendDelta);
      SessionStorageService.setCredentials(credentials);
      SessionStorageService.setUserType(authenticateResponse.userType);
      SessionStorageService.setUserUUID(authenticateResponse.userUUID);
      SessionStorageService.setCohort(authenticateResponse.cohort);
      SessionStorageService.setPreferences(preferences);
      SessionStorageService.setUserModified(authenticateResponse.modified);

      if (authenticateResponse.replaceable) {
        LocalStorageService.setBackendDelta(backendDelta);
        LocalStorageService.setExpires(authenticateResponse.expires + backendDelta);
        LocalStorageService.setCollectives(authenticateResponse.collectives);
        LocalStorageService.setCredentials(credentials);
        LocalStorageService.setReplaceable(authenticateResponse.replaceable + backendDelta);
        LocalStorageService.setUserType(authenticateResponse.userType);
        LocalStorageService.setUserUUID(authenticateResponse.userUUID);
        LocalStorageService.setCohort(authenticateResponse.cohort);
        LocalStorageService.setPreferences(preferences);
        LocalStorageService.setUserModified(authenticateResponse.modified);
      }
      if (email) {
        setEmail(email);
      }

      // Notify owner UUID's
      executeNotifyOwnerCallbacks(authenticateResponse.userUUID, authenticateResponse.collectives);
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
    setFeaturePreferences: function(feature, value) {
      // Feature preferences are in the "onboarded" field which is an object
      // of the following format:
      // {
      //   FEATURE_NAME: FEATURE_VALUE,
      //   ...
      // }
      // FEATURE_NAME is defined in the MainController feature map, i.e. "user", "focus", "inbox", "tasks"...
      // FEATURE_VALUE: is one of four values:
      //    1. Integer: 0 means that the feature has been disabled missing value defaults to this,
      //                values N > 0, mean that the onboarding in currently in progress at phase N.
      //    2. String: this defines that the entire feature is fully onboarded
      //       at the given timestamp, version, platform (and device id) delimited with ':'.
      //    3. Object: contains onboarding inforamation about a subsections within the feature, e.g. for
      //       "tasks" feature, when the user has not yet visited the section, it could be:
      //         {
      //           tasks: {
      //              all: 1
      //           }
      //         };
      //       (where implicitly also contexts and context subsections have the value 0).
      //    4. Array containing onboarding status objects, one per platform. For example:
      //          [{'ios-cordova': FEATURE_VALUE}, {'osx-nwjs': FEATURE_VALUE}]
      //       This is reserved for future use.
      //
      //    Missing value for a feature to integer 0: feature is disabled
      var preferences = this.getPreferences() || {};
      if (!preferences.onboarded) preferences.onboarded = {};
      if (value !== undefined){
        preferences.onboarded[feature] = value;
      }else if (preferences.onboarded[feature] !== undefined) {
        delete preferences.onboarded[feature];
      }
      this.setPreferences(preferences);
    },
    setPreferences: function(preferences) {
      SessionStorageService.setPreferences(preferences);
      if (this.isPersistentStorageEnabled() || LocalStorageService.getReplaceable() !== null) {
        LocalStorageService.setPreferences(preferences);
      }
    },
    setTransportPreferences: function(transportPreferences) {
      this.setPreferences(migrateTransportPreferences(transportPreferences));
    },
    setLatestModified: function(modified, ownerUUID) {
      // Only set if given value is larger than set value
      var currentLatestModified = this.getLatestModified(ownerUUID);
      if (!currentLatestModified || (modified && currentLatestModified < modified)) {
        if (this.isPersistentStorageEnabled()){
          SessionStorageService.setLatestModified(modified, ownerUUID);
          LocalStorageService.setLatestModified(modified, ownerUUID);
        }else{
          latestModified[ownerUUID] = modified;
        }
      }
    },
    setUserModified: function(modified) {
      SessionStorageService.setUserModified(modified);
      if (this.isPersistentStorageEnabled() || LocalStorageService.getReplaceable() !== null) {
        LocalStorageService.setUserModified(modified);
      }
    },
    setItemsSynchronized: function(timestamp, ownerUUID) {
      if (this.isPersistentStorageEnabled()){
        SessionStorageService.setItemsSynchronized(timestamp, ownerUUID);
        LocalStorageService.setItemsSynchronized(timestamp, ownerUUID);
      }else{
        itemsSynchronized[ownerUUID] = timestamp;
      }
    },
    setItemsSynchronizeAttempted: function(timestamp, ownerUUID) {
      itemsSynchronizeAttempted[ownerUUID] = timestamp;
    },
    createFakeUserUUID: function(){
      var fakeUserUUID = UUIDService.generateFakeUUID();
      SessionStorageService.setUserUUID(fakeUserUUID);
      if (this.isPersistentStorageEnabled()){
        LocalStorageService.setUserUUID(fakeUserUUID);
      }
      executeNotifyOwnerCallbacks(fakeUserUUID);
      return fakeUserUUID;
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
    getBackendDelta: function(){
      syncWebStorages();
      var storedDelta = SessionStorageService.getBackendDelta();
      return storedDelta ? parseInt(storedDelta) : undefined;
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
      if (this.isPersistentStorageEnabled()){
        var currentLatestModified = SessionStorageService.getLatestModified(ownerUUID);
        if (!isNaN(currentLatestModified)) return parseInt(currentLatestModified);
        else return currentLatestModified;
      }else{
        return latestModified[ownerUUID];
      }
    },
    getItemsSynchronized: function(ownerUUID) {
      if (this.isPersistentStorageEnabled()){
        var currentItemsSynchronized = SessionStorageService.getItemsSynchronized(ownerUUID);
        if (!isNaN(currentItemsSynchronized)) return parseInt(currentItemsSynchronized);
        else return currentItemsSynchronized;
      }else{
        return itemsSynchronized[ownerUUID];
      }
    },
    getItemsSynchronizeAttempted: function(ownerUUID) {
      return itemsSynchronizeAttempted[ownerUUID];
    },
    isItemsSynchronized: function(ownerUUID) {
      return this.getItemsSynchronized(ownerUUID) !== undefined;
    },
    setPersistentDataLoaded: function(value) {
      persistentDataLoaded = value;
    },
    isPersistentDataLoaded: function() {
      return persistentDataLoaded;
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
      if (transportPreferences.onboarded) {
        transportPreferences.onboarded = JSON.stringify(preferences.onboarded);
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
    getFeaturePreferences: function(feature) {
      syncWebStorages();
      var preferences = SessionStorageService.getPreferences();
      if (preferences && preferences.onboarded) {
        return preferences.onboarded[feature];
      }
    },
    getRememberByDefault: function() {
      return this.isPersistentStorageEnabled();
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
    },
    isFakeUser: function() {
      return UUIDService.isFakeUUID(this.getUserUUID());
    },
    notifyOwnerUUIDChange: function(oldUUID, newUUID){
      if (this.isPersistentStorageEnabled()){
        var currentItemsSynchronized = SessionStorageService.getItemsSynchronized();
        if (currentItemsSynchronized && currentItemsSynchronized[oldUUID]){
          currentItemsSynchronized[newUUID] = currentItemsSynchronized[oldUUID];
          delete currentItemsSynchronized[oldUUID];
          SessionStorageService.setItemsSynchronized(currentItemsSynchronized);
          LocalStorageService.setItemsSynchronized(currentItemsSynchronized);
        }
        var currentLatestModified = SessionStorageService.getLatestModified();
        if (currentLatestModified && currentLatestModified[oldUUID]){
          currentLatestModified[newUUID] = currentLatestModified[oldUUID];
          delete currentLatestModified[oldUUID];
          SessionStorageService.setLatestModified(currentLatestModified);
          LocalStorageService.setLatestModified(currentLatestModified);
        }
      }else{
        if (itemsSynchronized[oldUUID]){
          itemsSynchronized[newUUID] = itemsSynchronized[oldUUID];
          delete itemsSynchronized[oldUUID];
        }
        if (latestModified[oldUUID]){
          latestModified[newUUID] = latestModified[oldUUID];
          delete latestModified[oldUUID];
        }
      }
    },
    registerNofifyOwnerCallback: function(callback, id){
      notifyOwnerCallbacks[id] = callback;

      // In case the registration comes after UserSessionService has received owners,
      // notify caller immediately
      var userUUID = this.getUserUUID();
      if (userUUID){
        callback(userUUID);
      }
      var collectives = this.getCollectives();
      if (collectives){
        for (var uuid in collectives){
          callback(uuid, true);
        }
      }
    },
    // NOTE: Here for easier testing!
    executeNotifyOwnerCallbacks: function(userUUID, collectives){
      executeNotifyOwnerCallbacks(userUUID, collectives);
    }
  };
}
UserSessionService['$inject'] = ['base64', 'LocalStorageService', 'SessionStorageService', 'enableOffline',
'UUIDService'];
angular.module('em.base').factory('UserSessionService', UserSessionService);
