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

 function TagEditorController($q, $rootScope, $scope, TagsService, UISessionService) {

  // INITIALIZING

  if (angular.isFunction($scope.registerFeatureEditorAboutToCloseCallback))
    $scope.registerFeatureEditorAboutToCloseCallback(tagEditorAboutToClose, 'TagEditorController');

  // VISIBILITY

  $scope.showTagEditorComponent = function(componentName) {
    switch (componentName) {

      case 'collapsible':
      return $scope.collapsibleOpen && !$scope.isPropertyInDedicatedEdit();
      break;

      case 'lessMore':
      return $scope.tag.created && !$scope.isPropertyInDedicatedEdit();
    }
  };

  $scope.collapsibleOpen = false;
  $scope.toggleCollapsible = function() {
    $scope.collapsibleOpen = !$scope.collapsibleOpen;
  };


  // SAVING, DELETING
  function saveTagInEdit() {
    $scope.deferEdit().then(function() {
      if ($scope.tag.trans.tagType === 'context'){
        $scope.saveContext($scope.tag);
      }else if ($scope.tag.trans.tagType === 'keyword'){
        $scope.saveKeyword($scope.tag);
      }
    });
  }

  var deleting = false;
  $scope.deleteTagInEdit = function() {
    deleting = true;
    var deferredDelete;
    if ($scope.tag.trans.tagType === 'context'){
      deferredDelete = $scope.deleteContext($scope.tag);
    }else if ($scope.tag.trans.tagType === 'keyword'){
      deferredDelete = $scope.deleteKeyword($scope.tag);
    }
    deferredDelete.then(function(){
      $scope.closeEditor();
    });
  };

  $scope.undeleteTagInEdit = function() {
    if ($scope.tag.trans.tagType === 'context'){
      $scope.undeleteContext($scope.tag);
    }else if ($scope.tag.trans.tagType === 'keyword'){
      $scope.undeleteKeyword($scope.tag);
    }
  };

  $scope.isTagEdited = function() {
    if ($scope.tagTitlebarHasText()) {
      return TagsService.isTagEdited($scope.tag);
    }
  };

  $scope.endTagEdit = function() {
    $scope.closeEditor();
  };

  function tagEditorAboutToClose() {
    if (angular.isFunction($scope.unregisterEditorAboutToCloseCallback))
      $scope.unregisterEditorAboutToCloseCallback('TagEditorController');

    if ($scope.isTagEdited() && !$scope.tag.trans.deleted){
      saveTagInEdit();
    } else if (deleting){
      $scope.swipeToContextsAndReset();
      deleting = false;
    } else {
      TagsService.resetTag($scope.tag);
    }
  }

  // TITLEBAR

  $scope.tagTitlebarHasText = function() {
    return $scope.tag.trans.title && $scope.tag.trans.title.length !== 0;
  };

  $scope.tagTitlebarTextKeyDown = function (keydownEvent) {
    $scope.handleBasicTitlebarKeydown(keydownEvent, $scope.item);
    // Return
    if (event.keyCode === 13){
      if($scope.tagTitlebarHasText()) {
        // Enter in editor saves, no line breaks allowed
        $scope.closeEditor();
        saveTagInEdit();
      }
      event.preventDefault();
      event.stopPropagation();
    }
  };

  $scope.getPrefix = function(tag) {
    if (tag.trans.title && tag.trans.title.length) {
      if (tag.trans.tagType === 'context')
        return '\u0040';  // @ (commercial at)
      else if (tag.trans.tagType === 'keyword')
        return '\u0023';  // # (number sign)
    }
  }
}

TagEditorController['$inject'] = ['$q', '$rootScope', '$scope', 'TagsService', 'UISessionService'];
angular.module('em.main').controller('TagEditorController', TagEditorController);
