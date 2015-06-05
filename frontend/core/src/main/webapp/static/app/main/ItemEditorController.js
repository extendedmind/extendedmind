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

  // VISIBILITY

  $scope.showItemEditorComponent = function(componentName) {
    switch (componentName) {

      case 'collapsible':
      return $scope.collapsibleOpen && !$scope.isPropertyInDedicatedEdit();
      break;

      case 'lessMore':
      return $scope.item.created && !$scope.isPropertyInDedicatedEdit();
    }
  };

  $scope.collapsibleOpen = false;
  $scope.toggleCollapsible = function() {
    $scope.collapsibleOpen = !$scope.collapsibleOpen;
  };

  // SAVING, DELETING

  function saveItemInEdit() {
    $scope.deferEdit().then(function() {
      $scope.saveItem($scope.item);
    });
  }

  $scope.deleteItemInEdit = function() {
    $scope.processDelete($scope.item, $scope.deleteItem, $scope.undeleteItem);
  };

  $scope.isItemEdited = function() {
    if ($scope.itemTitlebarHasText()) {
      return ItemsService.isItemEdited($scope.item);
    }
  };

  $scope.endItemEdit = function() {
    $scope.closeEditor();
  };

  function itemEditorAboutToClose() {
    if (angular.isFunction($scope.unregisterEditorAboutToCloseCallback))
      $scope.unregisterEditorAboutToCloseCallback('ItemEditorController');

    if ($scope.isItemEdited() && !$scope.item.trans.deleted) saveItemInEdit();
    else ItemsService.resetItem($scope.item);
  }

  // TITLEBAR

  $scope.itemTitlebarHasText = function() {
    return $scope.item.trans.title && $scope.item.trans.title.length !== 0;
  };

  $scope.itemTitlebarTextKeyDown = function (keydownEvent) {
    $scope.handleBasicTitlebarKeydown(keydownEvent, $scope.item);
    // Return
    if (event.keyCode === 13) {
      if ($scope.itemTitlebarHasText()) {
        // Enter in editor saves, no line breaks allowed
        $scope.handleTitlebarEnterAction(saveItemInEdit);
      }
      event.preventDefault();
      event.stopPropagation();
    }
  };
}

ItemEditorController['$inject'] = ['$q', '$rootScope', '$scope', 'ItemsService', 'UISessionService'];
angular.module('em.main').controller('ItemEditorController', ItemEditorController);
