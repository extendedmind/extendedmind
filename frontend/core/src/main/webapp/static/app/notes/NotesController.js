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

 function NotesController($filter, $q, $rootScope, $scope, $timeout,
                          AnalyticsService, ListsService, NotesService, TagsService, SwiperService,
                          UISessionService) {

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

  // SAVING

  $scope.saveNote = function saveNote(note) {
    if (note.uuid) AnalyticsService.do('saveNote');
    else AnalyticsService.do('addNote');

    if (!note.uuid) var newNote = true;

    return saveKeywords(note).then(function() {
      return NotesService.saveNote(note, UISessionService.getActiveUUID()).then(function(note){
        if (newNote && note.transientProperties && note.transientProperties.favorited){
          return $scope.favoriteNote(note);
        }
      });
    });
  };

  // (UN)DELETING

  $scope.deleteNote = function deleteNote(note) {
    if (note.uuid){

      UISessionService.pushDelayedNotification({
        type: 'deleted',
        itemType: 'note', // NOTE: Same as note.transientProperties.itemType
        item: note,
        undoFn: $scope.undeleteNote
      });

      $timeout(function() {
        UISessionService.activateDelayedNotifications();
      }, $rootScope.LIST_ITEM_LEAVE_ANIMATION_SPEED);

      AnalyticsService.do('deleteNote');
      NotesService.deleteNote(note, UISessionService.getActiveUUID());
    }
  };

  $scope.undeleteNote = function(note) {
    if (note.uuid){
      AnalyticsService.do('undeleteNote');
      NotesService.undeleteNote(note, UISessionService.getActiveUUID());
    }
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

  /*
  * Favorite note.
  */
  $scope.favoriteNote = function(note) {
    if (note.favorited) return;

    // Don't try to favorite a note that hasn't been saved, saveNote will call this again
    // after the note has a uuid
    if (!note.uuid){
      if (!note.transientProperties) note.transientProperties = {};
      note.transientProperties.favorited = true;
      return;
    }

    // Vibrate
    if (navigator.vibrate && !$scope.isVibrationDisabled())
      navigator.vibrate(200);

    AnalyticsService.do('favoriteNote');

    return NotesService.favoriteNote(note, UISessionService.getActiveUUID());
  };

  /*
  * Unfavorite note.
  */
  $scope.unfavoriteNote = function(note) {
    if (!note.favorited) return;

    // Don't try to unfavorite a note that hasn't been saved
    if (!note.uuid){
      if (!note.transientProperties) note.transientProperties = {};
      note.transientProperties.favorited = false;
      return;
    }

    // Vibrate
    if (navigator.vibrate && !$scope.isVibrationDisabled())
      navigator.vibrate(200);

    AnalyticsService.do('unfavoriteNote');

    return NotesService.unfavoriteNote(note, UISessionService.getActiveUUID());
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
'$filter', '$q', '$rootScope', '$scope', '$timeout',
'AnalyticsService', 'ListsService', 'NotesService', 'TagsService', 'SwiperService', 'UISessionService'
];
angular.module('em.notes').controller('NotesController', NotesController);
