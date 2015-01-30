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

 function RecurringEditorController($scope, DrawerService, ItemsService, TasksService, UISessionService) {

  // Start from the first item.
  $scope.iterableItem = $scope.iterableItems[0];

  // Set initial $scope variable.
  if ($scope.mode === 'item') {
    $scope.item = $scope.iterableItem;
    itemType = 'item';
  }

  var itemType;
  function setItemType(type) {
    itemType = type;
  }

  $scope.getItemType = function() {
    return itemType;
  };

  $scope.getIterableItemIndex = function(dataInEdit) {
    return $scope.iterableItems.indexOf(dataInEdit);
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
  }

  $scope.endSorting = $scope.closeEditor;

  function initializeAndGotoNextItemOrEndSortingOnLast(dataInEdit) {
    var iterableItemIndex = $scope.getIterableItemIndex(dataInEdit);
    if (iterableItemIndex < $scope.iterableItems.length - 1) {
      // Still more items.
      resetLeftOverVariables();

      $scope.iterableItem = $scope.iterableItems[iterableItemIndex + 1];
      $scope.item = $scope.iterableItem;
      setIterableItemDirty(false);
      setItemType($scope.mode);
      DrawerService.enableDragging('right');

    } else {
      // End.
      $scope.closeEditor();
    }

  }
  var aboutToCloseCallbackRegistered;
  var interceptedRegisterAboutToCloseCallback = $scope.registerFeatureEditorAboutToCloseCallback;
  $scope.registerFeatureEditorAboutToCloseCallback = function() {
    if (!aboutToCloseCallbackRegistered) {
      aboutToCloseCallbackRegistered = true;
      interceptedRegisterAboutToCloseCallback();
    }
  };

  $scope.saveItemAndGotoNextItem = function(dataInEdit) {
    var itemType = $scope.getItemType();

    if ($scope.mode === 'item') {
      if (itemType === 'item') {
        initializeAndGotoNextItemOrEndSortingOnLast(dataInEdit);
        $scope.saveItem(dataInEdit);
      }
      else if (itemType === 'task') {
        initializeAndGotoNextItemOrEndSortingOnLast(dataInEdit);
        var completeAfterConvert = dataInEdit.trans.optimisticComplete();

        ItemsService.itemToTask(dataInEdit, UISessionService.getActiveUUID()).then(function() {
          if (completeAfterConvert) $scope.toggleCompleteTask(dataInEdit);
        });
      } else if (itemType === 'note') {
        initializeAndGotoNextItemOrEndSortingOnLast(dataInEdit);
        ItemsService.itemToNote(dataInEdit, UISessionService.getActiveUUID());
      }
    }
  };

  $scope.undoSorting = function(dataInEdit) {
    resetLeftOverVariables();

    if ($scope.getItemType() === 'note') {
      if (dataInEdit.trans.content) {
        dataInEdit.trans.description = dataInEdit.trans.content;
        delete dataInEdit.trans.content;
      }
    }

    if ($scope.mode === 'item') {
      $scope.item = dataInEdit;
      setItemType('item');
    }

    setIterableItemDirty(false);
    DrawerService.enableDragging('right');
  };

  // OVERRIDDEN METHODS

  $scope.convertToTask = function(dataInEdit){
    $scope.task = TasksService.prepareConvertTask(dataInEdit);
    setItemType('task');
    setIterableItemDirty(true);
    DrawerService.disableDragging('right');
  };

  $scope.convertToNote = function(dataInEdit) {
    if (dataInEdit.trans.description) {
      dataInEdit.trans.content = dataInEdit.trans.description;
      delete dataInEdit.trans.description;
    }
    $scope.note = dataInEdit;
    setItemType('note');
    setIterableItemDirty(true);
    DrawerService.disableDragging('right');
  };

  $scope.processDelete = function(dataInEdit) {
    initializeAndGotoNextItemOrEndSortingOnLast(dataInEdit);
    if ($scope.mode === 'item') $scope.deleteItem(dataInEdit);
  };

  $scope.processClose = function(dataInEdit) {
    $scope.saveItemAndGotoNextItem(dataInEdit);
  };

  $scope.handleTitlebarEnterAction = angular.noop;
}

RecurringEditorController['$inject'] = ['$scope', 'DrawerService', 'ItemsService', 'TasksService',
'UISessionService'];
angular.module('em.main').controller('RecurringEditorController', RecurringEditorController);
