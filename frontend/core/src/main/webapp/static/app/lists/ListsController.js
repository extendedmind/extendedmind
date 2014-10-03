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

 function ListsController($q, $scope, AnalyticsService, ListsService, UISessionService) {

  var featureChangedCallback = function featureChangedCallback(name, data/*, state*/) {
    if (name === 'list') {
      $scope.list = data;
      $scope.subtask = {transientProperties: {list: $scope.list.uuid}};
      $scope.newNote = {transientProperties: {list: $scope.list.uuid}};
    }
  };
  UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'ListsController');

  $scope.saveList = function saveList(list) {
    ListsService.saveList(list, UISessionService.getActiveUUID());
    $scope.gotoPreviousPage();
  };

  $scope.setUnsavedList = function setUnsavedList(/*list*/) {
    $scope.newList = {};
  };

  $scope.clearUnsavedList = function clearUnsavedList() {
    $scope.newList = undefined;
  };

  $scope.addList = function addList(newList) {
    if (!newList.title || newList.title.length === 0) return false;

    var listToSave = {title: newList.title};
    delete newList.title;
    return ListsService.saveList(listToSave, UISessionService.getActiveUUID()).then(function(list) {
      AnalyticsService.do('addList');
      return list;
    });
  };

  $scope.archiveList = function archiveList(list) {
    ListsService.archiveList(list, UISessionService.getActiveUUID());
  };

  $scope.deleteList = function deleteList(list) {
    ListsService.deleteList(list, UISessionService.getActiveUUID());
  };

  // Navigation

  $scope.gotoList = function gotoList(list) {
    if (UISessionService.getCurrentFeatureName() !== 'list' || UISessionService.getFeatureState('list') !== list) {
      UISessionService.changeFeature('list', list);
      AnalyticsService.visit('list');
    }
  };

  $scope.archiveListAndMoveToLists = function archiveListAndMoveToLists(list) {
    $scope.archiveList(list);
    UISessionService.changeFeature('lists');
  };

  $scope.deleteListAndMoveToLists = function deleteListAndMoveToLists(list) {
    $scope.deleteList(list);
    UISessionService.changeFeature('lists');
  };

  $scope.saveListAndMoveToLists = function saveListAndMoveToLists(list) {
    $scope.editListFields(list);
    UISessionService.changeFeature('lists');
  };
}

ListsController['$inject'] = ['$q', '$scope', 'AnalyticsService', 'ListsService', 'UISessionService'];
angular.module('em.base').controller('ListsController', ListsController);
