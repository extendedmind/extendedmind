/* Copyright 2013-2015 Extended Mind Technologies Oy
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
  /* global jQuery */
 'use strict';

 function ListsController($q, $rootScope, $scope,
                          AnalyticsService, ArrayService, ListsService, SwiperService, UISessionService,
                          UserService, UserSessionService) {

  if (angular.isFunction($scope.registerArrayChangeCallback)) {
    $scope.registerArrayChangeCallback('list', ['active', 'archived'], invalidateListsArrays,
                                       'ListsController');
    $scope.registerArrayChangeCallback('list', ['deleted'], notifyListDeleted,
                                       'ListsControllerDeleted');
  }

  var cachedListsArrays = {};

  /*
  * Invalidate cached active lists arrays.
  */
  function invalidateListsArrays(lists, modifiedList, listsType, ownerUUID) {
    if (cachedListsArrays[ownerUUID]) {
      updateAllLists(cachedListsArrays[ownerUUID], ownerUUID);
      cachedListsArrays[ownerUUID]['active'] = undefined;
      cachedListsArrays[ownerUUID]['archived'] = undefined;
      cachedListsArrays[ownerUUID]['activeParentless'] = undefined;
      cachedListsArrays[ownerUUID]['archivedParentless'] = undefined;
    }
    var favoriteListInfos = UserSessionService.getUIPreference('favoriteLists');
    updateFavoritedLists(cachedListsArrays, favoriteListInfos);
  }

  /*
  * Sorted alphabetically.
  *
  * ACTIVE LISTS
  *   parentless1
  *     child1-1
  *     child1-2
  *   parentless2
  *   parentless3
  *     child3-1
  *
  * ARCHIVED LISTS
  *   ...
  */
  function updateAllLists(cachedLists, ownerUUID) {
    var activeLists = ListsService.getLists(ownerUUID);
    var archivedLists = ListsService.getArchivedLists(ownerUUID);
    var cachedActiveLists = ArrayService.sortAlphabeticallyWithParent(activeLists, 'list');
    var cachedArchivedLists = ArrayService.sortAlphabeticallyWithParent(archivedLists, 'list');
    cachedLists['all'] = cachedActiveLists.concat(cachedArchivedLists);
  }

  function updateActiveLists(cachedLists, ownerUUID) {
    if (!cachedLists['all']) updateAllLists(cachedLists, ownerUUID);
    cachedLists['active'] = [];
    for (var i = 0; i < cachedLists['all'].length; i++) {
      if (!cachedLists['all'][i].trans.archived) cachedLists['active'].push(cachedLists['all'][i]);
      // NOTE: break could be executed when the first archived list is reached.
    }
    return cachedLists['active'];
  }

  function updateArchivedLists(cachedLists, ownerUUID) {
    if (!cachedLists['all']) updateAllLists(cachedLists, ownerUUID);
    cachedLists['archived'] = [];
    for (var i = 0; i < cachedLists['all'].length; i++) {
      if (cachedLists['all'][i].trans.archived) cachedLists['archived'].push(cachedLists['all'][i]);
    }
    return cachedLists['archived'];
  }

  function updateActiveParentlessLists(cachedLists, ownerUUID) {
    if (!cachedLists['all']) updateAllLists(cachedLists, ownerUUID);
    cachedLists['activeParentless'] = [];
    for (var i = 0; i < cachedLists['all'].length; i++) {
      if (!cachedLists['all'][i].trans.archived && !cachedLists['all'][i].trans.list) {
        cachedLists['activeParentless'].push(cachedLists['all'][i]);
        // NOTE: break could be executed when the first archived list is reached.
      }
    }
    return cachedLists['activeParentless'];
  }

  function updateArchivedParentlessLists(cachedLists, ownerUUID) {
    if (!cachedLists['all']) updateAllLists(cachedLists, ownerUUID);
    cachedLists['archivedParentless'] = [];
    for (var i = 0; i < cachedLists['all'].length; i++) {
      if (cachedLists['all'][i].trans.archived && !cachedLists['all'][i].trans.list) {
        cachedLists['archivedParentless'].push(cachedLists['all'][i]);
      }
    }
    return cachedLists['archivedParentless'];
  }

  function updateFavoritedLists(cachedLists, favoriteListInfos){
    cachedLists['favorited'] = [];
    if (favoriteListInfos && favoriteListInfos.length){
      for (var i = favoriteListInfos.length-1; i >= 0; i--) {

        var listInfo;
        if (angular.isArray(favoriteListInfos[i])){
          listInfo = ListsService.getListInfo(favoriteListInfos[i][1], favoriteListInfos[i][0]);
        }else{
          listInfo = ListsService.getListInfo(favoriteListInfos[i], UserSessionService.getUserUUID());
        }

        if (listInfo && listInfo.type === 'deleted'){
          // When list is deleted, it needs to be unfavorited
          $scope.unfavoriteList(listInfo.list);
        }else if (listInfo && listInfo.list){
          cachedLists['favorited'].push(listInfo.list);
        }
      }
    }
    return cachedLists['favorited'];
  }


  function validateFavoritedListsArray(cachedFavoritedLists, favoriteListInfos){
    if (!favoriteListInfos || !favoriteListInfos.length){
      if (cachedFavoritedLists && cachedFavoritedLists.length){
        // No favorite lists in preferences, but favorite lists in array => not valid
        return false;
      }else{
        // No favorite lists in preferences and no favorite lists in array => valid
        return true;
      }
    }
    if (favoriteListInfos.length !== cachedFavoritedLists.length){
      // Different number of favorite lists => invalid
      return false;
    }

    // There are equal number of lists there, see if UUID's match
    for (var i=0; i<favoriteListInfos.length; i++){
      var found = false;
      for (var j=0; j<cachedFavoritedLists.length; j++){
        if (getFavoriteListUUID(favoriteListInfos[i]) === cachedFavoritedLists[j].trans.uuid){
          found = true;
          break;
        }
      }
      if (!found){
        return false;
      }
    }
    return true;
  }

  function getFavoriteListUUID(favoriteListInfo){
    if (angular.isString(favoriteListInfo)) return favoriteListInfo;
    else if (angular.isObject(favoriteListInfo)) return favoriteListInfo.uuid;
  }

  function listUUIDChangedCallback(oldListUUID, newListUUID, ownerUUID){
    // Also update favorited lists and adopted lists
    var savePrefs = false;
    var favoriteListInfos = UserSessionService.getUIPreference('favoriteLists');
    if (favoriteListInfos){
      for (var i=favoriteListInfos.length-1; i>=0; i--){
        if (angular.isArray(favoriteListInfos[i]) && favoriteListInfos[i][0] === ownerUUID &&
            favoriteListInfos[i][1] === oldListUUID) {
          favoriteListInfos[i][1] = newListUUID;
          savePrefs = true;
        }else if (favoriteListInfos[i] === oldListUUID){
          favoriteListInfos[i] = newListUUID;
          savePrefs = true;
        }
      }
    }
    if (savePrefs) UserSessionService.setUIPreference('favoriteLists', favoriteListInfos);

    var adoptedListInfos = UserSessionService.getUIPreference('adoptedListInfos');
    if (adoptedListInfos && adoptedListInfos[ownerUUID]){
      var adoptedIndex = adoptedListInfos[ownerUUID].indexOf(oldListUUID);
      if (adoptedIndex !== -1){
        adoptedListInfos[ownerUUID][adoptedIndex] = newListUUID;
        savePrefs = true;
        UserSessionService.setUIPreference('adoptedLists', adoptedListInfos);
      }
    }
    if (savePrefs) UserService.saveAccountPreferences();
  }
  ListsService.registerListUUIDChangedCallback(listUUIDChangedCallback, 'ListsController');

  $scope.getListsArray = function(arrayType/*, info*/) {
    var ownerUUID = UISessionService.getActiveUUID();
    if (!cachedListsArrays[ownerUUID]) cachedListsArrays[ownerUUID] = {};

    switch (arrayType) {

      case 'all':
      // Needed in task/note list picker.
      if (!cachedListsArrays[ownerUUID]['all']) {
        updateAllLists(cachedListsArrays[ownerUUID], ownerUUID);
      }
      return cachedListsArrays[ownerUUID]['all'];

      case 'active':
      // lists/active
      if (!cachedListsArrays[ownerUUID]['active']) {
        updateActiveLists(cachedListsArrays[ownerUUID], ownerUUID);
      }
      return cachedListsArrays[ownerUUID]['active'];

      case 'archived':
      // lists/archived
      if (!cachedListsArrays[ownerUUID]['archived']) {
        updateArchivedLists(cachedListsArrays[ownerUUID], ownerUUID);
      }
      return cachedListsArrays[ownerUUID]['archived'];

      case 'activeParentless':
      // Needed in parent list picker.
      if (!cachedListsArrays[ownerUUID]['activeParentless']) {
        updateActiveParentlessLists(cachedListsArrays[ownerUUID], ownerUUID);
      }
      return cachedListsArrays[ownerUUID]['activeParentless'];

      case 'archivedParentless':
      // Needed in parent list picker.
      if (!cachedListsArrays[ownerUUID]['archivedParentless']) {
        updateArchivedParentlessLists(cachedListsArrays[ownerUUID], ownerUUID);
      }
      return cachedListsArrays[ownerUUID]['archivedParentless'];

      case 'favorited':
      var favoriteListInfos = UserSessionService.getUIPreference('favoriteLists');
      if (!cachedListsArrays['favorited'] ||
          !validateFavoritedListsArray(cachedListsArrays['favorited'], favoriteListInfos)) {
        updateFavoritedLists(cachedListsArrays, favoriteListInfos);
      }
      return cachedListsArrays['favorited'];
    }
  };

  /*
  * When list is deleted, notesFirst setting needs to be removed
  */
  function notifyListDeleted(lists, deletedList, listsType) {
    // Remove notest first when list is deleted to prevent cluttering of preferences of old lists
    if (deletedList){
      $scope.setShowListNotesFirst(deletedList, false);
    }else if (lists && angular.isArray(lists) && listsType === 'deleted'){
      // Loop through all deleted lists
      for (var i=0; i<lists.length; i++){
        $scope.setShowListNotesFirst(lists[i], false);
      }
    }
  }

  $scope.getNewList = function(initialValues) {
    return ListsService.getNewList(initialValues, UISessionService.getActiveUUID());
  };

  function swipeToArchivedLists(){
    SwiperService.swipeTo('lists/archived');
    if (angular.isFunction($scope.unregisterEditorClosedCallback))
      $scope.unregisterEditorClosedCallback('ListsController');
  }

  var featureChangedCallback = function featureChangedCallback(name, data/*, state*/) {
    if (name === 'list' || name === 'listInverse') {
      if (data.list){
        // Shared/adopted list
        $scope.list = data.list;
        $scope.overrideOwnerUUID = data.owner;
      }else{
        $scope.list = data;
        $scope.overrideOwnerUUID = undefined;
      }

      $scope.childLists = undefined;
      if ($scope.list && !$scope.list.trans.list && !$scope.overrideOwnerUUID){
        // Get all children of the context
        var allLists = $scope.getListsArray('all');
        if (allLists){
          var thisListIndex = allLists.indexOf($scope.list);
          if (thisListIndex !== -1){
            for (var i=thisListIndex+1; i<allLists.length; i++){
              if (allLists[i].trans.list === $scope.list){
                if (!$scope.childLists) $scope.childLists = [];
                $scope.childLists.push(allLists[i]);
              }else{
                // Break immediately, as all children are in order after the list
                break;
              }
            }
          }
        }
      }
    } else if (name === 'lists') {
      if ($scope.features.lists.getStatus('archived') === 'disabled'){
        SwiperService.setOnlyExternal('lists', true);
      }else{
        SwiperService.setOnlyExternal('lists', false);
      }
      if (data && data.trans.archived) {
        // Swipe to archive when editor is closed
        if (!$scope.isEditorVisible()){
          swipeToArchivedLists();
        }else if (angular.isFunction($scope.registerEditorClosedCallback)){
          $scope.registerEditorClosedCallback(swipeToArchivedLists, 'ListsController');
        }
      }
      $scope.adoptedLists = getAdoptedListsPerOwner();
    }
  };
  UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'ListsController');

  $scope.changeToList = function(list){
    $scope.changeFeature(getActiveListFeature(list), list, true);
  };

  $scope.changeToSharedList = function(sharedListUUID, ownerUUID){
    var data = {list: ListsService.getListInfo(sharedListUUID, ownerUUID).list, owner: ownerUUID};
    $scope.changeFeature(getActiveListFeature(data.list), data, true);
  };

  $scope.changeToAdoptedList = function(adoptedList, ownerUUID){
    var data = {list: adoptedList, owner: ownerUUID};
    $scope.changeFeature(getActiveListFeature(data.list), data, true);
  };

  function getActiveListFeature(list){
    return $scope.isShowListNotesFirst(list) ? 'listInverse' : 'list';
  }

  function updateFavoriteListPreferences(favoriteListInfos){
    UserSessionService.setUIPreference('favoriteLists', favoriteListInfos);
    UserService.saveAccountPreferences();
  }

  function getFavoriteListIndex(list, favoriteListInfos){
    for (var i=0; i<favoriteListInfos.length; i++){
      if ((angular.isArray(favoriteListInfos[i]) &&
            favoriteListInfos[i][0] === list.trans.owner && favoriteListInfos[i][1] === list.trans.uuid) ||
          (angular.isString(favoriteListInfos[i]) && favoriteListInfos[i] === list.trans.uuid)){
        return i;
      }
    }
  }

  $scope.favoriteList = function(list) {
    if (list.trans.itemType === 'list') {
      var favoriteListInfos = UserSessionService.getUIPreference('favoriteLists');
      if (!favoriteListInfos) favoriteListInfos = [];
      if (getFavoriteListIndex(list, favoriteListInfos) === undefined){
        if (list.trans.owner === UserSessionService.getUserUUID()){
          favoriteListInfos.push(list.trans.uuid);
        }else{
          favoriteListInfos.push([list.trans.owner, list.trans.uuid]);
        }
        updateFavoriteListPreferences(favoriteListInfos);
      }
    } else {
      list.trans.favorited = true;
    }
  };

  $scope.unfavoriteList = function(list) {
    if (list.trans.itemType === 'list') {
      var favoriteListInfos = UserSessionService.getUIPreference('favoriteLists');
      if (favoriteListInfos){
        var favoriteIndex = getFavoriteListIndex(list, favoriteListInfos);
        if (favoriteIndex !== undefined){
          favoriteListInfos.splice(favoriteIndex, 1);
          updateFavoriteListPreferences(favoriteListInfos);
        }
      }
    } else {
      delete list.trans.favorited;
    }
  };

  $scope.isFavoriteList = function (list) {
    var favoritedLists = $scope.getListsArray('favorited');
    if (favoritedLists && favoritedLists.length &&
        favoritedLists.indexOf(list) !== -1){
      return true;
    }
  };

  // SHARED LISTS

  $scope.useSharedLists = function() {
    return $scope.isPersonalData();
  };

  $scope.isListDataReady = function(listUUID, ownerUUID) {
    var listInfo = ListsService.getListInfo(listUUID, ownerUUID);
    if (listInfo){
      return true;
    }
  };

  // ADOPTED LISTS

  $scope.useAdoptedLists = function() {
    if ($scope.isPersonalData()){
      return UserSessionService.getUIPreference('adoptedLists');
    }
  };

  function getAdoptedListsPerOwner() {
    var adoptedListsPerOwner;
    var adoptedLists = UserSessionService.getUIPreference('adoptedLists');
    if (adoptedLists){
      for (var ownerUUID in adoptedLists){
        if (adoptedLists.hasOwnProperty(ownerUUID)){
          for (var i=0; i<adoptedLists[ownerUUID].length; i++){
            var adoptedListInfo = ListsService.getListInfo(adoptedLists[ownerUUID][i], ownerUUID);
            if (adoptedListInfo){
              if (adoptedListInfo.type === 'deleted'){
                // Unadopt deleted list
                $scope.unadoptList(adoptedListInfo.list, true);
              }else{
                if (!adoptedListsPerOwner) adoptedListsPerOwner = {};
                if (!adoptedListsPerOwner[ownerUUID]) adoptedListsPerOwner[ownerUUID] = [];
                adoptedListsPerOwner[ownerUUID].push(adoptedListInfo.list);
              }
            }
          }
        }
      }
    }
    return adoptedListsPerOwner;
  }

  $scope.adoptList = function(list) {
    var adoptedLists = UserSessionService.getUIPreference('adoptedLists');
    if (!adoptedLists) adoptedLists = {};
    if (!adoptedLists[list.trans.owner]) adoptedLists[list.trans.owner] = [];
    adoptedLists[list.trans.owner].push(list.trans.uuid);
    UserSessionService.setUIPreference('adoptedLists', adoptedLists);
    UserService.saveAccountPreferences();

    UISessionService.pushNotification({
      type: 'fyi',
      text: 'list adopted'
    });
    return;
  };

  $scope.unadoptList = function(list, skipNotification) {
    var adoptedLists = UserSessionService.getUIPreference('adoptedLists');
    if (adoptedLists && adoptedLists[list.trans.owner]){
      var adoptedListIndex = adoptedLists[list.trans.owner].indexOf(list.trans.uuid);
      if (adoptedListIndex !== -1){
        adoptedLists[list.trans.owner].splice(adoptedListIndex, 1);
        if (adoptedLists[list.trans.owner].length === 0) delete adoptedLists[list.trans.owner];
        if (jQuery.isEmptyObject(adoptedLists)) adoptedLists = undefined;
        UserSessionService.setUIPreference('adoptedLists', adoptedLists);
        UserService.saveAccountPreferences();
        if (!skipNotification){
          UISessionService.pushNotification({
            type: 'fyi',
            text: 'list adoption removed'
          });
        }
      }
    }
  };

  // NOTES FIRST LISTS

  $scope.isShowListNotesFirst = function(list){
    var notesFirstLists = UserSessionService.getUIPreference('notesFirstLists');
    return $scope.features.focus.getStatus('notes') !== 'disabled' && notesFirstLists &&
           notesFirstLists[list.trans.owner] &&
           notesFirstLists[list.trans.owner].indexOf(list.trans.uuid) !== -1;
  };

  $scope.setShowListNotesFirst = function(list, value){
    var notesFirstLists = UserSessionService.getUIPreference('notesFirstLists');
    if (value === true){
      if (!notesFirstLists) notesFirstLists = {};
      if (!notesFirstLists[list.trans.owner]) notesFirstLists[list.trans.owner] = [];
      notesFirstLists[list.trans.owner].push(list.trans.uuid);
      UserSessionService.setUIPreference('notesFirstLists', notesFirstLists);
      UserService.saveAccountPreferences();
    }else if (notesFirstLists && notesFirstLists[list.trans.owner]){
      var notesFirstListIndex = notesFirstLists[list.trans.owner].indexOf(list.trans.uuid);
      if (notesFirstListIndex !== -1){
        notesFirstLists[list.trans.owner].splice(notesFirstListIndex, 1);
        if (notesFirstLists[list.trans.owner].length === 0) delete notesFirstLists[list.trans.owner];
        if (jQuery.isEmptyObject(notesFirstLists)) notesFirstLists = undefined;
        UserSessionService.setUIPreference('notesFirstLists', notesFirstLists);
        UserService.saveAccountPreferences();
      }
    }
    if ($scope.isFeatureActive('list') || $scope.isFeatureActive('listInverse')){
      $scope.changeFeature('lists');
    }
  };

  // SAVING

  $scope.saveList = function(list) {
    if (list.trans.uuid){
      AnalyticsService.do('saveList');
    }else{
      AnalyticsService.do('addList');
    }
    return ListsService.saveList(list);
  };

  $scope.saveListAndChangeFeature = function(list) {
    var saveListDeferred = $scope.saveList(list);
    if (saveListDeferred){
      return saveListDeferred.then(function(savedList){
        $scope.changeToList(savedList);
      });
    }
  };

  // (UN)ARCHIVING

  $scope.saveAndArchiveList = function(list, customOfflineProcessFn){
    var deferred = $q.defer();
    AnalyticsService.do('saveAndArchiveList');
    var offlineProcessFn = customOfflineProcessFn ? customOfflineProcessFn : processListOffline;
    ListsService.saveAndArchiveList(list).then(
      function(success){
        deferred.resolve(success);
      },function(error){
        if (error.type === 'offline') {
          var retryFn = error.onSave ? ListsService.saveAndArchiveList : ListsService.archiveList;
          offlineProcessFn(error, list, deferred, retryFn);
        }
      });
    return deferred.promise;
  };

  $scope.saveAndUnarchiveList = function(list, customOfflineProcessFn){
    var deferred = $q.defer();
    AnalyticsService.do('saveAndUnarchiveList');
    var offlineProcessFn = customOfflineProcessFn ? customOfflineProcessFn : processListOffline;
    ListsService.saveAndUnarchiveList(list).then(
      function(success){
        deferred.resolve(success);
      },function(error){
        if (error.type === 'offline') {
          var retryFn = error.onSave ? ListsService.saveAndUnarchiveList : ListsService.unarchiveList;
          offlineProcessFn(error, list, deferred, retryFn);
        }
      });
    return deferred.promise;
  };

  function processListOffline(error, list, deferred, retryFn) {
    var rejection = {
      type: 'onlineRequired',
      value: {
        retry: retryFn,
        retryParam: list,
        allowCancel: true,
        promise: deferred.resolve
      }
    };
    $rootScope.$emit('emInteraction', rejection);
  }

  // (UN)DELETING

  $scope.deleteList = function(list) {
    if (list.trans.uuid){
      AnalyticsService.do('deleteList');
      return ListsService.deleteList(list);
    }
  };

  $scope.undeleteList = function(list) {
    if (list.trans.uuid){
      AnalyticsService.do('undeleteList');
      return ListsService.undeleteList(list);
    }
  };

  // Navigation

  $scope.saveListAndMoveToLists = function(list) {
    $scope.editListFields(list);
    $scope.changeFeature('lists');
  };

  // Permissions

  $scope.isListReadOnly = function(list){
    var ownerUUID = list.trans.owner;
    var listUUID = list.trans.uuid;
    return $scope.isCollectiveReadOnly(ownerUUID) || $scope.isSharedListReadOnly(ownerUUID, listUUID);
  };

  // KEYBOARD SHORTCUTS

  if (angular.isFunction($scope.registerKeyboardShortcutCallback)){
    $scope.registerKeyboardShortcutCallback(function(){
      if ($scope.isFeatureActive('lists') &&
          !$scope.isEditorVisible() &&
          $scope.features.lists.getStatus('active') === 'active'){
        SwiperService.swipeNext('lists');
      }else if ($scope.isFeatureActive('list') &&
                !$scope.isEditorVisible()){
        SwiperService.swipeNext('list');
      }else if ($scope.isFeatureActive('listInverse') &&
                !$scope.isEditorVisible()){
        SwiperService.swipeNext('listInverse');
      }
    }, 'right', 'ListsControllerRight');
    $scope.registerKeyboardShortcutCallback(function(){
      if ($scope.isFeatureActive('lists') &&
          !$scope.isEditorVisible() &&
          $scope.features.lists.getStatus('active') === 'active'){
        SwiperService.swipePrevious('lists');
      }else if ($scope.isFeatureActive('list') &&
                !$scope.isEditorVisible()){
        SwiperService.swipePrevious('list');
      }else if ($scope.isFeatureActive('listInverse') &&
                !$scope.isEditorVisible()){
        SwiperService.swipePrevious('listInverse');
      }
    }, 'left', 'ListsControllerLeft');
  }
}

ListsController['$inject'] = ['$q', '$rootScope', '$scope',
'AnalyticsService', 'ArrayService', 'ListsService', 'SwiperService', 'UISessionService', 'UserService',
'UserSessionService'
];
angular.module('em.base').controller('ListsController', ListsController);
