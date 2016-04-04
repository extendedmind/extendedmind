/* Copyright 2013-2016 Extended Mind Technologies Oy
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

 function ItemEditorController($q, $rootScope, $scope, ItemsService) {

  // INITIALIZING

  if (angular.isFunction($scope.registerFeatureEditorAboutToCloseCallback))
    $scope.registerFeatureEditorAboutToCloseCallback(itemEditorAboutToClose, 'ItemEditorController');

  // VISIBILITY

  $scope.showItemEditorComponent = function(componentName) {
    switch (componentName) {

      case 'collapsible':
      return $scope.collapsibleOpen && !$scope.isPropertyInDedicatedEdit();

      case 'lessMore':
      return $scope.item.created && !$scope.isPropertyInDedicatedEdit();
    }
  };

  $scope.collapsibleOpen = false;
  $scope.toggleCollapsible = function() {
    $scope.collapsibleOpen = !$scope.collapsibleOpen;
  };

  // SAVING, DELETING

  function saveItemInEdit(exitAppAfterSave) {
    if (exitAppAfterSave){
      return $scope.saveItem($scope.item);
    }else{
      return $scope.deferEdit().then(function() {
        $scope.saveItem($scope.item);
      });
    }
  }

  $scope.deleteItemInEdit = function() {
    $scope.processDelete($scope.item, $scope.deleteItem, $scope.undeleteItem);
  };

  $scope.endItemEdit = function() {
    $scope.closeEditor();
  };

  function itemEditorAboutToClose(exitAppAfterSave) {
    if (angular.isFunction($scope.unregisterEditorAboutToCloseCallback))
      $scope.unregisterEditorAboutToCloseCallback('ItemEditorController');

    if ($scope.isEdited($scope.item) && !$scope.item.trans.deleted) return saveItemInEdit(exitAppAfterSave);
    else ItemsService.resetItem($scope.item);
  }

  // TITLE HANDLING

  var gotoTitleCallback;
  $scope.gotoItemTitle = function() {
    if (typeof gotoTitleCallback === 'function') gotoTitleCallback();
  };
  $scope.registerGotoItemTitleCallback = function(callback) {
    gotoTitleCallback = callback;
  };

  // TITLEBAR

  $scope.itemTitlebarTextKeyDown = function (keydownEvent) {
    $scope.handleBasicTitlebarKeydown(keydownEvent, $scope.item);
    // Return
    if (event.keyCode === 13) {
      if ($scope.titlebarHasText()) {
        // Enter in editor saves, no line breaks allowed
        $scope.handleTitlebarEnterAction(saveItemInEdit);
      }
      event.preventDefault();
      event.stopPropagation();
    }
  };
}

ItemEditorController['$inject'] = ['$q', '$rootScope', '$scope', 'ItemsService'];
angular.module('em.main').controller('ItemEditorController', ItemEditorController);
