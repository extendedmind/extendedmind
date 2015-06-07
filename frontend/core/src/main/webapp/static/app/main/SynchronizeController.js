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

 'use strict';

// Controller for synchronizing
function SynchronizeController($q, $rootScope, $scope, $timeout,
                        BackendClientService, SynchronizeService,
                        UISessionService, UserSessionService, packaging) {

  var synchronizeTimer;
  var synchronizeDelay = 12 * 1000;
  var itemsSynchronizedThreshold = 10 * 1000; // 10 seconds in milliseconds
  var itemsSynchronizeCounter = 0; // count the number of syncs in this session
  var userSyncCounterTreshold = 5; // sync user every fifth sync
  var userSyncTimeTreshold = 60000; // sync user if there has been a minute of non-syncing

  // For iOS, javascript execution is paused anyway when app enters the background, so there is no need to
  // start/cancel polling
  function activateCallback(){
    if (packaging !== 'ios-cordova'){
      synchronizeAndSynchronizeDelayed();
    }
  }
  function deactivateCallback(){
    if (packaging !== 'ios-cordova'){
      cancelSynchronizeDelayed();
    }
  }
  $scope.registerActivateDeactivateCallbacks(activateCallback, deactivateCallback, 'SynchronizeController');

  function synchronizeAndSynchronizeDelayed() {
    synchronize();
    synchronizeDelayed();
  }
  function cancelSynchronizeDelayed() {
    $timeout.cancel(synchronizeTimer);
  }

  // https://developer.mozilla.org/en/docs/Web/API/window.setInterval
  function synchronizeDelayed() {
    synchronizeTimer = $timeout(function() {
      synchronize();
      synchronizeDelayed();
    }, synchronizeDelay);
  }

  function itemsSynchronizedCallback(ownerUUID){
    var timestamp = Date.now();
    UserSessionService.setItemsSynchronized(timestamp, ownerUUID);
    $rootScope.synced = timestamp;
    $rootScope.syncState = 'ready';
    itemsSynchronizeCounter++;
    if ($rootScope.signUpInProgress) $rootScope.signUpInProgress = false;
  }
  SynchronizeService.registerItemsSynchronizedCallback(itemsSynchronizedCallback);

  function updateItemsSyncronizeAttempted(ownerUUID){
    var timestamp = Date.now();
    UserSessionService.setItemsSynchronizeAttempted(timestamp, ownerUUID);
    $rootScope.syncAttempted = timestamp;
  }

  function getLastItemsSynchronized(itemsSynchronized){
    // evaluates to NaN, when synced is undefined which it is on first sync or fake user:
    return Date.now() - itemsSynchronized;
  }


  function synchronize() {
    var ownerUUID = UISessionService.getActiveUUID();
    if (ownerUUID){
      // User is present, register activity and set when user was last synchronized
      $scope.registerActivity();
      $rootScope.synced = UserSessionService.getItemsSynchronized(ownerUUID);
      // evaluates to NaN, when synced is undefined which it is on first sync or fake user:
      var sinceLastItemsSynchronized = getLastItemsSynchronized($rootScope.synced);
      synchronizeItems(ownerUUID, sinceLastItemsSynchronized).then(function(status){
        if (status && status !== 'fakeUser'){
          doSynchronizeOwner(ownerUUID, sinceLastItemsSynchronized);
          if (status === 'firstSync'){
            // On first sync, most stale other owner syncing must be started manually, because it is done
            // with online methods, not using the queue
            synchronizeMostStaleOtherOwner();
          }
        }
      });
    }
  }

  // Synchronize items for given owner if interval reached.

  function synchronizeItems(ownerUUID, sinceLastItemsSynchronized, skipDeleted, forceSyncParams) {
    function isItemSynchronizeValid(sinceLastItemsSynchronized){
      if (isNaN(sinceLastItemsSynchronized)) return true;
      else if (sinceLastItemsSynchronized > itemsSynchronizedThreshold) return true;

      // Also sync if data has not yet been read to memory
      if (!UserSessionService.isPersistentDataLoaded()) return true;
    }

    return $q(function(resolve, reject) {
      if (forceSyncParams || isItemSynchronizeValid(sinceLastItemsSynchronized)) {
        $scope.$evalAsync(function() {
          if (!$rootScope.synced){
            // This is the first load for the user
            $rootScope.syncState = 'active';
          }else{
            $rootScope.syncState = 'modified';
          }
        });
        SynchronizeService.synchronize(ownerUUID, forceSyncParams).then(function(status) {
          if (status === 'firstSync'){
            // Also immediately after first sync add completed and archived to the mix
            $rootScope.syncState = 'completedAndArchived';
            SynchronizeService.addCompletedAndArchived(ownerUUID).then(function(){
              if (!skipDeleted){
                $rootScope.syncState = 'deleted';
                // Also after this, get deleted items as well
                SynchronizeService.addDeleted(ownerUUID).then(function(){
                  updateItemsSyncronizeAttempted(ownerUUID);
                  resolve(status);
                }, function(error){
                  $rootScope.syncState = 'error';
                  reject(error);
                });
              }else{
                updateItemsSyncronizeAttempted(ownerUUID);
                resolve(status);
              }
            }, function(error){
              $rootScope.syncState = 'error';
              reject(error);
            });
          } else if (status === 'delta') {
            updateItemsSyncronizeAttempted(ownerUUID);
            resolve(status);
          } else if (status === 'fakeUser') {
            $rootScope.syncState = 'local';
            resolve(status);
          }
        }, function(error){
          $rootScope.syncState = 'error';
          reject(error);
        });
      }else{
        resolve();
      }
      executeSynchronizeCallbacks();
    });
  }

  function doSynchronizeOwner(ownerUUID, sinceLastItemsSynchronized) {
    // If there has been a long enough time from last sync, update account preferences as well
    var activeUUID = UISessionService.getActiveUUID();
    if (activeUUID === ownerUUID){
      if (itemsSynchronizeCounter === 0 ||
          itemsSynchronizeCounter%userSyncCounterTreshold === 0 ||
          sinceLastItemsSynchronized > userSyncTimeTreshold){
        SynchronizeService.synchronizeUser();
      }
    }
  }

  $scope.showLoadingAnimation = function(){
    return $rootScope.syncState === 'active' && !$rootScope.signUpInProgress;
  };

  // Execute synchronize immediately when queue is empty to be fully synced right after data has been
  // modified without having to wait for next tick.
  function queueEmptiedCallback() {
    // Only execute sync if the previous sync is ready or error happened the previous time
    if ($rootScope.syncState === 'ready' || $rootScope.syncState === 'error'){
      var activeUUID = UISessionService.getActiveUUID();
      return SynchronizeService.synchronize(activeUUID, {emptied: true}).then(function() {
        updateItemsSyncronizeAttempted(activeUUID);
      }, function(){
        $rootScope.syncState = 'error';
        $q.reject();
      });
    }else{
      // Else immediately return
      var deferred = $q.defer();
      deferred.resolve();
      return deferred.promise;
    }
  }
  BackendClientService.registerQueueEmptiedCallback(queueEmptiedCallback);

  // Execute synchronize on conflict to get conflicted content and then try to empty the queue again
  function conflictCallback(conflictedRequest) {
    var ownerUUID = conflictedRequest && conflictedRequest.params && conflictedRequest.params.owner ?
                    conflictedRequest.params.owner : UISessionService.getActiveUUID();
    return SynchronizeService.synchronize(ownerUUID).then(function() {
      updateItemsSyncronizeAttempted(ownerUUID);
    }, function(){
      $rootScope.syncState = 'error';
      $q.reject();
    });
  }
  BackendClientService.registerConflictCallback(conflictCallback);

  // Executes after secondary when there is nothing in the queue
  function afterSecondaryWithEmptyQueueCallback(previousSecondary) {
    var previousParams = previousSecondary.params;
    return synchronizeMostStaleOtherOwner(previousParams);
  }
  BackendClientService.registerAfterSecondaryWithEmptyQueueCallback(afterSecondaryWithEmptyQueueCallback);

  function getOtherOwnerUUIDs(sharedLists, adoptedLists){
    var otherOwnerUUIDs;
    if (sharedLists){
      for (var sharedListOwnerUUID in sharedLists) {
        if (sharedLists.hasOwnProperty(sharedListOwnerUUID)){
          if (!otherOwnerUUIDs) otherOwnerUUIDs = [];
          otherOwnerUUIDs.push(sharedListOwnerUUID);
        }
      }
    }
    if (adoptedLists){
      for (var adoptedListOwnerUUID in adoptedLists) {
        if (adoptedLists.hasOwnProperty(adoptedListOwnerUUID)){
          if (!otherOwnerUUIDs) otherOwnerUUIDs = [];
          otherOwnerUUIDs.push(adoptedListOwnerUUID);
        }
      }
    }
    return otherOwnerUUIDs;
  }

  // Synchronizes the other owner that has not been synced for the longest period
  function synchronizeMostStaleOtherOwner(previousParams){
    var otherOwnerUUIDs = getOtherOwnerUUIDs(UserSessionService.getSharedLists(),
                                             UserSessionService.getUIPreference('adoptedLists'));
    return $q(function(resolve, reject) {
      if (otherOwnerUUIDs){
        var biggestSince;
        var mostStaleOwnerUUID;
        for (var i=0; i<otherOwnerUUIDs.length; i++) {
          var sinceLastItemsSynchronized =
            getLastItemsSynchronized(UserSessionService.getItemsSynchronized(otherOwnerUUIDs[i]));
          if (!sinceLastItemsSynchronized || !biggestSince || biggestSince < sinceLastItemsSynchronized){
            mostStaleOwnerUUID = otherOwnerUUIDs[i];
            if (sinceLastItemsSynchronized) biggestSince = sinceLastItemsSynchronized;
            else biggestSince = 100000;
          }
        }
        if (mostStaleOwnerUUID){
          var forceSyncParams;
          if (previousParams && (previousParams.emptied || (previousParams.shared &&
              previousParams.shared.indexOf(mostStaleOwnerUUID) === -1))){
            if (!previousParams.shared) forceSyncParams = {shared: []};
            else forceSyncParams = {shared: previousParams.shared};
            forceSyncParams.shared.push(mostStaleOwnerUUID);
          }
          synchronizeItems(mostStaleOwnerUUID, biggestSince, true, forceSyncParams).then(function(success){
            resolve(success);
          }, function(error){
            reject(error);
          });
        }else{
          resolve();
        }
      }else{
        resolve();
      }
    });
  }

  // CLEANUP

  $scope.$on('$destroy', function() {
    // http://www.bennadel.com/blog/2548-Don-t-Forget-To-Cancel-timeout-Timers-In-Your-destroy-Events-In-AngularJS.htm
    $timeout.cancel(synchronizeTimer);
    $scope.unregisterActivateDeactivateCallbacks('SynchronizeController');
  });

  // CALLBACKS

  var synchronizeCallbacks = {};  // map of synchronize callbacks

  // Synchronize
  $scope.registerSynchronizeCallback = function(callback, id) {
    synchronizeCallbacks[id] = callback;
  };
  $scope.unregisterSynchronizeCallback = function(id) {
    if (synchronizeCallbacks[id]) delete synchronizeCallbacks[id];
  };
  function executeSynchronizeCallbacks() {
    for (var id in synchronizeCallbacks)
      synchronizeCallbacks[id]();
  }

  // Start synchronize interval or just start synchronize interval.
  synchronizeAndSynchronizeDelayed();
}

SynchronizeController['$inject'] = ['$q', '$rootScope', '$scope', '$timeout',
'BackendClientService', 'SynchronizeService', 'UISessionService', 'UserSessionService',
'packaging'];
angular.module('em.main').controller('SynchronizeController', SynchronizeController);
