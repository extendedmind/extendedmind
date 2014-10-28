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

 function NoteEditorController($scope, UUIDService) {

  // INITIALIZING

  if (angular.isFunction($scope.registerFeatureEditorAboutToCloseCallback))
    $scope.registerFeatureEditorAboutToCloseCallback(noteEditorAboutToClose, 'NoteEditorController');

  // We expect there to be a $scope.task via ng-init

  $scope.titlebar.text = $scope.note.title;

  // SAVING, DELETING

  function saveNoteInEdit() {
    if ($scope.onboardingInProgress) $scope.turnOffListOnboardingLock('notes');

    // TODO: Keywords
    $scope.note.title = $scope.titlebar.text;
    $scope.deferEdit().then(function() {
      $scope.saveNote($scope.note);
    });
  }

  $scope.deleteNoteInEdit = function() {
    // Unregister about to close callback, because delete is run after editor is closed
    // and about to close callback would try to save item in between close and delete.
    if (angular.isFunction($scope.unregisterEditorAboutToCloseCallback))
      $scope.unregisterEditorAboutToCloseCallback();

    $scope.closeNoteEditor();
    $scope.deferEdit().then(function() {
      $scope.deleteNote($scope.note);
    });
  };

  $scope.endNoteEdit = function() {
    $scope.closeNoteEditor();
  };

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
  };

  $scope.noteContentFocused = function(){
    if ($scope.isFirstSlide()){
      $scope.mode = 'fullScreen';
      $scope.hideNoteTitle = true;
    }
  };

  $scope.toggleNoteEditMode = function(){
    if ($scope.mode === 'fullScreen'){
      $scope.mode = undefined;
    }else if ($scope.mode === 'view'){
      $scope.mode = undefined;
    }else {
      $scope.mode = 'view';
    }
    $scope.hideNoteTitle = false;
  };

  // CONTENT

  var noteContentFocusCallback;
  $scope.registerNoteContentInputCallbacks = function(focus){
    noteContentFocusCallback = focus;
  };

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

  $scope.addKeywordToNote = function(note, keyword) {
    if (!$scope.note.transientProperties) $scope.note.transientProperties = {};
    if (!$scope.note.transientProperties.keywords) $scope.note.transientProperties.keywords = [];
    $scope.note.transientProperties.keywords.push(keyword.uuid);
    $scope.clearKeyword();
  };

  $scope.addNewKeywordToNote = function(note, newKeyword) {
    var keywordToAdd = $scope.keywords.findFirstObjectByKeyValue('title', newKeyword.title);

    if (!keywordToAdd) {
      // Make new keyword with fake UUID and push it to keywords array.
      keywordToAdd = newKeyword;
      keywordToAdd.uuid = UUIDService.generateFakeUUID();
      $scope.keywords.push(keywordToAdd);
    }

    $scope.addKeywordToNote(note, keywordToAdd);
  };

  $scope.removeKeywordFromNote = function(note, keyword) {
    note.transientProperties.keywords.splice(note.transientProperties.keywords.indexOf(keyword.uuid), 1);

    var transientKeyword = UUIDService.isFakeUUID(keyword.uuid);
    if (transientKeyword) {
      // Remove new keyword.
      $scope.keywords.splice($scope.keywords.indexOf(keyword), 1);
    }
  };

}

NoteEditorController['$inject'] = ['$scope', 'UUIDService'];
angular.module('em.main').controller('NoteEditorController', NoteEditorController);
