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

 function ItemsController($rootScope, $scope, AnalyticsService, ArrayService, ItemsService, UISessionService) {

  if (angular.isFunction($scope.registerArrayChangeCallback)) {
    $scope.registerArrayChangeCallback('item', ['active'], invalidateItemsArrays,
                                       'ItemsController');
  }

  var cachedItemsArrays = {};

  /*
  * Invalidate cached active notes arrays.
  */
  function invalidateItemsArrays(items, modifiedItem, itemsType, ownerUUID) {
    if (cachedItemsArrays[ownerUUID]) {
      updateAllItems(cachedItemsArrays[ownerUUID], ownerUUID);
    }
  }

  function updateAllItems(cachedItems, ownerUUID) {
    var activeItems = ItemsService.getItems(ownerUUID);
    cachedItems['all'] = [];
    if (activeItems && activeItems.length){
      for (var i = 0; i < activeItems.length; i++) {
        ArrayService.insertItemToArray(activeItems[i], cachedItems['all'], 'created', true);
      }
    }
  }

  $scope.getItemsArray = function(arrayType, info) {
    var ownerUUID = info && info.owner ? info.owner : UISessionService.getActiveUUID();
    if (!cachedItemsArrays[ownerUUID]) cachedItemsArrays[ownerUUID] = {};
    switch (arrayType) {
      case 'all':
      if (!cachedItemsArrays[ownerUUID]['all']) {
        updateAllItems(cachedItemsArrays[ownerUUID], ownerUUID);
      }
      return cachedItemsArrays[ownerUUID]['all'];
    }
  };

  // NAVIGATING

  $scope.openItemEditor = function(item){
    $scope.openEditor('item', item);
  };

  $scope.gotoInbox = function(item){
    $scope.changeFeature('inbox', item, true);
  };

  $scope.getNewItem = function(initialValues){
    return ItemsService.getNewItem(initialValues, UISessionService.getActiveUUID());
  };

  // SAVING

  $scope.saveItem = function(item) {
    return ItemsService.saveItem(item, UISessionService.getActiveUUID());
  };

  // DELETING

  $scope.deleteItem = function(item) {
    if (item.trans.uuid) {
      AnalyticsService.do('deleteItem');
      return ItemsService.deleteItem(item);
    }
  };

  $scope.undeleteItem = function(item) {
    if (item.trans.uuid) {
      AnalyticsService.do('undeleteItem');
      return ItemsService.undeleteItem(item);
    }
  };
}

ItemsController['$inject'] = ['$rootScope', '$scope', 'AnalyticsService', 'ArrayService', 'ItemsService',
'UISessionService'];
angular.module('em.main').controller('ItemsController', ItemsController);
