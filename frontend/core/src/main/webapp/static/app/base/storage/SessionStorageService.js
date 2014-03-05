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
    clearUser: function() {
      sessionStorage.removeItem('activeUUID');
      sessionStorage.removeItem('collectives');
      sessionStorage.removeItem('email');
      sessionStorage.removeItem('expires');
      sessionStorage.removeItem('credentials');
      sessionStorage.removeItem('userType');
      sessionStorage.removeItem('userUUID');
    }
  };
}

angular.module('em.services').factory('SessionStorageService', SessionStorageService);
