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

 function ItemEditorController($q, $rootScope, $scope) {

  // INITIALIZING

  if (angular.isFunction($scope.registerFeatureEditorAboutToCloseCallback))
    $scope.registerFeatureEditorAboutToCloseCallback(itemEditorAboutToClose, 'ItemEditorController');

  // We expect there to be a $scope.list via ng-init

  $scope.titlebar.text = $scope.item.title;

  // SAVING, DELETING

  function saveItemInEdit() {
    $scope.item.title = $scope.titlebar.text;
    $scope.deferEdit().then(function() {
      $scope.saveItem($scope.item);
    });
  }

  $scope.deleteItemInEdit = function() {
    $scope.deleteItem($scope.item).then(function(){
      $scope.closeEditor();
    });
  };

  $scope.endItemEdit = function() {
    $scope.closeEditor();
  };

  function itemEditorAboutToClose() {
    if ($scope.titlebarHasText()) saveItemInEdit();
  }

  // TITLEBAR

  $scope.itemTitlebarTextKeyDown = function (keydownEvent) {
    $scope.handleBasicTitlebarKeydown(keydownEvent, $scope.item);
    // Return
    if (event.keyCode === 13 && $scope.titlebarHasText()) {
      // Enter in editor saves, no line breaks allowed
      $scope.closeEditor();
      saveItemInEdit();
      event.preventDefault();
      event.stopPropagation();
    }
  };
}

ItemEditorController['$inject'] = ['$q', '$rootScope', '$scope'];
angular.module('em.main').controller('ItemEditorController', ItemEditorController);
