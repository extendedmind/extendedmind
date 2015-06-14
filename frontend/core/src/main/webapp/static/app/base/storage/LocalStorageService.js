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

 function LocalStorageService() {
  var cachedExpires, cachedUserUUID;
  return {

    // setters
    setBackendDelta: function(delta) {
      if (delta !== undefined) localStorage.setItem('backendDelta', delta);
      else localStorage.removeItem('backendDelta');
    },
    setCollectives: function(collectives) {
      if (collectives !== undefined) localStorage.setItem('collectives', JSON.stringify(collectives));
      else localStorage.removeItem('collectives');
    },
    setSharedLists: function(sharedLists) {
      if (sharedLists !== undefined) localStorage.setItem('sharedLists', JSON.stringify(sharedLists));
      else localStorage.removeItem('sharedLists');
    },
    setEmail: function(email) {
      if (email !== undefined) localStorage.setItem('email', email);
      else localStorage.removeItem('email');
    },
    setExpires: function(expires) {
      if (expires !== undefined){
        localStorage.setItem('expires', expires);
        cachedExpires = expires;
      } else{
        localStorage.removeItem('expires');
        cachedExpires = null;
      }
    },
    setCredentials: function(credentials) {
      if (credentials !== undefined) localStorage.setItem('credentials', credentials);
      else localStorage.removeItem('credentials');
    },
    setReplaceable: function(replaceable) {
      if (replaceable !== undefined) localStorage.setItem('replaceable', replaceable);
      else localStorage.removeItem('replaceable');
    },
    setUserType: function(userType) {
      if (userType !== undefined) localStorage.setItem('userType', userType);
      else localStorage.removeItem('userType');
    },
    setUserUUID: function(uuid) {
      if (uuid !== undefined){
        localStorage.setItem('userUUID', uuid);
        cachedUserUUID = uuid;
      }else{
        localStorage.removeItem('userUUID');
        cachedUserUUID = null;
      }
    },
    setCohort: function(cohort) {
      if (cohort !== undefined) localStorage.setItem('cohort', cohort);
      else localStorage.removeItem('cohort');
    },
    setPreferences: function(preferences) {
      if (preferences) localStorage.setItem('preferences', JSON.stringify(preferences));
      else localStorage.removeItem('preferences');
    },
    setUserModified: function(modified) {
      if (modified) localStorage.setItem('userModified', modified);
      else localStorage.removeItem('userModified');
    },
    setUserCreated: function(created) {
      if (created) localStorage.setItem('userCreated', created);
      else localStorage.removeItem('userCreated');
    },
    setState: function(state) {
      if (state) localStorage.setItem('state', JSON.stringify(state));
      else localStorage.removeItem('state');
    },
    setLatestModified: function(modified, ownerUUID) {
      if (angular.isObject(modified)) {
        localStorage.setItem('modified', JSON.stringify(modified));
      }else if (modified && ownerUUID){
        var latestModified = this.getLatestModified();
        if (latestModified){
          latestModified[ownerUUID] = modified;
        }else{
          latestModified = {};
          latestModified[ownerUUID] = modified;
        }
        localStorage.setItem('modified', JSON.stringify(latestModified));
      }else{
        localStorage.removeItem('modified');
      }
    },
    setItemsSynchronized: function(value, ownerUUID) {
      if (angular.isObject(value)) {
        localStorage.setItem('synced', JSON.stringify(value));
      }else if (value && ownerUUID){
        var synced = this.getItemsSynchronized();
        if (synced){
          synced[ownerUUID] = value;
        }else{
          synced = {};
          synced[ownerUUID] = value;
        }
        localStorage.setItem('synced', JSON.stringify(synced));
      }else{
        localStorage.removeItem('synced');
      }
    },
    setOffline: function(value){
      if (value !== undefined) localStorage.setItem('offline', value);
      else localStorage.removeItem('offline');
    },
    // getters
    getBackendDelta: function() {
      return localStorage.getItem('backendDelta');
    },
    getCollectives: function() {
      if (localStorage.getItem('collectives')) {
        return JSON.parse(localStorage.getItem('collectives'));
      }
    },
    getSharedLists: function() {
      if (localStorage.getItem('sharedLists')) {
        return JSON.parse(localStorage.getItem('sharedLists'));
      }
    },
    getEmail: function() {
      return localStorage.getItem('email');
    },
    getExpires: function() {
      if (cachedExpires === undefined) cachedExpires = localStorage.getItem('expires');
      return cachedExpires;
    },
    getCredentials: function() {
      return localStorage.getItem('credentials');
    },
    getReplaceable: function() {
      return localStorage.getItem('replaceable');
    },
    getUserType: function() {
      return localStorage.getItem('userType');
    },
    getUserUUID: function() {
      if (cachedUserUUID === undefined) cachedUserUUID = localStorage.getItem('userUUID');
      return cachedUserUUID;
    },
    getCohort: function() {
      return localStorage.getItem('cohort');
    },
    getPreferences: function() {
      if (localStorage.getItem('preferences')) {
        return JSON.parse(localStorage.getItem('preferences'));
      }
    },
    getUserModified: function() {
      return localStorage.getItem('userModified');
    },
    getUserCreated: function() {
      return localStorage.getItem('userCreated');
    },
    getState: function() {
      if (localStorage.getItem('state')) {
        return JSON.parse(localStorage.getItem('state'));
      }
    },
    getLatestModified: function(ownerUUID) {
      var latestModifiedString = localStorage.getItem('modified');
      if (latestModifiedString){
        var latestModified = JSON.parse(latestModifiedString);
        if (ownerUUID) return latestModified[ownerUUID];
        else return latestModified;
      }
    },
    getItemsSynchronized: function(ownerUUID) {
      var syncedString = localStorage.getItem('synced');
      if (syncedString){
        var synced = JSON.parse(syncedString);
        if (ownerUUID) return synced[ownerUUID];
        else return synced;
      }
    },
    getOffline: function(){
      var storedOffline = localStorage.getItem('offline');
      if (storedOffline !== null)
        return storedOffline;
    },
    clearUser: function() {
      localStorage.removeItem('backendDelta');
      localStorage.removeItem('collectives');
      localStorage.removeItem('sharedLists');
      localStorage.removeItem('email');
      localStorage.removeItem('expires');
      localStorage.removeItem('credentials');
      localStorage.removeItem('replaceable');
      localStorage.removeItem('userType');
      localStorage.removeItem('userUUID');
      localStorage.removeItem('cohort');
      localStorage.removeItem('preferences');
      localStorage.removeItem('userModified');
      localStorage.removeItem('state');
      localStorage.removeItem('modified');
      localStorage.removeItem('offline');
      localStorage.removeItem('synced');

      // Clear cached values
      cachedExpires = cachedUserUUID = undefined;
    }
  };
}

angular.module('em.base').factory('LocalStorageService', LocalStorageService);
