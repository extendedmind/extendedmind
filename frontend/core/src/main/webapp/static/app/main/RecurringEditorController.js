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

 function RecurringEditorController($scope, ItemsService, UISessionService) {

  // Start from the first item.
  var iterableItem = $scope.iterableItems[0];

  // Set initial $scope variable.
  if ($scope.mode === 'item') {
    $scope.item = iterableItem;
    itemType = 'item';
  }

  var itemType;
  function setItemType(type) {
    itemType = type;
  }

  $scope.getItemType = function() {
    return itemType;
  };

  $scope.getIterableItemIndex = function() {
    return $scope.iterableItems.indexOf(iterableItem);
  };

  var iterableItemDirty;
  function setIterableItemDirty(dirty) {
    iterableItemDirty = dirty;
  }

  $scope.isIterableItemDirty = function() {
    return iterableItemDirty;
  };

  function resetLeftOverVariables() {
    // Reset $scope variables. These may exist from previous editor.
    $scope.task = undefined;
    $scope.note = undefined;
    $scope.list = undefined;
    $scope.item = undefined;
    $scope.tag = undefined;
  }

  $scope.endSorting = $scope.closeEditor;

  $scope.saveItemAndGotoNextItem = function() {
    var itemType = $scope.getItemType();

    if ($scope.mode === 'item') {
      if (itemType === 'task') {
        ItemsService.itemToTask($scope.task, UISessionService.getActiveUUID()).then(function() {

          // Go to next item or end sorting if last.
          var iterableItemIndex = $scope.getIterableItemIndex();
          if (iterableItemIndex < $scope.iterableItems.length - 1) {
            // Still more items.
            $scope.initializeEditor('recurring', $scope.iterableItems, $scope.mode);
            resetLeftOverVariables();

            iterableItem = $scope.iterableItems[iterableItemIndex + 1];
            $scope.item = iterableItem;
            setIterableItemDirty(false);
            setItemType('item');

          } else {
            // End.
            $scope.closeEditor();
          }
        });
      }
    }
  };

  $scope.undoSorting = function() {
    $scope.initializeEditor('recurring', $scope.iterableItems, $scope.mode);
    resetLeftOverVariables();

    if ($scope.mode === 'item') {
      $scope.item = iterableItem;
      setItemType('item');
    }

    setIterableItemDirty(false);
  };

  $scope.convertToTask = function(){
    $scope.initializeEditor('recurring', $scope.iterableItems, $scope.mode);
    $scope.task = iterableItem;
    setItemType('task');
    setIterableItemDirty(true);
  };
}

RecurringEditorController['$inject'] = ['$scope', 'ItemsService', 'UISessionService'];
angular.module('em.main').controller('RecurringEditorController', RecurringEditorController);
