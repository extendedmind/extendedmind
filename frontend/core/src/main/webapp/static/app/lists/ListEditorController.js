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

 function ListEditorController($q, $rootScope, $scope, $timeout, DateService, UISessionService) {

  // INITIALIZE VARIABLES

  // We expect there to be a $scope.list

  $scope.titlebar.text = $scope.list.title;

  // SAVING, DELETING

  $scope.saveListInEdit = function() {
    $scope.list.title = $scope.titlebar.text;
    $scope.deferEdit().then(function() {
      $scope.saveList($scope.list);
    });
  };

  $scope.deleteListInEdit = function() {
    $scope.deleteList($scope.list).then(function(){
      $scope.closeEditor();
      $scope.changeFeature('lists', undefined, false);
    });
  };

  $scope.endListEdit = function() {
    $scope.closeEditor();
    if ($scope.titlebarHasText()) $scope.saveListInEdit();
  }

  $scope.archiveListInEdit = function() {
    var deferredSaveAndArchive = $scope.saveAndArchiveList($scope.list);
    if (deferredSaveAndArchive){
      return deferredSaveAndArchive.then(function(){
        $scope.closeEditor();
        $scope.changeFeature('lists', list);
      });
    }
  };

  $scope.clickFavorite = function() {
    $scope.favoriteList($scope.list);
  }

  // TITLEBAR

  $scope.listTitlebarTextKeyDown = function (keydownEvent) {
    $scope.handleBasicTitlebarKeydown(keydownEvent, $scope.list);
    // Return
    if (event.keyCode === 13 && $scope.titlebarHasText()) {
      // Enter in editor saves, no line breaks allowed
      $scope.closeEditor();
      $scope.saveListInEdit();
      event.preventDefault();
      event.stopPropagation();
    }
  };
}

ListEditorController['$inject'] = ['$q', '$rootScope', '$scope', '$timeout', 'DateService',
'UISessionService'];
angular.module('em.main').controller('ListEditorController', ListEditorController);
