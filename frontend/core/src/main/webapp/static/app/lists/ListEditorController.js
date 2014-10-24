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

 function ListEditorController($q, $rootScope, $scope) {

  // INITIALIZING

  if (angular.isFunction($scope.registerFeatureEditorAboutToCloseCallback))
    $scope.registerFeatureEditorAboutToCloseCallback(listEditorAboutToClose, 'ListEditorController');

  // We expect there to be a $scope.list via ng-init

  $scope.titlebar.text = $scope.list.title;

  // SAVING, DELETING

  function saveListInEdit () {
    $scope.list.title = $scope.titlebar.text;
    $scope.deferEdit().then(function() {
      $scope.saveList($scope.list);
    });
  }

  $scope.deleteListInEdit = function() {
    // Unregister about to close callback, because delete is run after editor is closed
    // and about to close callback would try to save item in between close and delete.
    if (angular.isFunction($scope.unregisterEditorAboutToCloseCallback))
      $scope.unregisterEditorAboutToCloseCallback();

    $scope.deleteList($scope.list).then(function(){
      $scope.closeEditor();
      // TODO:  Change only when editor opened from deleted list.
      $scope.changeFeature('lists', undefined, false);
    });
  };

  $scope.endListEdit = function() {
    $scope.closeEditor();
  };

  function listEditorAboutToClose() {
    if ($scope.titlebarHasText() && !$scope.list.deleted) saveListInEdit();
  }

  $scope.archiveListInEdit = function() {
    var deferredSaveAndArchive = $scope.saveAndArchiveList($scope.list);
    if (deferredSaveAndArchive){
      return deferredSaveAndArchive.then(function(){
        $scope.closeEditor();
        $scope.changeFeature('lists', $scope.list);
      });
    }
  };

  $scope.clickFavorite = function() {
    if (!$scope.isFavoriteList($scope.list)){
      $scope.favoriteList($scope.list);
    }else{
      $scope.unfavoriteList($scope.list);
    }
  };

  // TITLEBAR

  $scope.listTitlebarTextKeyDown = function (keydownEvent) {
    $scope.handleBasicTitlebarKeydown(keydownEvent, $scope.list);
    // Return
    if (event.keyCode === 13 && $scope.titlebarHasText()) {
      // Enter in editor saves, no line breaks allowed
      $scope.closeEditor();
      saveListInEdit();
      event.preventDefault();
      event.stopPropagation();
    }
  };
}

ListEditorController['$inject'] = ['$q', '$rootScope', '$scope'];
angular.module('em.main').controller('ListEditorController', ListEditorController);
