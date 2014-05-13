/* global angular, useOfflineBuffer */
'use strict';

function UISessionService($rootScope, LocalStorageService, SessionStorageService) {

  // Map containing states and datas of features per owner
  var featureMap = {};
  // List containing history of features per owner
  var featureHistory = {};
  var featureChangedCallbacks = [];

  var ownerPrefix = 'my'; // default owner

  return {
    // owner
    getOwnerPrefix: function() {
      return ownerPrefix;
    },
    // Set active UUID and url prefix
    setCollectiveActive: function(uuid) {
      SessionStorageService.setActiveUUID(uuid);
      if (!featureMap[uuid]) featureMap[uuid] = {};
      ownerPrefix = 'collective' + '/' + SessionStorageService.getActiveUUID();
    },
    setMyActive: function() {
      var userUUID = SessionStorageService.getUserUUID();
      if (userUUID){
        SessionStorageService.setActiveUUID(userUUID);
        if (!featureMap[userUUID]) featureMap[userUUID] = {};
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

    // Feature history
    changeFeature: function(newFeature, oldFeature){
      var uuid = this.getActiveUUID();
      featureMap[uuid][newFeature.name] = {
        state: newFeature.state,
        data: newFeature.data
      };
      if (oldFeature){
        featureMap[uuid][oldFeature.name] = {
          state: oldFeature.state,
          data: oldFeature.data
        };
      }
      if (!featureHistory[uuid]) featureHistory[uuid] = [];
      featureHistory[uuid].push(newFeature.name);

      // Fire feature changed callbacks
      for (var i = 0, len = featureChangedCallbacks.length; i < len; i++) {
        featureChangedCallbacks[i].callback(newFeature, oldFeature);
      }
    },
    getPreviousFeatureName: function(){
      var uuid = this.getActiveUUID();
      if (featureHistory[uuid].length > 1){
        return featureHistory[uuid][featureHistory[uuid].length-2];
      }
    },
    getCurrentFeatureName: function(){
      var uuid = this.getActiveUUID();
      if (featureHistory[uuid].length > 1){
        return featureHistory[uuid][featureHistory[uuid].length-1];
      }
    },
    getFeatureState: function(featureName){
      var uuid = this.getActiveUUID();
      if (featureMap[uuid][featureName]){
        return featureMap[uuid][featureName].state;
      }
    },
    getFeatureData: function(featureName){
      var uuid = this.getActiveUUID();
      if (featureMap[uuid][featureName]){
        return featureMap[uuid][featureName].data;
      }
    },
    registerFeatureChangedCallback: function(callback, id) {
      for (var i = 0; i < featureChangedCallbacks.length; i++) {
        if (featureChangedCallbacks[i].id === id) {
          // Already registered, replace callback
          featureChangedCallbacks[i].callback = callback;
          return;
        }
      }
      featureChangedCallbacks.push({
        callback: callback,
        id: id});
    }
  };
}
UISessionService.$inject = ['$rootScope', 'LocalStorageService', 'SessionStorageService'];
angular.module('em.services').factory('UISessionService', UISessionService);
