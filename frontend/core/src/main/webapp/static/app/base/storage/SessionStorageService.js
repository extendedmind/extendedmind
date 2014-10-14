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
  var cachedActiveUUID;
  var cachedUserUUID;
  var cachedEmail;
  return {

    // setters
    setActiveUUID: function(uuid) {
      cachedActiveUUID = uuid;
      sessionStorage.setItem('activeUUID', uuid);
    },
    setCollectives: function(collectives) {
      if (collectives) sessionStorage.setItem('collectives', JSON.stringify(collectives));
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
      if (preferences) {
        sessionStorage.setItem('preferences', JSON.stringify(preferences));
      }
    },
    setState: function(state) {
      if (state) {
        sessionStorage.setItem('state', JSON.stringify(state));
      }
    },

    // getters
    getActiveUUID: function() {
      if (!cachedActiveUUID) cachedActiveUUID = sessionStorage.getItem('activeUUID');
      return cachedActiveUUID;
    },
    getCollectives: function() {
      var collectives = sessionStorage.getItem('collectives');
      if (collectives) JSON.parse(collectives);
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
      if (sessionStorage.getItem('preferences')) {
        return JSON.parse(sessionStorage.getItem('preferences'));
      }
    },
    getState: function() {
      if (sessionStorage.getItem('state')) {
        return JSON.parse(sessionStorage.getItem('state'));
      }
    },
    clearUser: function() {
      sessionStorage.removeItem('activeUUID');
      sessionStorage.removeItem('collectives');
      sessionStorage.removeItem('email');
      sessionStorage.removeItem('expires');
      sessionStorage.removeItem('credentials');
      sessionStorage.removeItem('userType');
      sessionStorage.removeItem('userUUID');
      sessionStorage.removeItem('cohort');
      sessionStorage.removeItem('preferences');
      sessionStorage.removeItem('state');
    }
  };
}

angular.module('em.base').factory('SessionStorageService', SessionStorageService);
