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
 'use strict';

 function SessionStorageService() {
  var cachedBackendDelta;
  var cachedActiveUUID;
  var cachedUserUUID;
  var cachedEmail;
  var cachedPreferences;
  var cachedCollectives;
  var cachedOffline;
  return {

    // setters
    setBackendDelta: function(delta) {
      cachedBackendDelta = delta;
      sessionStorage.setItem('backendDelta', delta);
    },
    setActiveUUID: function(uuid) {
      cachedActiveUUID = uuid;
      sessionStorage.setItem('activeUUID', uuid);
    },
    setCollectives: function(collectives) {
      if (collectives){
        // To get two-way binding to work with cached collectives, we want to replace the content
        // of cachedCollectives with the new one
        if (cachedCollectives){
          // delete every old key, then add every key
          for (var oldUuid in cachedCollectives){
            if (cachedCollectives.hasOwnProperty(oldUuid)){
              delete cachedCollectives[oldUuid];
            }
          }
          for (var newUuid in collectives){
            if (collectives.hasOwnProperty(newUuid)){
              cachedCollectives[newUuid] = collectives[newUuid];
            }
          }
        }else{
          cachedCollectives = collectives;
        }
        sessionStorage.setItem('collectives', JSON.stringify(collectives));
      }else{
        cachedCollectives = collectives;
      }
    },
    setEmail: function(email) {
      cachedEmail = email;
      sessionStorage.setItem('email', email);
    },
    setExpires: function(expires) {
      sessionStorage.setItem('expires', expires);
    },
    setCredentials: function(credentials) {
      sessionStorage.setItem('credentials', credentials);
    },
    setUserType: function(userType) {
      sessionStorage.setItem('userType', userType);
    },
    setUserUUID: function(userUUID) {
      cachedUserUUID = userUUID;
      sessionStorage.setItem('userUUID', userUUID);
    },
    setCohort: function(cohort) {
      if (cohort) {
        sessionStorage.setItem('cohort', cohort);
      }
    },
    setPreferences: function(preferences) {
      cachedPreferences = preferences;
      if (preferences) {
        sessionStorage.setItem('preferences', JSON.stringify(preferences));
      }
    },
    setUserModified: function(modified) {
      if (modified) {
        sessionStorage.setItem('userModified', modified);
      }
    },
    setState: function(state) {
      if (state) {
        sessionStorage.setItem('state', JSON.stringify(state));
      }
    },
    setLatestModified: function(modified, ownerUUID) {
      if (angular.isObject(modified)) {
        sessionStorage.setItem('modified', JSON.stringify(modified));
      }else if (ownerUUID && modified){
        var latestModified = this.getLatestModified();
        if (latestModified){
          latestModified[ownerUUID] = modified;
        }else{
          latestModified = {};
          latestModified[ownerUUID] = modified;
        }
        sessionStorage.setItem('modified', JSON.stringify(latestModified));
      }
    },
    setItemsSynchronized: function(value, ownerUUID) {
      if (angular.isObject(value)) {
        sessionStorage.setItem('synced', JSON.stringify(value));
      }else if (ownerUUID && value){
        var synced = this.getItemsSynchronized();
        if (synced){
          synced[ownerUUID] = value;
        }else{
          synced = {};
          synced[ownerUUID] = value;
        }
        sessionStorage.setItem('synced', JSON.stringify(synced));
      }
    },
    setOffline: function(value){
      if (value !== undefined){
        cachedOffline = value;
        sessionStorage.setItem('offline', cachedOffline);
      }
    },
    // getters
    getBackendDelta: function() {
      if (!cachedBackendDelta) cachedBackendDelta = sessionStorage.getItem('backendDelta');
      return cachedBackendDelta;
    },
    getActiveUUID: function() {
      if (!cachedActiveUUID) cachedActiveUUID = sessionStorage.getItem('activeUUID');
      return cachedActiveUUID;
    },
    getCollectives: function() {
      if (!cachedCollectives){
        var collectives = sessionStorage.getItem('collectives');
        if (collectives){
          cachedCollectives = JSON.parse(collectives);
        }else{
          // We need to have at least some array pointer to get two-way binding to work:
          // collectives are needed before authentication!
          cachedCollectives = {};
        }
      }
      return cachedCollectives;
    },
    getEmail: function() {
      if (!cachedEmail) cachedEmail = sessionStorage.getItem('email');
      return cachedEmail;
    },
    getExpires: function() {
      return sessionStorage.getItem('expires');
    },
    getCredentials: function() {
      return sessionStorage.getItem('credentials');
    },
    getUserType: function() {
      return sessionStorage.getItem('userType');
    },
    getUserUUID: function() {
      if (!cachedUserUUID) cachedUserUUID = sessionStorage.getItem('userUUID');
      return cachedUserUUID;
    },
    getCohort: function() {
      return sessionStorage.getItem('cohort');
    },
    getPreferences: function() {
      if (!cachedPreferences){
        var preferences = sessionStorage.getItem('preferences');
        if (preferences){
          cachedPreferences = JSON.parse(preferences);
        }
      }
      return cachedPreferences;
    },
    getUserModified: function() {
      return sessionStorage.getItem('userModified');
    },
    getState: function() {
      var state = sessionStorage.getItem('state');
      if (state) return JSON.parse(state);
    },
    getLatestModified: function(ownerUUID) {
      var latestModifiedString = sessionStorage.getItem('modified');
      if (latestModifiedString){
        var latestModified = JSON.parse(latestModifiedString);
        if (ownerUUID) return latestModified[ownerUUID];
        else return latestModified;
      }
    },
    getItemsSynchronized: function(ownerUUID) {
      var syncedString = sessionStorage.getItem('synced');
      if (syncedString){
        var synced = JSON.parse(syncedString);
        if (ownerUUID) return synced[ownerUUID];
        else return synced;
      }
    },
    getOffline: function(){
      if (cachedOffline === undefined){
        var storedOffline = localStorage.getItem('offline');
        if (storedOffline !== null) cachedOffline = storedOffline;
      }
      return cachedOffline;
    },
    clearUser: function() {
      sessionStorage.removeItem('backendDelta');
      sessionStorage.removeItem('activeUUID');
      sessionStorage.removeItem('collectives');
      sessionStorage.removeItem('email');
      sessionStorage.removeItem('expires');
      sessionStorage.removeItem('credentials');
      sessionStorage.removeItem('userType');
      sessionStorage.removeItem('userUUID');
      sessionStorage.removeItem('cohort');
      sessionStorage.removeItem('preferences');
      sessionStorage.removeItem('userModified');
      sessionStorage.removeItem('state');
      sessionStorage.removeItem('modified');
      sessionStorage.removeItem('offline');
      sessionStorage.removeItem('synced');

      cachedBackendDelta = cachedActiveUUID = cachedUserUUID = cachedEmail =
      cachedPreferences = cachedCollectives = cachedOffline = undefined;
    }
  };
}

angular.module('em.base').factory('SessionStorageService', SessionStorageService);
