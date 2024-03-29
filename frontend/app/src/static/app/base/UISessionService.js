/* Copyright 2013-2017 Extended Mind Technologies Oy
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

 /* global angular, device */
 'use strict';

 function UISessionService($q, $rootScope, $timeout, LocalStorageService, SessionStorageService,
                           packaging, version) {

  // Map containing states and datas of features per owner
  var featureMap = {};
  // List containing history of features per owner
  var featureHistory = {};
  var featureChangedCallbacks = [];

  var notificationMap = {};
  var delayedNotificationMap = {};
  var notificationsActiveCallbacks = [];

  var ownerPrefix = 'my'; // default owner

  var deferredActions = [];
  var allowedActions = {};
  var transientUIState;

  function removeDeferredAction(type) {
    var deferredActionIndex = deferredActions.findFirstIndexByKeyValue('type', type);
    if (deferredActionIndex !== undefined) {
      deferredActions.splice(deferredActionIndex, 1);
    }
  }

  /*
  * Run active notifications callbacks.
  *
  * Execute only override callback if it exists.
  */
  function executeNotificationsActiveCallbacks(notifications) {
    if (notificationsActiveCallbacks) {

      var overrideCallback = notificationsActiveCallbacks.findFirstObjectByKeyValue('type', 'override');
      if (overrideCallback) {
        overrideCallback.callback(notifications);
        return;
      }

      for (var i = 0, len = notificationsActiveCallbacks.length; i < len; i++) {
        notificationsActiveCallbacks[i].callback(notifications);
      }
    }
  }

  function removeReverseNotification(notification, notifications) {
    var reverseIndex;

    // Find index of a reversible item in notifications array.
    for (var i = 0, len = notifications.length; i < len; i++) {
      if (notifications[i].type === notification.reverseType &&
          notifications[i].item === notification.item)
      {
        // Found a reverse of the notification in the notifications array
        reverseIndex = i;
        break;
      }
    }

    if (reverseIndex !== undefined) notifications.splice(reverseIndex, 1);
  }

  /*
  * Store delayed notifications.
  *
  * Ideally user after delayed notifications are activated.
  */
  function moveDelayedNotificationsToNotificationMap(delayedNotifications, uuid) {
    if (!notificationMap[uuid]) notificationMap[uuid] = [];
    for (var i = 0, len = delayedNotifications.length; i < len; i++) {
      notificationMap[uuid].push(delayedNotifications[i]);
    }
    delayedNotifications.length = 0;
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
        $rootScope.$emit('emException', {type: 'session', value: 'user UUID not available'});
      }
    },
    getActiveUUID: function() {
      if (!SessionStorageService.getActiveUUID()) {
        if (LocalStorageService.getUserUUID()) {
          SessionStorageService.setActiveUUID(LocalStorageService.getUserUUID());
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

    // TRANSIENT UI STATE

    setTransientUIState: function(value){
      transientUIState = value;
    },
    getTransientUIState: function(value){
      return transientUIState;
    },

    // NOTIFICATION

    registerNotificationsActiveCallback: function(type, callback) {
      var callbackIndex = notificationsActiveCallbacks.findFirstIndexByKeyValue('type', type);
      if (callbackIndex === undefined) {
        notificationsActiveCallbacks.push({
          type: type,
          callback: callback
        });
        // Execute on register in case there are already notifications pushed before toaster is registered
        executeNotificationsActiveCallbacks(notificationMap[null]);
      }
    },
    unregisterNotificationsActiveCallback: function(type) {
      var callbackIndex = notificationsActiveCallbacks.findFirstIndexByKeyValue('type', type);
      if (callbackIndex !== undefined) notificationsActiveCallbacks.splice(callbackIndex, 1);
    },
    pushNotification: function(notification) {
      var uuid = this.getActiveUUID();
      if (!notificationMap[uuid]) notificationMap[uuid] = [];

      // If notification has reverseType, delete existing item notification where type equals reverseType
      // NOTE: Should delayedNotificationMap[uuid] be traversed as well?
      if (notification.reverseType) removeReverseNotification(notification, notificationMap[uuid]);
      notificationMap[uuid].push(notification);
      executeNotificationsActiveCallbacks([notification]);
    },
    pushDelayedNotification: function(notification) {
      var uuid = this.getActiveUUID();
      if (!delayedNotificationMap[uuid]) delayedNotificationMap[uuid] = [];

      // If notification has reverseType, delete existing item notification where type equals reverseType
      // NOTE: Should notificationMap[uuid] be traversed as well?
      if (notification.reverseType) removeReverseNotification(notification, delayedNotificationMap[uuid]);

      delayedNotificationMap[uuid].push(notification);
    },
    activateDelayedNotifications: function() {
      var uuid = this.getActiveUUID();
      if (delayedNotificationMap && delayedNotificationMap[uuid] && delayedNotificationMap[uuid].length) {
        var notifications = delayedNotificationMap[uuid].clone();
        executeNotificationsActiveCallbacks(notifications);
        moveDelayedNotificationsToNotificationMap(delayedNotificationMap[uuid], uuid);
      }
    },

    // DEFERRED

    deferAction: function(type, failsafeDeferTime){
      var deferredAction = $q.defer();

      deferredActions.push({
        type: type,
        deferred: deferredAction
      });

      if (failsafeDeferTime) {  // Make sure promise gets resolved eventually.
        $timeout(function() {
          if (deferredAction) deferredAction.resolve();
        }, failsafeDeferTime);
      }

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

    // ALLOWED ACTIONS

    allow: function(type, duration, ids){
      allowedActions[type] = {ids: ids};
      $timeout(function(){
        allowedActions[type] = undefined;
      },duration);
    },
    isAllowed: function(type, id) {
      if (allowedActions[type] &&  (id === undefined || allowedActions[type].ids === undefined)){
        // Allow based on type alone
        return true;
      }else if (allowedActions[type]){
        // Both ids and id is given, check to see if value is in ids
        if (angular.isArray(allowedActions[type].ids)){
          return allowedActions[type].ids.indexOf(id) !== -1;
        }else{
          return allowedActions[type].ids === id;
        }
      }
      return false;
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

    // DEVICE VALUES

    getDeviceId: function(){
      if (typeof device !== 'undefined') {
        if (packaging === 'ios-cordova' && device.model) {
          // From http://plugins.cordova.io/#/package/org.apache.cordova.device about device.uuid
          //
          // The uuid on iOS is not unique to a device, but varies for each application,
          // for each installation.
          // It changes if you delete and re-install the app, and possibly also when you upgrade iOS,
          // or even upgrade the app per version (apparent in iOS 5.1). The uuid is not a reliable value.
          return device.model;
        }
        else if (device.uuid) {
          return device.uuid;
        }
      }
    },

    getOnboardedValue: function(){
      var onboardedString = Date.now() + ':' + version + ':' + packaging;
      var deviceId = this.getDeviceId();
      if (deviceId){
        onboardedString += ':' + deviceId;
      }
      return onboardedString;
    },

    // CLEANUP

    reset: function() {
      featureMap = {};
      featureHistory = {};
      notificationMap = {};
      delayedNotificationMap = {};
      deferredActions = [];
      ownerPrefix = 'my';
      allowedActions = {};
      transientUIState = undefined;
    },
    notifyOwnerUUIDChange: function(oldUUID, newUUID){
      if (featureMap[oldUUID]){
        featureMap[newUUID] = featureMap[oldUUID];
        delete featureMap[oldUUID];
        if (this.getActiveUUID() === oldUUID){
          SessionStorageService.setActiveUUID(newUUID);
        }
      }
      if (featureHistory[oldUUID]){
        featureHistory[newUUID] = featureHistory[oldUUID];
        delete featureHistory[oldUUID];
      }
    }
  };
}
UISessionService['$inject'] = ['$q', '$rootScope', '$timeout', 'LocalStorageService',
'SessionStorageService', 'packaging', 'version'];
angular.module('em.base').factory('UISessionService', UISessionService);
