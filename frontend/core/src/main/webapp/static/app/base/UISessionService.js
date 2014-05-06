/* global angular, useOfflineBuffer */
'use strict';

function UISessionService($rootScope, LocalStorageService, SessionStorageService) {

  // Map containing states and datas of features
  var featureMap = {};
  // List containing history of features
  var featureHistory = {};

  var ownerPrefix = 'my'; // default owner

  return {

    // owner
    getOwnerPrefix: function() {
      return ownerPrefix;
    },
    // Set active UUID and url prefix
    setCollectiveActive: function(uuid) {
      SessionStorageService.setActiveUUID(uuid);
      ownerPrefix = 'collective' + '/' + SessionStorageService.getActiveUUID();
    },
    setMyActive: function() {
      if (SessionStorageService.getUserUUID()){
        SessionStorageService.setActiveUUID(SessionStorageService.getUserUUID());
        ownerPrefix = 'my';
      }else{
        // User's UUID not known
        $rootScope.$emit('emException', {type: 'session', description: 'user UUID not available'});
      }
    },
    getActiveUUID: function() {
      if (!SessionStorageService.getActiveUUID()) {
        if (LocalStorageService.getUserUUID()){
          SessionStorageService.setActiveUUID(LocalStorageService.getUserUUID())
        }else{
          // There is no way to get the active UUID
          $rootScope.$emit('emException', {type: 'session', description: 'active UUID not available'});
        }
      }
      return SessionStorageService.getActiveUUID();
    },
  };
}
UISessionService.$inject = ['$rootScope', 'LocalStorageService', 'SessionStorageService'];
angular.module('em.services').factory('UISessionService', UISessionService);
