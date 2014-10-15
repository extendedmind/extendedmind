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

  $scope.titlebar.text = $scope.note.title;

  // SAVING, DELETING

  $scope.saveNoteInEdit = function() {
    $scope.saveNewListToExtendedItem($scope.note, $scope.newList, function(note){

      // TODO: Keywords

      note.title = $scope.titlebar.text;
      $scope.deferEdit().then(function() {
        $scope.saveNote(note);
      });
    });
  };

  $scope.deleteNoteInEdit = function() {
    $scope.closeNoteEditor();
    $scope.deleteNote($scope.note);
  };

  $scope.endNoteEdit = function() {
    $scope.closeNoteEditor();
    if ($scope.titlebarHasText()) $scope.saveNoteInEdit();
  }

  // TITLEBAR

  $scope.noteTitlebarTextKeyDown = function (keydownEvent) {
    $scope.handleBasicTitlebarKeydown(keydownEvent, $scope.note);
    // Return
    if (event.keyCode === 13 && !$rootScope.loading && $scope.titlebarHasText()) {
      // TODO: Move focus to content field on enter!
      //
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
  $scope.noteHasKeywords = function noteHasKeywords(note) {
    return note.transientProperties && note.transientProperties.keywords;
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