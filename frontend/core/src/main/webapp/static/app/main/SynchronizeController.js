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
    $scope.refreshFavoriteLists();
    itemsSynchronizeCounter++;
    if ($rootScope.signUpInProgress) $rootScope.signUpInProgress = false;
  }
  SynchronizeService.registerItemsSynchronizedCallback(itemsSynchronizedCallback);

  function updateItemsSyncronizeAttempted(ownerUUID){
    var timestamp = Date.now();
    UserSessionService.setItemsSynchronizeAttempted(timestamp, ownerUUID);
    $rootScope.syncAttempted = timestamp;
  }


  function synchronize() {
    var ownerUUID = UISessionService.getActiveUUID();
    if (ownerUUID){
      synchronizeItems(ownerUUID).then(function(success){
        if (success && (success.status !== 'fakeUser')){
          doSynchronizeOwner(ownerUUID, success.since, success.status === 'firstSync');
        }
      });
    }
  }

  // Synchronize items for owner if not already synchronizing and interval reached.

  function synchronizeItems(ownerUUID) {
    function isItemSynchronizeValid(sinceLastItemsSynchronized){
      if (!sinceLastItemsSynchronized) return true;
      else if (sinceLastItemsSynchronized > itemsSynchronizedThreshold) return true;

      // Also sync if data has not yet been read to memory
      if (!UserSessionService.isPersistentDataLoaded()) return true;
    }
    $scope.registerActivity();

    // User has logged in, now set when user was last synchronized
    $rootScope.synced = UserSessionService.getItemsSynchronized(ownerUUID);
    var sinceLastItemsSynchronized = Date.now() - UserSessionService.getItemsSynchronized(ownerUUID);

    return $q(function(resolve, reject) {
      if (isItemSynchronizeValid(sinceLastItemsSynchronized)) {
        $scope.$evalAsync(function() {
          if (!$rootScope.synced){
            // This is the first load for the user
            $rootScope.syncState = 'active';
          }else{
            $rootScope.syncState = 'modified';
          }
        });

        SynchronizeService.synchronize(ownerUUID).then(function(status) {
          if (status === 'firstSync'){
            // Also immediately after first sync add completed and archived to the mix
            $rootScope.syncState = 'completedAndArchived';
            SynchronizeService.addCompletedAndArchived(ownerUUID).then(function(){
              $rootScope.syncState = 'deleted';
              // Also after this, get deleted items as well
              SynchronizeService.addDeleted(ownerUUID).then(function(){
                updateItemsSyncronizeAttempted(ownerUUID);
                resolve({status: status, since: sinceLastItemsSynchronized});
              }, function(error){
                $rootScope.syncState = 'error';
                reject(error);
              });
            }, function(error){
              $rootScope.syncState = 'error';
              reject(error);
            });
          } else if (status === 'delta') {
            updateItemsSyncronizeAttempted(ownerUUID);
            resolve({status: status, since: sinceLastItemsSynchronized});
          } else if (status === 'fakeUser') {
            $rootScope.syncState = 'local';
            resolve({status: status, since: sinceLastItemsSynchronized});
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

  function doSynchronizeOwner(ownerUUID, sinceLastItemsSynchronized, isFirstSync) {
    // If there has been a long enough time from last sync, update account preferences as well
    if (isFirstSync ||
        itemsSynchronizeCounter === 0 ||
        itemsSynchronizeCounter%userSyncCounterTreshold === 0 ||
        sinceLastItemsSynchronized > userSyncTimeTreshold){
      SynchronizeService.synchronizeUser().then(function(){
        $scope.refreshFavoriteLists();
      });
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
      return SynchronizeService.synchronize(activeUUID).then(function() {
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
  function conflictCallback() {
    var activeUUID = UISessionService.getActiveUUID();
    return SynchronizeService.synchronize(activeUUID).then(function() {
      updateItemsSyncronizeAttempted(activeUUID);
    }, function(){
      $rootScope.syncState = 'error';
      $q.reject();
    });
  }
  BackendClientService.registerConflictCallback(conflictCallback);

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
