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
    setExpires: function(expires) {
      sessionStorage.setItem('expires', expires);
    },
    setHttpAuthorizationHeader: function(authorizationHeader) {
      sessionStorage.setItem('authorizationHeader', authorizationHeader);
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
    getExpires: function() {
      return sessionStorage.getItem('expires');
    },
    getHttpAuthorizationHeader: function() {
      return sessionStorage.getItem('authorizationHeader');
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
      sessionStorage.removeItem('expires');
      sessionStorage.removeItem('authorizationHeader');
      sessionStorage.removeItem('userType');
      sessionStorage.removeItem('userUUID');
    }
  };
}

angular.module('em.services').factory('SessionStorageService', SessionStorageService);
