/*global angular */
'use strict';

angular.module('em.services').factory('LocalStorageService', [
  function() {
    return {

      // setters
      setUserUUID: function(uuid) {
        localStorage.setItem('userUUID', uuid);
      },
      setHttpAuthorizationHeader: function(authorizationHeader) {
        localStorage.setItem('authorizationHeader', authorizationHeader);
      },
      setUserType: function(userType) {
        localStorage.setItem('userType', userType);
      },
      setCollectives: function(collectives) {
        localStorage.setItem('collectives', JSON.stringify(collectives));
      },
      setAuthenticated: function(epoch) {
        localStorage.setItem('authenticated', epoch);
      },

      // getters
      getUserUUID: function() {
        return localStorage.getItem('userUUID');
      },
      getHttpAuthorizationHeader: function() {
        return localStorage.getItem('authorizationHeader');
      },
      getUserType: function() {
        return localStorage.getItem('userType');
      },
      getCollectives: function() {
        return JSON.parse(localStorage.getItem('collectives'));
      },
      getAuthenticated: function() {
        return localStorage.getItem('authenticated');
      },

      clearUser: function() {
        localStorage.removeItem('userUUID');
        localStorage.removeItem('authorizationHeader');
        localStorage.removeItem('userType');
        localStorage.removeItem('collectives');
        localStorage.removeItem('authenticated');
      }
    };
  }]);
