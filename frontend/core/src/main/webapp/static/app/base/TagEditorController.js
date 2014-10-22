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

 function TagEditorController($q, $rootScope, $scope) {

  // INITIALIZE VARIABLES

  // We expect there to be a $scope.tag

  $scope.titlebar.text = $scope.tag.title;

  // SAVING, DELETING

  function saveTagInEdit() {
    $scope.tag.title = $scope.titlebar.text;
    $scope.deferEdit().then(function() {
      if ($scope.tag.tagType === 'context'){
        $scope.saveContext($scope.tag);
      }else if ($scope.tag.tagType === 'keyword'){
        $scope.saveKeyword($scope.tag);
      }
    });
  };

  $scope.deleteTagInEdit = function() {
    var deferredDelete;
    if ($scope.tag.tagType === 'context'){
      deferredDelete = $scope.deleteContext($scope.tag);
    }else if ($scope.tag.tagType === 'keyword'){
      deferredDelete = $scope.deleteKeyword($scope.tag);
    }
    deferredDelete.then(function(){
      $scope.closeEditor();
    });
  };

  $scope.endTagEdit = function() {
    $scope.closeEditor();
    if ($scope.titlebarHasText()) saveTagInEdit();
  };

  // TITLEBAR

  $scope.tagTitlebarTextKeyDown = function (keydownEvent) {
    $scope.handleBasicTitlebarKeydown(keydownEvent, $scope.item);
    // Return
    if (event.keyCode === 13 && $scope.titlebarHasText()) {
      // Enter in editor saves, no line breaks allowed
      $scope.closeEditor();
      saveTagInEdit();
      event.preventDefault();
      event.stopPropagation();
    }
  };
}

TagEditorController['$inject'] = ['$q', '$rootScope', '$scope'];
angular.module('em.main').controller('TagEditorController', TagEditorController);
