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
 'use strict';

 function UserController($location, $q, $rootScope, $scope, $templateCache, $timeout, $window,
                         AnalyticsService, AuthenticationService, BackendClientService, ContentService,
                         ItemsService, ListsService, NotesService, ReminderService, SwiperService,
                         SynchronizeService, TagsService, TasksService, UISessionService, UserService,
                         UserSessionService) {

  var featureChangedCallback = function featureChangedCallback(name, data/*, state*/) {
    if (name === 'user' && data && data.account === true){
      if ($scope.activeDetails === undefined){
        SwiperService.setInitialSlidePath('user', 'user/details');
        $scope.swipeToDetails('account');
      }else{
        setTimeout(function(){
          $scope.swipeToDetails('account');
        });
      }
    }
  };
  UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'UserController');

  $scope.isAdmin = function isAdmin() {
    return UserSessionService.getUserType() === 0;
  };

  $scope.gotoAdmin = function gotoAdmin() {
    $location.path('/admin');
  };

  $scope.useCollectives = function useCollectives() {
    return $scope.collectives && Object.keys($scope.collectives).length > 1;
  };

  $scope.setMyActive = function setMyActive() {
    if (!$location.path().startsWith('/my')) {
      UISessionService.setMyActive();
      UISessionService.changeFeature('tasks');
      $location.path('/my');
      $templateCache.removeAll();
    } else {
      $scope.toggleMenu();
    }
  };

  $scope.setCollectiveActive = function setCollectiveActive(uuid) {
    if (!$location.path().startsWith('/collective/' + uuid)) {
      UISessionService.setCollectiveActive(uuid);
      UISessionService.changeFeature('tasks');
      $location.path('/collective/' + uuid);
      $templateCache.removeAll();
    }
  };

  $scope.isCollectiveActive = function(uuid) {
    if (UISessionService.getActiveUUID() === uuid) return true;
  };

  $scope.isMyActive = function() {
    if (UISessionService.getActiveUUID() === UserSessionService.getUserUUID()) return true;
  };

  $scope.getUserEmail = function(){
    return UserSessionService.getEmail();
  };

  $scope.getPublishingInfo = function(item){
    return {
      handle: UserSessionService.getHandle(),
      displayName: UserSessionService.getDisplayName(),
      useCreativeCommons: UserSessionService.getUIPreference('useCC'),
      enableSharing: UserSessionService.getUIPreference('sharing'),
      sharing: UserSessionService.getPublicUIPreference('sharing'),
      item: item
    };
  };

  // NAVIGATION

  $scope.activeDetails = undefined;
  $scope.swipeToDetails = function(detailsType){
    $scope.activeDetails = detailsType;
    if (detailsType === 'account'){
      $scope.user = {created: UserSessionService.getUserCreated()};
    }
    SwiperService.swipeTo('user/details');
  };

  $scope.swipeToHome = function(){
    SwiperService.swipeTo('user/home');
  };

  // LOGOUT

  $scope.logOut = function logOut() {
    $scope.loggingOut = true;
    $scope.logoutFailed = false;
    $scope.logoutOffline = false;
    TasksService.unscheduleAllReminders(UISessionService.getActiveUUID())
    .then(UserService.logout).then(function() {
      $rootScope.$emit('emException', {type: 'redirectToEntry'});
    },function(error){
      if (error.type === 'offline') {
        AnalyticsService.error('logout', 'offline');
        $scope.logoutOffline = true;
      } else if (error.type === 'forbidden') {
        AnalyticsService.error('logout', 'failed');
        $scope.logoutFailed = true;
      }
      $scope.loggingOut = false;
    });
  };

  // TERMS AND PRIVACY

  $scope.openTermsInEditor = function(){
    ContentService.getExternalHtml('terms').then(function(response){
      $scope.openEditor('user', {terms: response}, 'terms');
    });
  };

  $scope.openPrivacyInEditor = function(){
    ContentService.getExternalHtml('privacy').then(function(response){
      $scope.openEditor('user', {privacy: response}, 'privacy');
    });
  };

  // OFFLINE MODIFICATIONS

  $scope.modifiedItems = {};
  $scope.getOfflineModified = function(itemType) {
    var modifiedItems = SynchronizeService.getModifiedItems(itemType, UISessionService.getActiveUUID());
    if (modifiedItems && modifiedItems.length){
      $scope.modifiedItems[itemType] = modifiedItems;
      return true;
    }
  };

  function getAgoText(timestamp){
    if (Date.now() - timestamp < 3000){
      return 'just now';
    }else if (Date.now() - timestamp < 10000){
      return 'less than 10 seconds ago';
    }else if (Date.now() - timestamp < 20000){
      return 'less than 20 seconds ago';
    }else if (Date.now() - timestamp < 60000){
      return 'less than a minute ago';
    }else if (Date.now() - timestamp < 600000){
      return 'less than 10 minutes ago';
    }else if (Date.now() - timestamp < 3600000){
      return 'in the past hour';
    }else if (Date.now() - timestamp < 86400000){
      return 'in the past 24 hours';
    }else if (Date.now() - timestamp < 604800000){
      return 'in the past week';
    }else if (Date.now() - timestamp >= 604800000){
      return 'over an week ago';
    }
  }

  $scope.showUnsynced = undefined;
  $scope.getLastSyncedText = function(){
    var lastSyncedText;
    var itemsSynced = UserSessionService.getItemsSynchronized(UISessionService.getActiveUUID());
    if (itemsSynced){
      lastSyncedText = 'last synced: ' + getAgoText(itemsSynced);
    }else{
      lastSyncedText = 'synchronizing';
    }
    return lastSyncedText;
  };

  $scope.getSyncAttemptedText = function(){
    var itemsSynced = UserSessionService.getItemsSynchronized(UISessionService.getActiveUUID());
    var syncAttempted = UserSessionService.getItemsSynchronizeAttempted(UISessionService.getActiveUUID());

    if (itemsSynced && syncAttempted && (syncAttempted > itemsSynced+20000)){
      return 'sync attempted: ' + getAgoText(syncAttempted);
    }
  };

  $scope.visibleModifiedItemsType = undefined;
  $scope.toggleModifiedItems = function(itemType){
    if ($scope.visibleModifiedItemsType !== itemType){
      $scope.visibleModifiedItemsType = itemType;
      if ($scope.showStats) $scope.showStats = false;
    }
    else{
      $scope.visibleModifiedItemsType = undefined;
    }
  };

  // STATISTICS

  $scope.showStats = false;
  $scope.toggleStats = function(){
    $scope.showStats = !$scope.showStats;
    if ($scope.showStats && $scope.visibleModifiedItemsType) $scope.visibleModifiedItemsType = undefined;
  };

  function getDeletedItemsLength() {
    var ownerUUID = UISessionService.getActiveUUID();
    var deletedLength = 0;
    var deletedItems = ItemsService.getDeletedItems(ownerUUID);
    var deletedLists = ListsService.getDeletedLists(ownerUUID);
    var deletedNotes = NotesService.getDeletedNotes(ownerUUID);
    var deletedTags = TagsService.getDeletedTags(ownerUUID);
    var deletedTasks = TasksService.getDeletedTasks(ownerUUID);

    if (deletedItems)
      deletedLength += deletedItems.length;
    if (deletedLists)
      deletedLength += deletedLists.length;
    if (deletedNotes)
      deletedLength += deletedNotes.length;
    if (deletedTags)
      deletedLength += deletedTags.length;
    if (deletedTasks)
      deletedLength += deletedTasks.length;

    return deletedLength;
  }

  $scope.getCount = function(itemType) {
    if (itemType === 'item'){
      return $scope.getItemsArray('all').length;
    }else if (itemType === 'task'){
      return $scope.getTasksArray('all', {force:true}).length;
    }else if (itemType === 'note'){
      return $scope.getNotesArray('all').length;
    }else if (itemType === 'list'){
      return $scope.getListsArray('all').length;
    }else if (itemType === 'tag'){
      return $scope.getTagsArray('all').length;
    }else if (itemType === 'deleted'){
      return getDeletedItemsLength();
    }
  };

  $scope.getQueueLength = function(){
    return BackendClientService.getQueueLength();
  };

  // Actions

  $scope.resendEmailVerification = function(){
    $scope.resendOffline = false;
    $scope.verificationResendInProgress = true;
    UserService.resendVerification().then(function(){
      $scope.showVerifyEmailModal('resent');
      $timeout(function() {
        $scope.verificationResendInProgress = false;
      }, 10000);
    },function(error){
      if (error.type === 'offline') {
        AnalyticsService.error('resend', 'offline');
        $scope.resendOffline = true;
      }
      $scope.verificationResendInProgress = false;
    });
  };

}
UserController['$inject'] = ['$location', '$q', '$rootScope', '$scope', '$templateCache',
'$timeout', '$window', 'AnalyticsService', 'AuthenticationService', 'BackendClientService', 'ContentService',
'ItemsService', 'ListsService', 'NotesService', 'ReminderService', 'SwiperService', 'SynchronizeService',
'TagsService', 'TasksService', 'UISessionService', 'UserService', 'UserSessionService'];
angular.module('em.user').controller('UserController', UserController);
