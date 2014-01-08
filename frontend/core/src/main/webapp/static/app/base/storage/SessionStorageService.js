/*global angular */
'use strict';

angular.module('em.services').factory('SessionStorageService', [
  function() {
    return {

      // setters
      setUserUUID: function(userUUID) {
        sessionStorage.setItem('userUUID', userUUID);
      },
      setHttpAuthorizationHeader: function(authorizationHeader) {
        sessionStorage.setItem('authorizationHeader', authorizationHeader);
      },
      setUserType: function(userType) {
        sessionStorage.setItem('userType', userType);
      },
      setCollectives: function(collectives) {
        sessionStorage.setItem('collectives', JSON.stringify(collectives));
      },
      setActiveUUID: function(uuid) {
        sessionStorage.setItem('activeUUID', uuid);
      },
      setAuthenticated: function(epoch) {
        sessionStorage.setItem('authenticated', epoch);
      },

      // getters
      getUserUUID: function() {
        return sessionStorage.getItem('userUUID');
      },
      getHttpAuthorizationHeader: function() {
        return sessionStorage.getItem('authorizationHeader');
      },
      getUserType: function() {
        return sessionStorage.getItem('userType');
      },
      getCollectives: function() {
        return JSON.parse(sessionStorage.getItem('collectives'));
      },
      getActiveUUID: function() {
        return sessionStorage.getItem('activeUUID');
      },
      getAuthenticated: function() {
        return sessionStorage.getItem('authenticated');
      },

      clearUser: function() {
        sessionStorage.removeItem('userUUID');
        sessionStorage.removeItem('authorizationHeader');
        sessionStorage.removeItem('userType');
        sessionStorage.removeItem('collectives');
        sessionStorage.removeItem('activeUUID');
        sessionStorage.removeItem('authenticated');
      }
    };
  }]);
