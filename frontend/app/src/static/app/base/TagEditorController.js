/* Copyright 2013-2015 Extended Mind Technologies Oy
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

  var parentPickerOpen;

  // VISIBILITY

  $scope.showTagEditorComponent = function(componentName) {
    switch (componentName) {

      case 'collapsible':
      return $scope.collapsibleOpen && !$scope.isPropertyInDedicatedEdit();
      break;

      case 'lessMore':
      return $scope.tag.created && !$scope.isPropertyInDedicatedEdit();
      break;

      case 'parentPicker':
      return parentPickerOpen;
      break;
    }
  };

  $scope.showTagProperty = function(propertyName) {
    switch (propertyName) {
      case 'parent':
      return !$scope.tagIsParent($scope.tag) && !$scope.isPropertyInDedicatedEdit();
    }
  };

  $scope.showTagAction = function(actionName, tag){
    switch (actionName){
      case 'favoriteContext':
      return $scope.tag.trans.tagType === 'context' &&
             $scope.showEditorProperty('title') &&
             $scope.isPersonalData();
    }
  };

  $scope.collapsibleOpen = false;
  $scope.toggleCollapsible = function() {
    $scope.collapsibleOpen = !$scope.collapsibleOpen;
  };

  // PARENT PICKER
  $scope.openParentPicker = function() {
    parentPickerOpen = true;
  };
  $scope.closeParentPicker = function() {
    parentPickerOpen = false;
  };
  $scope.closeParentPickerAndSetParentToTag = function(tag, parentTag) {

    function doCloseAndSave() {
      $scope.closeParentPicker();
      tag.trans.parent = parentTag;
    }

    if (!parentTag.trans.uuid) {
      // Parent tag is new, save it first. Close parent picker on error saving new parent.
      var saveTag = parentTag.trans.tagType === 'keyword' ? $scope.saveKeyword : $scope.saveContext;
      saveTag(parentTag).then(doCloseAndSave, $scope.closeParentPicker);
    }
    else {
      doCloseAndSave();
    }
  };

  $scope.closeParentPickerAndClearParentFromTag = function(tag, parentTag) {
    $scope.closeParentPicker();
    if (tag.trans.parent === parentTag){
      tag.trans.parent = undefined;
    }
  };

  $scope.tagIsParent = function(tag) {
    var tags = $scope.getTagsArray('all');
    for (var i = 0; i < tags.length; i++) {
      if (tags[i].trans.parent && tags[i].trans.parent.trans.uuid === tag.trans.uuid) {
        return true;
      }
    }
    return false;
  };

  $scope.getParentTagArray = function() {
    if ($scope.tag.trans.tagType === 'context'){
      return $scope.getTagsArray('contextsParentless', {owner: $scope.tag.trans.owner})
    }else if ($scope.tag.trans.tagType === 'keyword'){
      return $scope.getTagsArray('keywordsParentless', {owner: $scope.tag.trans.owner})
    }
  };

  $scope.getNewParentTag = function() {
    if ($scope.tag.trans.tagType === 'context'){
      return TagsService.getNewTag({tagType: 'context'}, $scope.tag.trans.owner);
    }else if ($scope.tag.trans.tagType === 'keyword'){
      return TagsService.getNewTag({tagType: 'keyword'}, $scope.tag.trans.owner);
    }
  };

  $scope.getTagParentText = function(tag) {
    if (!tag.trans.parent || tag.trans.parent.trans.deleted){
      return 'select parent ' + tag.trans.tagType + '\u2026';
    }else if (tag.trans.tagType === 'keyword'){
      return '#' + tag.trans.parent.trans.title;
    }else if (tag.trans.tagType === 'context'){
      return '@' + tag.trans.parent.trans.title;
    }
  };

  function isSubEditorOpenInTagEditor(){
    return parentPickerOpen ;
  }
  $scope.registerIsSubEditorOpenCondition(isSubEditorOpenInTagEditor);

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

  // TITLE HANDLING

  var gotoTitleCallback;
  $scope.gotoTagTitle = function() {
    if (typeof gotoTitleCallback === 'function') gotoTitleCallback();
  };
  $scope.registerGotoTagTitleCallback = function(callback) {
    gotoTitleCallback = callback;
  };

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


  $scope.getTagPropertyNameInEdit = function() {
    var propertyName = $scope.getPropertyNameInEdit();
    if (!propertyName) {
      if (parentPickerOpen) {
        propertyName = 'parent';
      }
    }
    return propertyName;
  };

  // FAVORITING

  $scope.clickFavorite = function() {
    if (!$scope.isFavoriteContext($scope.tag)){
      $scope.favoriteContext($scope.tag);
    }else{
      $scope.unfavoriteContext($scope.tag);
    }
  };
}

TagEditorController['$inject'] = ['$q', '$rootScope', '$scope', 'TagsService', 'UISessionService'];
angular.module('em.main').controller('TagEditorController', TagEditorController);
