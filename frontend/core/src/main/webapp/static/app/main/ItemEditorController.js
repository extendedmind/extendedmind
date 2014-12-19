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

 function ItemEditorController($q, $rootScope, $scope, ItemsService, UISessionService) {

  // INITIALIZING

  if (angular.isFunction($scope.registerFeatureEditorAboutToCloseCallback))
    $scope.registerFeatureEditorAboutToCloseCallback(itemEditorAboutToClose, 'ItemEditorController');

  // SAVING, DELETING

  function saveItemInEdit() {
    $scope.deferEdit().then(function() {
      $scope.saveItem($scope.item);
    });
  }

  $scope.deleteItemInEdit = function() {
    // Unregister about to close callback, because delete is run after editor is closed
    // and about to close callback would try to save item in between close and delete.
    if (angular.isFunction($scope.unregisterEditorAboutToCloseCallback))
      $scope.unregisterEditorAboutToCloseCallback();

    $scope.closeTaskEditor();
    $scope.deferEdit().then(function(){
      UISessionService.allow('leaveAnimation', 200);
      $scope.deleteItem($scope.item);
    });
  };

  $scope.isItemEdited = function() {
    if ($scope.itemTitlebarHasText()) {
      return ItemsService.isItemEdited($scope.item, UISessionService.getActiveUUID());
    }
  };

  $scope.endItemEdit = function() {
    $scope.closeEditor();
  };

  function itemEditorAboutToClose() {
    if ($scope.isItemEdited() && !$scope.item.deleted) saveItemInEdit();
    else ItemsService.resetItem($scope.item, UISessionService.getActiveUUID());
  }

  // TITLEBAR

  $scope.itemTitlebarHasText = function() {
    return $scope.item.trans.title && $scope.item.trans.title.length !== 0;
  };

  $scope.itemTitlebarTextKeyDown = function (keydownEvent) {
    $scope.handleBasicTitlebarKeydown(keydownEvent, $scope.item);
    // Return
    if (event.keyCode === 13 && $scope.itemTitlebarHasText()) {
      // Enter in editor saves, no line breaks allowed
      $scope.closeEditor();
      saveItemInEdit();
      event.preventDefault();
      event.stopPropagation();
    }
  };
}

ItemEditorController['$inject'] = ['$q', '$rootScope', '$scope', 'ItemsService', 'UISessionService'];
angular.module('em.main').controller('ItemEditorController', ItemEditorController);
