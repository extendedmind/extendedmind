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

 function ListsController($q, $rootScope, $scope, AnalyticsService, ListsService,
                          UISessionService, UserService, UserSessionService) {

  var featureChangedCallback = function featureChangedCallback(name, data/*, state*/) {
    if (name === 'list') {
      $scope.list = data;
      $scope.subtask = {transientProperties: {list: $scope.list.uuid}};
      $scope.newNote = {transientProperties: {list: $scope.list.uuid}};
    }
  };
  UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'ListsController');

  function updateFavoriteLists(favoriteListUuids){
    UserSessionService.setUIPreference('favoriteLists', favoriteListUuids);
    UserService.updateAccountPreferences();
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
      saveListDeferred.then(function(savedList){
        $scope.changeFeature('list', savedList);
      });
    }
  };

  $scope.saveAndArchiveList = function(list){
    var saveListDeferred = $scope.saveList(list);
    if (saveListDeferred){
      return saveListDeferred.then(function(savedList){
        $scope.archiveList(savedList);
      });
    }
  };

  $scope.archiveList = function(list) {
    AnalyticsService.do('archiveList');
    return ListsService.archiveList(list, UISessionService.getActiveUUID());
  };

  $scope.deleteList = function(list) {
    AnalyticsService.do('deleteList');
    return ListsService.deleteList(list, UISessionService.getActiveUUID());
  };

  // Navigation


  $scope.saveListAndMoveToLists = function(list) {
    $scope.editListFields(list);
    $scope.changeFeature('lists');
  };
}

ListsController['$inject'] = ['$q', '$rootScope', '$scope', 'AnalyticsService', 'ListsService',
'UISessionService', 'UserService', 'UserSessionService'];
angular.module('em.base').controller('ListsController', ListsController);
