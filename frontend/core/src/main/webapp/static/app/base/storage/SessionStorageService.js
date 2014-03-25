'use strict';

function SessionStorageService() {
  return {

    // setters
    setActiveUUID: function(uuid) {
      sessionStorage.setItem('activeUUID', uuid);
    },
    setCollectives: function(collectives) {
      sessionStorage.setItem('collectives', JSON.stringify(collectives));
    },
    setEmail: function(email) {
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
      sessionStorage.setItem('userUUID', userUUID);
    },
    setCohort: function(cohort) {
      if (cohort){
        sessionStorage.setItem('cohort', cohort);
      }
    },

    // getters
    getActiveUUID: function() {
      return sessionStorage.getItem('activeUUID');
    },
    getCollectives: function() {
      return JSON.parse(sessionStorage.getItem('collectives'));
    },
    getEmail: function() {
      return sessionStorage.getItem('email');
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
      return sessionStorage.getItem('userUUID');
    },
    getCohort: function() {
      return sessionStorage.getItem('cohort');
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
    }
  };
}

angular.module('em.services').factory('SessionStorageService', SessionStorageService);
