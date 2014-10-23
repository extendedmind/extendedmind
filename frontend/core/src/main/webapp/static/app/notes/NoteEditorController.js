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

 function NoteEditorController($scope) {

  // INITIALIZING

  if (angular.isFunction($scope.registerFeatureEditorAboutToCloseCallback))
    $scope.registerFeatureEditorAboutToCloseCallback(noteEditorAboutToClose, 'NoteEditorController');

  // We expect there to be a $scope.task via ng-init

  $scope.titlebar.text = $scope.note.title;

  // SAVING, DELETING

  function saveNoteInEdit() {
    // TODO: Keywords
    $scope.note.title = $scope.titlebar.text;
    $scope.deferEdit().then(function() {
      $scope.saveNote($scope.note);
    });
  };

  $scope.deleteNoteInEdit = function() {
    $scope.closeNoteEditor();
    $scope.deferEdit().then(function() {
      $scope.deleteNote($scope.note);
    });
  };

  $scope.endNoteEdit = function() {
    $scope.closeNoteEditor();
  }

  function noteEditorAboutToClose() {
    if ($scope.titlebarHasText() && !$scope.note.deleted) saveNoteInEdit();
  }

  $scope.clickFavorite = function() {
    if (!$scope.note.transientProperties.favorited){
      $scope.favoriteNote($scope.note);
    }else{
      $scope.unfavoriteNote($scope.note);
    }
  };

  // MODES

  $scope.noteTitleFocused = function(){
    if ($scope.isFirstSlide()){
      $scope.mode = 'fullScreen';
    }
  }

  $scope.noteContentFocused = function(){
    if ($scope.isFirstSlide()){
      $scope.mode = 'fullScreen';
      $scope.hideNoteTitle = true;
    }
  }

  $scope.toggleNoteEditMode = function(){
    if ($scope.mode === 'fullScreen'){
      $scope.mode = undefined;
    }else if ($scope.mode === 'view'){
      $scope.mode = undefined;
    }else {
      $scope.mode = 'view';
    }
    $scope.hideNoteTitle = false;
  }

  // CONTENT

  var noteContentFocusCallback;
  $scope.registerNoteContentInputCallbacks = function(focus){
    noteContentFocusCallback = focus;
  }

  // TITLEBAR

  $scope.noteTitlebarTextKeyDown = function (keydownEvent) {
    $scope.handleBasicTitlebarKeydown(keydownEvent, $scope.note);
    // Return
    if (event.keyCode === 13 && $scope.titlebarHasText()) {
      // TODO: Move focus to content field on enter!
      noteContentFocusCallback();
      event.preventDefault();
      event.stopPropagation();
    }
  };

  // KEYWORDS

  $scope.newKeyword = {};

  $scope.showKeywords = function showKeywords() {
    return $scope.newKeyword && $scope.newKeyword.title && $scope.newKeyword.title.length !== 0;
  };
  $scope.isNewKeyword = function isNewKeyword(keyword) {
    return keyword.title === $scope.newKeyword.title;
  };
  $scope.clearKeyword = function clearKeyword() {
    $scope.newKeyword = {
      tagType: 'keyword'
    };
  };

  function addKeywordToNote(keyword) {
    if (!$scope.note.transientProperties) $scope.note.transientProperties = {};
    if (!$scope.note.transientProperties.keywords) $scope.note.transientProperties.keywords = [];
    $scope.note.transientProperties.keywords.push(keyword.uuid);
  }

  $scope.selectExistingKeyword = function selectExistingKeyword(keyword) {
    addKeywordToNote(keyword);
    $scope.clearKeyword();
  };

  $scope.selectNewKeyword = function selectNewKeyword() {
    function keywordExists(keyword) {
      if (keyword.title === $scope.newKeyword.title) {
        $scope.newKeyword = keyword;
        return true;
      }
      return false;
    }
    var isExistingKeyword = $scope.keywords.some(keywordExists);
    if (!isExistingKeyword) {
      $scope.newKeyword.uuid = UUIDService.generateFakeUUID();
      $scope.newKeyword.isNew = true;
      $scope.keywords.push($scope.newKeyword);
    }
    addKeywordToNote($scope.newKeyword);
    $scope.clearKeyword();
  };

  $scope.unSelectKeyword = function unSelectKeyword(keyword) {
    $scope.note.transientProperties.keywords.splice($scope.note.transientProperties.keywords.indexOf(keyword.uuid), 1);
    if (keyword.isNew) $scope.keywords.splice($scope.keywords.indexOf(keyword), 1);
  };

  $scope.isSelectedKeyword = function isSelectedKeyword() {
    function isNoteKeyword(keyword) {
      return keyword.title === $scope.newKeyword.title &&
      $scope.note.transientProperties.keywords.indexOf(keyword.uuid) !== -1;
    }
    if ($scope.noteHasKeywords()) return $scope.keywords.some(isNoteKeyword);
  };

}

NoteEditorController['$inject'] = ['$scope'];
angular.module('em.main').controller('NoteEditorController', NoteEditorController);
