/*global angular */
'use strict';

angular.module('em.services').factory('userLocalStorage', [
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

angular.module('em.services').factory('userSessionStorage', [
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
