'use strict';

function NotesController($filter, $q, $scope, UISessionService, UUIDService, NotesService, ListsService, TagsService, AnalyticsService, SwiperService) {
  $scope.newKeyword = {};

  $scope.initializeOmnibarNote = function initializeOmnibarNote(omnibarText) {
    $scope.note = omnibarText ? omnibarText : {};
  };

  $scope.saveNote = function() {

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
        $scope.note.relationships.tags.forEach(getNoteKeyword);
        return filteredKeywords;
      }

      // Keyword is added with fake UUID and isNew key, which are removed before save.
      // Keyword is associated with UUID so it needs to be removed from lists also.
      function removeFromMemoryAndReturnSavePromise(keyword) {
        $scope.keywords.splice($scope.keywords.indexOf(keyword), 1);
        $scope.note.relationships.tags.splice($scope.note.relationships.tags.indexOf(keyword.uuid), 1);
        delete keyword.uuid;
        delete keyword.isNew;

        return TagsService.saveTag(keyword, UISessionService.getActiveUUID());
      }

      // Re-add keywords to note with correct UUIDs.
      function addKeywordsToNote(keywords) {
        keywords.forEach(function(keyword) {
          $scope.note.relationships.tags.push(keyword.uuid);
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

    if ($scope.note.uuid) {
      AnalyticsService.do('saveNote', 'new');
    } else {
      AnalyticsService.do('saveNote', 'existing');
    }

    return saveKeywords().then(function() {
      return NotesService.saveNote($scope.note, UISessionService.getActiveUUID());
    });
  };

  $scope.noteQuickEditDone = function(note) {
    AnalyticsService.do('noteQuickEditDone');
    NotesService.saveNote(note, UISessionService.getActiveUUID());
  };

  $scope.editNoteFields = function(note) {
    AnalyticsService.do('editNoteFields');
    NotesService.saveNote(note, UISessionService.getActiveUUID());
  };

  $scope.editNote = function(note) {
    $scope.editItemInOmnibar(note, 'note');
  };

  $scope.deleteNote = function(note) {
    AnalyticsService.do('deleteNote');
    NotesService.deleteNote(note, UISessionService.getActiveUUID());
  };

  $scope.addNote = function(newNote) {
    var newNoteToSave = {title: undefined};
    if (newNote.relationships){
      if (newNote.relationships.list){
        newNoteToSave.relationships = {
          list: newNote.relationships.list
        };
      }
      if(newNote.relationships.tags && newNote.relationships.tags.length) {
        if (!newNoteToSave.relationships) newNoteToSave.relationships = {};
        newNoteToSave.relationships.tags = newNote.relationships.tags.slice(0);
      }
    }
    delete newNote.title;

    AnalyticsService.do('addNote');
    $scope.addItemInOmnibar(newNoteToSave, 'note');
  };

  $scope.getNoteContentTeaser = function(note) {
    if (note.content){
      var maximumTeaserLength = 80;
      if (note.content.length <= maximumTeaserLength){
        return note.content;
      } else{
        return note.content.substring(0, maximumTeaserLength) + '...';
      }
    }
  };

  $scope.noteKeywords = function noteKeywords() {
    var filteredKeywords = [];

    function getNoteKeyword(uuid) {
      $scope.keywords.some(function(keyword) {
        if (keyword.uuid === uuid) {
          filteredKeywords.unshift(keyword);
          return true;
        }
        return false;
      });
    }
    $scope.note.relationships.tags.forEach(getNoteKeyword);
    return filteredKeywords;
  };

  $scope.otherThanNoteKeywords = function otherThanNoteKeywords() {
    function isOtherThanNoteKeyword(element) {
      return $scope.note.relationships.tags.indexOf(element.uuid) === -1;
    }
    if ($scope.noteHasKeywords()) {
      return $scope.keywords.filter(isOtherThanNoteKeyword);
    }
    return $scope.keywords;
  };

  function addKeywordToNote(keyword) {
    if (!$scope.note.relationships) $scope.note.relationships = {};
    if (!$scope.note.relationships.tags) $scope.note.relationships.tags = [];
    $scope.note.relationships.tags.push(keyword.uuid);
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
    $scope.note.relationships.tags.splice($scope.note.relationships.tags.indexOf(keyword.uuid), 1);
    if (keyword.isNew) {
      $scope.keywords.splice($scope.keywords.indexOf(keyword), 1);
    }
  };

  $scope.showKeywords = function showKeywords() {
    return $scope.newKeyword && $scope.newKeyword.title && $scope.newKeyword.title.length !== 0;
  };

  $scope.noteHasKeywords = function noteHasKeywords() {
    return $scope.note.relationships && $scope.note.relationships.tags && $scope.note.relationships.tags.length;
  };

  $scope.isNewKeyword = function isNewKeyword(keyword) {
    return keyword.title === $scope.newKeyword.title;
  };

  $scope.isSelectedKeyword = function isSelectedKeyword() {
    function isNoteKeyword(keyword) {
      return keyword.title === $scope.newKeyword.title && $scope.note.relationships.tags.indexOf(keyword.uuid) !== -1;
    }
    if ($scope.noteHasKeywords()) {
      return $scope.keywords.some(isNoteKeyword);
    }
  };

  $scope.clearKeyword = function clearKeyword() {
    $scope.newKeyword = {
      tagType: 'keyword'
    };
  };


  // INFINITE SCROLL
  $scope.recentNotesLimit = 0;
  function setAllNotesLimit(allNotesSize){
    if (allNotesSize < 25){
      $scope.recentNotesLimit = allNotesSize;
    }
  }
  $scope.registerAllNotesUpdatedCallback(setAllNotesLimit, 'NotesController');

  $scope.getRecentNotesLimit = function(){
    return $scope.recentNotesLimit;
  };

  $scope.addMoreRecent = function(){
    if ($scope.recentNotesLimit !== $scope.allNotes.length){
      // There is still more to add, add in batches of 25
      if ($scope.recentNotesLimit + 25 < $scope.allNotes.length){
        $scope.recentNotesLimit += 25;
      }else{
        $scope.recentNotesLimit = $scope.allNotes.length;
      }
    }
  };

  // Navigation

  $scope.keyword = undefined;
  $scope.showKeywordDetails = function(selectedKeyword) {
    $scope.keyword = selectedKeyword;
    $scope.newNote = {relationships: {tags: [$scope.keyword.uuid]}};
    SwiperService.swipeTo('notes/details');
  };
  $scope.showNoKeywordDetails = function() {
    $scope.keyword = undefined;
    $scope.newNote = {};
    SwiperService.swipeTo('notes/details');
  };

  $scope.deleteKeywordAndShowKeywords = function(keyword) {
    SwiperService.swipeTo('notes/keywords');
    $scope.deleteKeyword(keyword);
    $scope.keyword = undefined;
  };

}

NotesController['$inject'] = [
'$filter', '$q', '$scope',
'UISessionService', 'UUIDService', 'NotesService', 'ListsService', 'TagsService',
'AnalyticsService', 'SwiperService'];
angular.module('em.app').controller('NotesController', NotesController);
