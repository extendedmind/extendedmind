/* Copyright 2013-2014 Extended Mind Technologies Oy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /* global angular */
 'use strict';

 function UISessionService($q, $rootScope, LocalStorageService, SessionStorageService) {

  // Map containing states and datas of features per owner
  var featureMap = {};
  // List containing history of features per owner
  var featureHistory = {};
  var toasterNotificationMap = {};
  var featureChangedCallbacks = [];

  var ownerPrefix = 'my'; // default owner

  var deferredActions = [];

  function removeDeferredAction(type) {
    var deferredActionIndex = deferredActions.findFirstIndexByKeyValue('type', type);
    if (deferredActionIndex !== undefined) {
      deferredActions.splice(deferredActionIndex, 1);
    }
  }

  return {

    // COMMON

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
      if (userUUID) {
        SessionStorageService.setActiveUUID(userUUID);
        if (!featureMap[userUUID]) featureMap[userUUID] = {};
        ownerPrefix = 'my';
      } else {
        // User's UUID not known
        $rootScope.$emit('emException', {type: 'session', description: 'user UUID not available'});
      }
    },
    getActiveUUID: function() {
      if (!SessionStorageService.getActiveUUID()) {
        if (LocalStorageService.getUserUUID()) {
          SessionStorageService.setActiveUUID(LocalStorageService.getUserUUID());
        } else {
          // There is no way to get the active UUID
          $rootScope.$emit('emException', {type: 'session', description: 'active UUID not available'});
        }
      }
      return SessionStorageService.getActiveUUID();
    },

    // FEATURES

    changeFeature: function(name, data, state) {
      var uuid = this.getActiveUUID();
      if (!featureMap[uuid][name]) {
        featureMap[uuid][name] = {
          data: data,
          state: state
        };
      } else {
        featureMap[uuid][name].data = data;
        // Don't overwrite existing data with undefined
        if (state) {
          featureMap[uuid][name].state = state;
        }
      }
      if (!featureHistory[uuid]) featureHistory[uuid] = [];
      featureHistory[uuid].push(name);

      // Fire feature changed callbacks
      for (var i = 0, len = featureChangedCallbacks.length; i < len; i++) {
        featureChangedCallbacks[i].callback(name, data, state);
      }
    },
    getPreviousFeatureName: function() {
      var uuid = this.getActiveUUID();
      if (featureHistory[uuid] && featureHistory[uuid].length > 1) {
        return featureHistory[uuid][featureHistory[uuid].length-2];
      }
    },
    getCurrentFeatureName: function() {
      var uuid = this.getActiveUUID();
      if (featureHistory[uuid] && featureHistory[uuid].length > 0) {
        return featureHistory[uuid][featureHistory[uuid].length-1];
      }
    },
    setCurrentFeatureState: function(state) {
      var uuid = this.getActiveUUID();
      if (featureHistory[uuid] && featureHistory[uuid].length > 0) {
        featureMap[uuid][featureHistory[uuid][featureHistory[uuid].length-1]].state = state;
      }
    },
    getFeatureState: function(featureName) {
      var uuid = this.getActiveUUID();
      if (featureHistory[uuid] && featureMap[uuid][featureName]) {
        return featureMap[uuid][featureName].state;
      }
    },
    getFeatureData: function(featureName) {
      var uuid = this.getActiveUUID();
      if (featureHistory[uuid] && featureMap[uuid][featureName]) {
        return featureMap[uuid][featureName].data;
      }
    },


    // UI STATE

    setUIStateParameter: function(key, value) {
      var state = this.getUIState();
      if (!state) state = {};
      state[key] = value;
      SessionStorageService.setState(state);
      if (LocalStorageService.getReplaceable() !== null) {
        LocalStorageService.setState(state);
      }
    },
    getUIState: function() {
      var state = SessionStorageService.getState();
      if (!state) {
        state = LocalStorageService.getState();
        if (state) {
          SessionStorageService.setState(state);
        }
      }
      return state;
    },

    // TOASTER

    setToasterNotification: function(notificationLocation) {
      var notification = {
        location: notificationLocation,
        displayed: false
      };
      var uuid = this.getActiveUUID();
      if (!toasterNotificationMap[uuid]) toasterNotificationMap[uuid] = [];
      toasterNotificationMap[uuid].push(notification);
    },
    getToasterNotification: function() {
      var uuid = this.getActiveUUID();
      if (toasterNotificationMap[uuid] && toasterNotificationMap[uuid].length > 0) {
        var lastNotification = toasterNotificationMap[uuid][toasterNotificationMap[uuid].length - 1];
        if (!lastNotification.displayed) {
          return lastNotification;
        }
      }
    },

    // PROMISES

    deferAction: function(type, deferred){
      var deferredAction = deferred;
      if (!deferredAction) {
        deferredAction = $q.defer();
      }

      deferredActions.push({
        type: type,
        deferred: deferredAction,
      });

      return deferredAction.promise.then(function(resolved) {
        removeDeferredAction(type);
        return resolved;
      }, function(rejected) {
        removeDeferredAction(type);
        return rejected;
      });
    },
    getDeferredAction: function(type) {
      var deferredActionIndex = deferredActions.findFirstIndexByKeyValue('type', type);
      if (deferredActionIndex !== undefined) {
        return deferredActions[deferredActionIndex].deferred;
      }
    },
    resolveDeferredActions: function(type, parameter) {
      var deferredAction = deferredActions.findFirstObjectByKeyValue('type', type);
      if (deferredAction) deferredAction.deferred.resolve(parameter);
    },

    // CALLBACK REGISTRATION

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
    },

    // CLEANUP

    reset: function() {
      featureMap = {};
      featureHistory = {};
      toasterNotificationMap = {};
      featureChangedCallbacks = [];
      ownerPrefix = 'my';
    }
  };
}
UISessionService['$inject'] = ['$q', '$rootScope', 'LocalStorageService', 'SessionStorageService'];
angular.module('em.base').factory('UISessionService', UISessionService);
