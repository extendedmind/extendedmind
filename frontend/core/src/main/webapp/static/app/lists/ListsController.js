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

 function ListsController($q, $rootScope, $scope, $timeout,
                          AnalyticsService, ListsService, SwiperService, UISessionService, UserService,
                          UserSessionService) {

  var featureChangedCallback = function featureChangedCallback(name, data/*, state*/) {
    if (name === 'list') {
      $scope.list = data;
      $scope.subtask = {trans: {list: $scope.list.uuid}};
      $scope.newNote = {trans: {list: $scope.list.uuid}};
    } else if (name === 'lists') {
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

  $scope.favoriteList = function(list) {
    var favoriteListUuids = UserSessionService.getUIPreference('favoriteLists');
    if (!favoriteListUuids) favoriteListUuids = [];
    if (favoriteListUuids.indexOf(list.uuid) === -1){
      favoriteListUuids.push(list.uuid);
      updateFavoriteLists(favoriteListUuids);
    }
  };

  $scope.unfavoriteList = function(list) {
    var favoriteListUuids = UserSessionService.getUIPreference('favoriteLists');
    if (favoriteListUuids){
      var favoriteIndex = favoriteListUuids.indexOf(list.uuid);
      if (favoriteIndex !== -1){
        favoriteListUuids.splice(favoriteIndex, 1);
        updateFavoriteLists(favoriteListUuids);
      }
    }
  };

  // SAVING

  $scope.saveList = function(list) {
    if (list && list.title && list.title.length > 0){
      if (list.uuid){
        AnalyticsService.do('saveList');
      }else{
        AnalyticsService.do('addList');
      }
      return ListsService.saveList(list, UISessionService.getActiveUUID());
    }
  };

  $scope.saveListAndChangeFeature = function(list) {
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
      return saveListDeferred.then(function(savedList){
        return $scope.archiveList(savedList);
      });
    }
  };

  $scope.archiveList = function(list) {
    if (list.uuid){
      AnalyticsService.do('archiveList');
      return ListsService.archiveList(list, UISessionService.getActiveUUID());
    }
  };

  // (UN)DELETING

  $scope.deleteList = function(list) {
    if (list.uuid){
      AnalyticsService.do('deleteList');
      return ListsService.deleteList(list, UISessionService.getActiveUUID()).then(function(){
        UISessionService.pushDelayedNotification({
          type: 'deleted',
          itemType: 'list', // NOTE: Same as list.trans.itemType.
          item: list,
          undoFn: $scope.undeleteList
        });
        $timeout(function() {
          UISessionService.activateDelayedNotifications();
        }, $rootScope.EDITOR_CLOSED_FAILSAFE_TIME);
      });
    }
  };

  $scope.undeleteList = function(list) {
    if (list.uuid){
      AnalyticsService.do('undeleteList');
      return ListsService.undeleteList(list, UISessionService.getActiveUUID());
    }
  };

  // Navigation


  $scope.saveListAndMoveToLists = function(list) {
    $scope.editListFields(list);
    $scope.changeFeature('lists');
  };
}

ListsController['$inject'] = ['$q', '$rootScope', '$scope', '$timeout',
  'AnalyticsService', 'ListsService', 'SwiperService', 'UISessionService', 'UserService', 'UserSessionService'
];
angular.module('em.base').controller('ListsController', ListsController);
