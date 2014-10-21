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

 function NotesController($filter, $q, $scope, AnalyticsService, ListsService, NotesService, TagsService,
                          SwiperService, UISessionService) {

  $scope.noteHasKeywords = function noteHasKeywords(note) {
    return note.transientProperties && note.transientProperties.keywords;
  };

  // Return keywords, that has beend added during note edit
  function getNewKeywords(keywords) {
    var newKeywords = [];
    for (var i=0; i<keywords.length; i++){
      var keyword = keywords[i];
      if (keyword.isNew){
        newKeywords.push(keyword);
      }
    }
    return newKeywords;
  }

  // Keyword is added with fake UUID and isNew key, which are removed before save.
  // Keyword is associated with UUID so it needs to be removed from lists also.
  function removeFromMemoryAndReturnSavePromise(keyword, note) {
    note.transientProperties.keywords.splice(note.transientProperties.keywords.indexOf(keyword.uuid), 1);
    delete keyword.uuid;
    delete keyword.isNew;

    return TagsService.saveTag(keyword, UISessionService.getActiveUUID());
  }

  // Re-add keywords to note with correct UUIDs.
  function addKeywordsToNote(keywords, note) {
    keywords.forEach(function(keyword) {
      note.transientProperties.keywords.push(keyword.uuid);
    });
  }

  // Save keywords first because saveTag requires network connection.
  function saveKeywords(note) {
    var deferredSaveKeywordsSave = $q.defer();

    if ($scope.noteHasKeywords(note))
     {
      // http://stackoverflow.com/a/21315112
      var newKeywords = getNewKeywords(note.transientProperties.keywords);
      var saveNewKeywordPromises = newKeywords.map(function(newKeyword){
        return removeFromMemoryAndReturnSavePromise(newKeyword, note);
      });

      $q.all(saveNewKeywordPromises).then(function(){
        addKeywordsToNote(newKeywords, note);
        deferredSaveKeywordsSave.resolve();
      });

    } else {
      deferredSaveKeywordsSave.resolve();
    }
    return deferredSaveKeywordsSave.promise;
  }

  $scope.saveNote = function saveNote(note) {
    if (note.uuid) AnalyticsService.do('saveNote');
    else AnalyticsService.do('addNote');

    return saveKeywords(note).then(function() {
      return NotesService.saveNote(note, UISessionService.getActiveUUID());
    });
  };

  $scope.deleteNote = function deleteNote(note) {
    AnalyticsService.do('deleteNote');
    NotesService.deleteNote(note, UISessionService.getActiveUUID());
  };

  $scope.getNoteContentTeaser = function getNoteContentTeaser(note) {
    if (note.content) {
      var maximumTeaserLength = 300;
      if (note.content.length <= maximumTeaserLength) {
        return note.content;
      } else {
        return note.content.substring(0, maximumTeaserLength);
      }
    }
  };

  $scope.openNoteEditor = function(note){
    return $scope.openEditor('note', note, 'fullScreen');
  };

  $scope.openNoteEditorView = function(note){
    // TODO: Use mode 'view' here when view mode is implemented!
    return $scope.openEditor('note', note, 'fullScreen');
  };

  $scope.closeNoteEditor = function() {
    $scope.closeEditor();
  };

}

NotesController['$inject'] = [
'$filter', '$q', '$scope',
'AnalyticsService', 'ListsService', 'NotesService', 'TagsService',
'SwiperService', 'UISessionService'];
angular.module('em.notes').controller('NotesController', NotesController);
