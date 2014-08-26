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

 function NotesController($filter, $q, $scope, AnalyticsService, ListsService, NotesService, TagsService, SwiperService, UISessionService, UUIDService) {
  $scope.newKeyword = {};

  $scope.initializeOmnibarNote = function initializeOmnibarNote(omnibarText) {
    $scope.note = omnibarText ? omnibarText : {};
  };

  $scope.saveNote = function saveNote() {

    // Save keywords first because saveTag requires network connection.
    function saveKeywords() {

      // Return keywords, that has beend added during note edit
      function getNewKeywords() {
        var filteredKeywords = [];

        function getNoteKeyword(uuid) {
          $scope.keywords.some(function(keyword) {
            if (keyword.uuid === uuid && keyword.isNew) {
              filteredKeywords.push(keyword);
              return true;
            }
            return false;
          });
        }
        $scope.note.transientProperties.keywords.forEach(getNoteKeyword);
        return filteredKeywords;
      }

      // Keyword is added with fake UUID and isNew key, which are removed before save.
      // Keyword is associated with UUID so it needs to be removed from lists also.
      function removeFromMemoryAndReturnSavePromise(keyword) {
        $scope.keywords.splice($scope.keywords.indexOf(keyword), 1);
        $scope.note.transientProperties.keywords.splice($scope.note.transientProperties.keywords.indexOf(keyword.uuid), 1);
        delete keyword.uuid;
        delete keyword.isNew;

        return TagsService.saveTag(keyword, UISessionService.getActiveUUID());
      }

      // Re-add keywords to note with correct UUIDs.
      function addKeywordsToNote(keywords) {
        keywords.forEach(function(keyword) {
          $scope.note.transientProperties.keywords.push(keyword.uuid);
        });
      }

      var deferredSaveKeywordsSave = $q.defer();
      var saveNewKeywordPromises = [];

      if ($scope.noteHasKeywords()) {
        // http://stackoverflow.com/a/21315112
        saveNewKeywordPromises = getNewKeywords().map(removeFromMemoryAndReturnSavePromise);

        $q.all(saveNewKeywordPromises)
        .then(addKeywordsToNote)
        .then(deferredSaveKeywordsSave.resolve);

      } else {
        deferredSaveKeywordsSave.resolve();
      }
      return deferredSaveKeywordsSave.promise;
    }

    if ($scope.note.uuid) AnalyticsService.do('saveNote', 'existing');
    else AnalyticsService.do('saveNote', 'new');

    return saveKeywords().then(function() {
      return NotesService.saveNote($scope.note, UISessionService.getActiveUUID());
    });
  };

  $scope.noteQuickEditDone = function noteQuickEditDone(note) {
    AnalyticsService.do('noteQuickEditDone');
    $scope.saveUnsavedListAndLinkToItem(note).then(function() {
      NotesService.saveNote(note, UISessionService.getActiveUUID());
    });
  };

  $scope.editNoteFields = function editNoteFields(note) {
    AnalyticsService.do('editNoteFields');
    NotesService.saveNote(note, UISessionService.getActiveUUID());
  };

  $scope.editNote = function editNote(note) {
    $scope.editItemInOmnibar(note, 'note');
  };

  $scope.deleteNote = function deleteNote(note) {
    AnalyticsService.do('deleteNote');
    NotesService.deleteNote(note, UISessionService.getActiveUUID());
  };

  $scope.addNote = function addNote(newNote) {
    var newNoteToSave = {title: undefined};

    if (newNote.transientProperties) {
      newNoteToSave.transientProperties = {};
      if (newNote.transientProperties.list) newNoteToSave.transientProperties.list = newNote.transientProperties.list;
      if (newNote.transientProperties.keywords)
        newNoteToSave.transientProperties.keywords = newNote.transientProperties.keywords.slice(0);
    }
    delete newNote.title;

    AnalyticsService.do('addNote');
    $scope.addItemInOmnibar(newNoteToSave, 'note');
  };

  $scope.getNoteContentTeaser = function getNoteContentTeaser(note) {
    if (note.content) {
      var maximumTeaserLength = 80;
      if (note.content.length <= maximumTeaserLength) {
        return note.content;
      } else {
        return note.content.substring(0, maximumTeaserLength) + '...';
      }
    }
  };

  $scope.showKeywords = function showKeywords() {
    return $scope.newKeyword && $scope.newKeyword.title && $scope.newKeyword.title.length !== 0;
  };
  $scope.isNewKeyword = function isNewKeyword(keyword) {
    return keyword.title === $scope.newKeyword.title;
  };
  $scope.noteHasKeywords = function noteHasKeywords() {
    return $scope.note.transientProperties && $scope.note.transientProperties.keywords;
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


  // INFINITE SCROLL
  $scope.recentNotesLimit = 0;
  function setAllNotesLimit(allNotesSize) {
    if (allNotesSize < 25) {
      $scope.recentNotesLimit = allNotesSize;
    }
  }
  $scope.registerAllNotesUpdatedCallback(setAllNotesLimit, 'NotesController');

  $scope.getRecentNotesLimit = function getRecentNotesLimit() {
    return $scope.recentNotesLimit;
  };

  $scope.addMoreRecent = function addMoreRecent() {
    if ($scope.recentNotesLimit !== $scope.allNotes.length) {
      // There is still more to add, add in batches of 25
      if ($scope.recentNotesLimit + 25 < $scope.allNotes.length) {
        $scope.recentNotesLimit += 25;
      } else {
        $scope.recentNotesLimit = $scope.allNotes.length;
      }
    }
  };

  // Navigation

  $scope.keyword = undefined;
  $scope.showKeywordDetails = function showKeywordDetails(selectedKeyword) {
    $scope.keyword = selectedKeyword;
    $scope.newNote = {transientProperties: {keywords: [$scope.keyword.uuid]}};
    SwiperService.swipeTo('notes/details');
  };
  $scope.showNoKeywordDetails = function showNoKeywordDetails() {
    $scope.keyword = undefined;
    $scope.newNote = {};
    SwiperService.swipeTo('notes/details');
  };
  $scope.showNoListNotesDetails = function showNoListNotesDetails() {
    $scope.keyword = null;
    $scope.newNote = {};
    SwiperService.swipeTo('notes/details');
  };

  $scope.deleteKeywordAndShowKeywords = function deleteKeywordAndShowKeywords(keyword) {
    SwiperService.swipeTo('notes/keywords');
    $scope.deleteKeyword(keyword);
    $scope.keyword = undefined;
  };

}

NotesController['$inject'] = [
'$filter', '$q', '$scope',
'AnalyticsService', 'ListsService', 'NotesService', 'TagsService',
'SwiperService', 'UISessionService', 'UUIDService'];
angular.module('em.notes').controller('NotesController', NotesController);
