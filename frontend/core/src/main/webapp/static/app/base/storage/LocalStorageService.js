'use strict';

function LocalStorageService() {
  return {

    // setters
    setCollectives: function(collectives) {
      localStorage.setItem('collectives', JSON.stringify(collectives));
    },
    setExpires: function(expires) {
      localStorage.setItem('expires', parseInt(expires));
    },
    setHttpAuthorizationHeader: function(authorizationHeader) {
      localStorage.setItem('authorizationHeader', authorizationHeader);
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

    // getters
    getCollectives: function() {
      if (localStorage.getItem('collectives')) {
        return JSON.parse(localStorage.getItem('collectives'));
      }
    },
    getExpires: function() {
      return localStorage.getItem('expires');
    },
    getHttpAuthorizationHeader: function() {
      return localStorage.getItem('authorizationHeader');
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

    clearUser: function() {
      localStorage.removeItem('collectives');
      localStorage.removeItem('expires');
      localStorage.removeItem('authorizationHeader');
      localStorage.removeItem('replaceable');
      localStorage.removeItem('userType');
      localStorage.removeItem('userUUID');
    }
  };
}

angular.module('em.services').factory('LocalStorageService', LocalStorageService);
