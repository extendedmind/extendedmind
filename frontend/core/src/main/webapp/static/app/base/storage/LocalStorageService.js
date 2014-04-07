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
      if (cohort){
        localStorage.setItem('cohort', cohort);
      }
    },
    setPreferences: function(preferences) {
      if (preferences) {
        localStorage.setItem('preferences', JSON.stringify(preferences));
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
    }
  };
}

angular.module('em.services').factory('LocalStorageService', LocalStorageService);
