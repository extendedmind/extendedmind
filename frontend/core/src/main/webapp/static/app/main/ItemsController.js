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

 function ItemsController($scope, $timeout, AnalyticsService, ItemsService, UISessionService) {

  $scope.addItem = function(newItem) {
    console.trace();
    if (newItem.title && newItem.title.length > 0) {
      var newItemToSave = {title: newItem.title};
      delete newItem.title;
      ItemsService.saveItem(newItemToSave, UISessionService.getActiveUUID());
    }
  };

  $scope.deleteItem = function(item) {
    AnalyticsService.do('deleteItem');
    ItemsService.deleteItem(item, UISessionService.getActiveUUID());
    $scope.resetInboxEdit();
  };

  $scope.itemToTask = function(item) {
    $scope.itemType = 'task';
    $scope.task = item;
  };

  $scope.itemToNote = function(item) {
    $scope.itemType = 'note';
    $scope.note = item;
  };

  $scope.itemToList = function(item) {
    AnalyticsService.do('itemToList');
    ItemsService.itemToList(item, UISessionService.getActiveUUID());
    $scope.resetInboxEdit();
  };
}

ItemsController['$inject'] = ['$scope', '$timeout', 'AnalyticsService', 'ItemsService', 'UISessionService'];
angular.module('em.main').controller('ItemsController', ItemsController);
