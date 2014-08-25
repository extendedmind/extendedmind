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
  return {

    // setters
    setCollectives: function(collectives) {
      localStorage.setItem('collectives', JSON.stringify(collectives));
    },
    setEmail: function(email) {
      localStorage.setItem('email', email);
    },
    setExpires: function(expires) {
      localStorage.setItem('expires', parseInt(expires));
    },
    setCredentials: function(credentials) {
      localStorage.setItem('credentials', credentials);
    },
    setReplaceable: function(replaceable) {
      localStorage.setItem('replaceable', replaceable);
    },
    setUserType: function(userType) {
      localStorage.setItem('userType', userType);
    },
    setUserUUID: function(uuid) {
      localStorage.setItem('userUUID', uuid);
    },
    setCohort: function(cohort) {
      if (cohort) {
        localStorage.setItem('cohort', cohort);
      }
    },
    setPreferences: function(preferences) {
      if (preferences) {
        localStorage.setItem('preferences', JSON.stringify(preferences));
      }
    },
    setState: function(state) {
      if (state) {
        localStorage.setItem('state', JSON.stringify(state));
      }
    },

    // getters
    getCollectives: function() {
      if (localStorage.getItem('collectives')) {
        return JSON.parse(localStorage.getItem('collectives'));
      }
    },
    getEmail: function() {
      return localStorage.getItem('email');
    },
    getExpires: function() {
      return localStorage.getItem('expires');
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
      return localStorage.getItem('userUUID');
    },
    getCohort: function() {
      return localStorage.getItem('cohort');
    },
    getPreferences: function() {
      if (localStorage.getItem('preferences')) {
        return JSON.parse(localStorage.getItem('preferences'));
      }
    },
    getState: function() {
      if (localStorage.getItem('state')) {
        return JSON.parse(localStorage.getItem('state'));
      }
    },

    clearUser: function() {
      localStorage.removeItem('collectives');
      localStorage.removeItem('email');
      localStorage.removeItem('expires');
      localStorage.removeItem('credentials');
      localStorage.removeItem('replaceable');
      localStorage.removeItem('userType');
      localStorage.removeItem('userUUID');
      localStorage.removeItem('cohort');
      localStorage.removeItem('preferences');
      localStorage.removeItem('state');

      // Also clear offline queue
      if (localStorage.getItem('primaryRequest')) {
        localStorage.removeItem('primaryRequest');
      }
      if (localStorage.getItem('secondaryRequest')) {
        localStorage.removeItem('secondaryRequest');
      }
      if (localStorage.getItem('requestQueue')) {
        localStorage.removeItem('requestQueue');
      }
    }
  };
}

angular.module('em.base').factory('LocalStorageService', LocalStorageService);
