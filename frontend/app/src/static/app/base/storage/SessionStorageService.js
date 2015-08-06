/* Copyright 2013-2015 Extended Mind Technologies Oy
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
  var cachedSharedLists;
  var cachedOffline;
  var cachedExpires;

  function setAccessInformation(name, value, cachedValue){
    if (value){
      // To get two-way binding to work with cache, we want to replace the content
      // of cachedValue with the new one
      if (cachedValue){
        // delete every old key, then add every key
        for (var oldUuid in cachedValue){
          if (cachedValue.hasOwnProperty(oldUuid)){
            delete cachedValue[oldUuid];
          }
        }
        for (var newUuid in value){
          if (value.hasOwnProperty(newUuid)){
            cachedValue[newUuid] = value[newUuid];
          }
        }
      }else{
        cachedValue = value;
      }
      sessionStorage.setItem(name, JSON.stringify(value));
    }else{
      cachedValue = value;
      sessionStorage.removeItem(name);
    }
  }

  return {

    // setters
    setBackendDelta: function(delta) {
      cachedBackendDelta = delta;
      if (delta !== undefined) sessionStorage.setItem('backendDelta', delta);
      else sessionStorage.removeItem('backendDelta');
    },
    setActiveUUID: function(uuid) {
      cachedActiveUUID = uuid;
      if (uuid !== undefined) sessionStorage.setItem('activeUUID', uuid);
      else sessionStorage.removeItem('activeUUID');
    },
    setCollectives: function(collectives) {
      setAccessInformation('collectives', collectives, cachedCollectives);
    },
    setSharedLists: function(sharedLists) {
      setAccessInformation('sharedLists', sharedLists, cachedSharedLists);
    },
    setEmail: function(email) {
      cachedEmail = email;
      if (email !== undefined) sessionStorage.setItem('email', email);
      else sessionStorage.removeItem('email');
    },
    setExpires: function(expires) {
      if (expires !== undefined){
        sessionStorage.setItem('expires', expires);
        cachedExpires = expires;
      } else{
        sessionStorage.removeItem('expires');
        cachedExpires = null;
      }
    },
    setCredentials: function(credentials) {
      if (credentials !== undefined) sessionStorage.setItem('credentials', credentials);
      else sessionStorage.removeItem('credentials');
    },
    setUserType: function(userType) {
      if (userType !== undefined) sessionStorage.setItem('userType', userType);
      else sessionStorage.removeItem('userType');
    },
    setUserUUID: function(userUUID) {
      cachedUserUUID = userUUID;
      if (userUUID !== undefined) sessionStorage.setItem('userUUID', userUUID);
      else sessionStorage.removeItem('userUUID');
    },
    setCohort: function(cohort) {
      if (cohort !== undefined) sessionStorage.setItem('cohort', cohort);
      else sessionStorage.removeItem('cohort');
    },
    setPreferences: function(preferences) {
      cachedPreferences = preferences;
      if (preferences) sessionStorage.setItem('preferences', JSON.stringify(preferences));
      else sessionStorage.removeItem('preferences');
    },
    setUserModified: function(modified) {
      if (modified) sessionStorage.setItem('userModified', modified);
      else sessionStorage.removeItem('userModified');
    },
    setUserCreated: function(created) {
      if (created) sessionStorage.setItem('userCreated', created);
      else sessionStorage.removeItem('userCreated');
    },
    setEmailVerified: function(emailVerified) {
      if (emailVerified) sessionStorage.setItem('emailVerified', emailVerified);
      else sessionStorage.removeItem('emailVerified');
    },
    setState: function(state) {
      if (state) sessionStorage.setItem('state', JSON.stringify(state));
      else sessionStorage.removeItem('state');
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
      }else{
        sessionStorage.removeItem('modified');
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
      }else{
        sessionStorage.removeItem('synced');
      }
    },
    setOffline: function(value){
      cachedOffline = value;
      if (value !== undefined) sessionStorage.setItem('offline', cachedOffline);
      else sessionStorage.removeItem('offline');
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
    getSharedLists: function() {
      if (!cachedSharedLists){
        var sharedLists = sessionStorage.getItem('sharedLists');
        if (sharedLists){
          cachedSharedLists = JSON.parse(sharedLists);
        }else{
          // We need to have at least some array pointer to get two-way binding to work:
          // shared lists are needed before authentication!
          cachedSharedLists = {};
        }
      }
      return cachedSharedLists;
    },
    getEmail: function() {
      if (!cachedEmail) cachedEmail = sessionStorage.getItem('email');
      return cachedEmail;
    },
    getExpires: function() {
      if (cachedExpires === undefined) cachedExpires = sessionStorage.getItem('expires');
      return cachedExpires;
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
    getUserCreated: function() {
      return sessionStorage.getItem('userCreated');
    },
    getEmailVerified: function() {
      return sessionStorage.getItem('emailVerified');
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
        var storedOffline = sessionStorage.getItem('offline');
        if (storedOffline !== null) cachedOffline = storedOffline;
      }
      return cachedOffline;
    },
    clearUser: function() {
      sessionStorage.removeItem('backendDelta');
      sessionStorage.removeItem('activeUUID');
      sessionStorage.removeItem('collectives');
      sessionStorage.removeItem('sharedLists');
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
      sessionStorage.removeItem('userCreated');
      sessionStorage.removeItem('emailVerified');

      cachedBackendDelta = cachedActiveUUID = cachedUserUUID = cachedEmail = cachedSharedLists =
      cachedPreferences = cachedCollectives = cachedOffline = cachedExpires = undefined;
    }
  };
}

angular.module('em.base').factory('SessionStorageService', SessionStorageService);
