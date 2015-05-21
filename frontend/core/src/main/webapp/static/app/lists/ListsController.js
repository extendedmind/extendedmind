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

 function ListsController($scope,
                          AnalyticsService, ArrayService, ListsService, SwiperService, UISessionService,
                          UserService, UserSessionService) {

  if (angular.isFunction($scope.registerArrayChangeCallback)) {
    $scope.registerArrayChangeCallback('list', ['active', 'archived'], invalidateListsArrays,
                                       'ListsController');
  }

  $scope.useSharedLists = function() {
    return UserSessionService.getUserType() === 0 || UserSessionService.getUserType() === 1;
  };

  $scope.isListDataReady = function(listUUID, ownerUUID) {
    var listInfo = ListsService.getListInfo(listUUID, ownerUUID);
    if (listInfo){
      return true;
    }
  };

  $scope.getSharedListFeatureData = function(sharedListUUID, ownerUUID){
    return {list: ListsService.getListInfo(sharedListUUID, ownerUUID).list, owner: ownerUUID};
  };

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
  }

  function sortAndCacheSubsetOfAllLists(subset) {
    var i;
    var cachedLists = [];
    var childLists = [];

    for (i = 0; i < subset.length; i++) {
      var list = subset[i];
      if (list.trans.list) {
        // Push children into temp.
        childLists.push(list);
      } else {
        // Insert parentless lists alphabetically into cache.
        ArrayService.insertItemToArray(list, cachedLists, 'title');
      }
    }

    for (i = 0; i < childLists.length; i++) {
      var childList = childLists[i];
      var parentFoundButPositionAmongSiblingsNotFound = false;

      for (var j = 0; j < cachedLists.length; j++) {
        if (childList.trans.list.trans.uuid === cachedLists[j].trans.uuid ||
            parentFoundButPositionAmongSiblingsNotFound)
        {
          // Parent found, insert alphabetically under parent.
          if (j === cachedLists.length - 1) {
            // End of array, push to the end of the cache.
            cachedLists.push(childList);
            parentFoundButPositionAmongSiblingsNotFound = false;
            break;
          } else if (!cachedLists[j + 1].trans.list) {
            // Next is parentless, insert here.
            cachedLists.splice(j + 1, 0, childList);
            parentFoundButPositionAmongSiblingsNotFound = false;
            break;
          } else if (childList.trans.title <= cachedLists[j + 1].trans.title) {
            // Alphabetical position among siblings found, insert here.
            cachedLists.splice(j + 1, 0, childList);
            parentFoundButPositionAmongSiblingsNotFound = false;
            break;
          } else {
            // Continue iterating until correct position for the child among siblings is found.
            parentFoundButPositionAmongSiblingsNotFound = true;
            continue;
          }
        }
      }
    }
    return cachedLists;
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
    var cachedActiveLists = sortAndCacheSubsetOfAllLists(activeLists);
    var cachedArchivedLists = sortAndCacheSubsetOfAllLists(archivedLists);
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
    }
  };

  $scope.getNewList = function(initialValues) {
    return ListsService.getNewList(initialValues, UISessionService.getActiveUUID());
  };

  var featureChangedCallback = function featureChangedCallback(name, data/*, state*/) {
    if (name === 'list') {
      if (data.list){
        // Shared/adopted list
        $scope.list = data.list;
        $scope.overrideOwnerUUID = data.owner;
      }else{
        $scope.list = data;
      }
    } else if (name === 'lists') {
      if ($scope.features.lists.getStatus('archived') === 'disabled'){
        SwiperService.setOnlyExternal('lists', true);
      }else{
        SwiperService.setOnlyExternal('lists', false);
      }
      if (data && data.archived) {
        // List was archived, swipe to archived lists slide.
        SwiperService.swipeTo('lists/archived');
      }
    }
  };
  UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'ListsController');

  function updateFavoriteLists(favoriteListUuids){
    UserSessionService.setUIPreference('favoriteLists', favoriteListUuids);
    UserService.saveAccountPreferences();
    $scope.refreshFavoriteLists();
  }

  $scope.favoriteList = function(list) {
    if (list.trans.itemType === 'list') {
      var favoriteListUuids = UserSessionService.getUIPreference('favoriteLists');
      if (!favoriteListUuids) favoriteListUuids = [];
      if (favoriteListUuids.indexOf(list.trans.uuid) === -1){
        favoriteListUuids.push(list.trans.uuid);
        updateFavoriteLists(favoriteListUuids);
      }
    } else {
      list.trans.favorited = true;
    }
  };

  $scope.unfavoriteList = function(list) {
    if (list.trans.itemType === 'list') {
      var favoriteListUuids = UserSessionService.getUIPreference('favoriteLists');
      if (favoriteListUuids){
        var favoriteIndex = favoriteListUuids.indexOf(list.trans.uuid);
        if (favoriteIndex !== -1){
          favoriteListUuids.splice(favoriteIndex, 1);
          updateFavoriteLists(favoriteListUuids);
        }
      }
    } else {
      delete list.trans.favorited;
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
        $scope.changeFeature('list', savedList, true);
      });
    }
  };

  $scope.saveAndArchiveList = function(list){
    var saveListDeferred = $scope.saveList(list);
    if (saveListDeferred){
      return saveListDeferred.then(function(){
        return $scope.archiveList(list);
      });
    }
  };

  $scope.archiveList = function(list) {
    if (list.trans.uuid){
      AnalyticsService.do('archiveList');
      return ListsService.archiveList(list);
    }
  };

  $scope.saveAndUnarchiveList = function(list){
    var saveListDeferred = $scope.saveList(list);
    if (saveListDeferred){
      return saveListDeferred.then(function(){
        return $scope.unarchiveList(list);
      });
    }
  };

  $scope.unarchiveList = function(list) {
    if (list.trans.uuid){
      AnalyticsService.do('unarchiveList');
      return ListsService.unarchiveList(list);
    }
  };

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
}

ListsController['$inject'] = ['$scope',
'AnalyticsService', 'ArrayService', 'ListsService', 'SwiperService', 'UISessionService', 'UserService',
'UserSessionService'
];
angular.module('em.base').controller('ListsController', ListsController);
