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

 function UserController($http, $location, $q, $rootScope, $scope, $templateCache, $window,
                         AnalyticsService, AuthenticationService, BackendClientService, ItemsService,
                         ListsService, NotesService, SwiperService, SynchronizeService, TagsService,
                         TasksService, UISessionService, UserService, UserSessionService,
                         packaging, version) {

  $scope.extendedMindVersion = version;

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

  // NAVIGATION

  $scope.activeDetails = undefined;
  $scope.swipeToDetails = function(detailsType){
    $scope.activeDetails = detailsType;
    if (detailsType === 'settings'){
      initializeSettings();
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
    UserService.logout().then(function() {
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

  // SETTINGS

  function initializeSettings(){
    $scope.settings = {
      hideFooter: UserSessionService.getUIPreference('hideFooter'),
      disableVibration: UserSessionService.getUIPreference('disableVibration')
    };
  }

  $scope.settingsCheckboxClicked = function(preference) {
    if ($scope.settings[preference] !== undefined){
      UserSessionService.setUIPreference(preference, $scope.settings[preference]);
      UserService.saveAccountPreferences();
    }
  };

  if (packaging.endsWith('cordova')) {
    if (!window.plugins || !window.plugins.calendar) {
      document.addEventListener('deviceready', function() {
        $scope.agendaCalendarSettingVisible = window.plugins && window.plugins.calendar;
      });
    } else {
      $scope.agendaCalendarSettingVisible = true;
    }
  }

  // TODO: reset onboarding!
  $scope.showOnboardingCheckbox = function showOnboardingCheckbox() {
    return UserSessionService.getUserType() === 0 || UserSessionService.getUserType() === 1;
  };

  // TERMS AND PRIVACY

  $scope.openTermsInEditor = function(){
    var user  = UserSessionService.getUser();
    $http.get('http://ext.md/terms.html').then(function(termsResponse){
      user.terms = termsResponse.data;
      $scope.openEditor('user', user, 'terms');
    });
  };

  $scope.openPrivacyInEditor = function(){
    var user  = UserSessionService.getUser();
    $http.get('http://ext.md/privacy.html').then(function(privacyResponse){
      user.privacy = privacyResponse.data;
      $scope.openEditor('user', user, 'privacy');
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
      return $scope.items.length;
    }else if (itemType === 'task'){
      var tasks = TasksService.getTasks(UISessionService.getActiveUUID());
      if (tasks)
        return tasks.length;
    }else if (itemType === 'note'){
      return $scope.allNotes.length;
    }else if (itemType === 'list'){
      return $scope.allLists.length;
    }else if (itemType === 'tag'){
      return $scope.tags.length;
    }else if (itemType === 'deleted'){
      return getDeletedItemsLength();
    }
  };

  $scope.getQueueLength = function(){
    return BackendClientService.getQueueLength();
  }

}
UserController['$inject'] = ['$http', '$location', '$q', '$rootScope', '$scope', '$templateCache', '$window',
'AnalyticsService', 'AuthenticationService', 'BackendClientService', 'ItemsService', 'ListsService',
'NotesService', 'SwiperService', 'SynchronizeService', 'TagsService', 'TasksService', 'UISessionService',
'UserService', 'UserSessionService', 'packaging', 'version'];
angular.module('em.user').controller('UserController', UserController);
