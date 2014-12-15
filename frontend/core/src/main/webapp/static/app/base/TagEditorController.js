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

  // INITIALIZING

  if (angular.isFunction($scope.registerFeatureEditorAboutToCloseCallback))
    $scope.registerFeatureEditorAboutToCloseCallback(tagEditorAboutToClose, 'TagEditorController');

  // SAVING, DELETING
  function saveTagInEdit() {
    $scope.deferEdit().then(function() {
      if ($scope.tag.tagType === 'context'){
        $scope.saveContext($scope.tag);
      }else if ($scope.tag.tagType === 'keyword'){
        $scope.saveKeyword($scope.tag);
      }
    });
  }

  var deleting = false;
  $scope.deleteTagInEdit = function() {
    deleting = true;
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

  $scope.undeleteTagInEdit = function() {
    if ($scope.tag.tagType === 'context'){
      $scope.undeleteContext($scope.tag);
    }else if ($scope.tag.tagType === 'keyword'){
      $scope.undeleteKeyword($scope.tag);
    }
  };

  $scope.endTagEdit = function() {
    $scope.closeEditor();
  };

  function tagEditorAboutToClose() {
    if ($scope.tagTitlebarHasText() && !$scope.tag.deleted){
      saveTagInEdit();
    }else if (deleting){
      $scope.swipeToContextsAndReset();
      deleting = false;
    }
  }

  // TITLEBAR

  $scope.tagTitlebarHasText = function() {
    return $scope.tag.trans.title && $scope.tag.trans.title.length !== 0;
  };

  $scope.tagTitlebarTextKeyDown = function (keydownEvent) {
    $scope.handleBasicTitlebarKeydown(keydownEvent, $scope.item);
    // Return
    if (event.keyCode === 13 && $scope.tagTitlebarHasText()) {
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
