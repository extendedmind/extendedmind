'use strict';

function NotesController($location, $rootScope, $routeParams, $scope, UISessionService, NotesService, ListsService, AnalyticsService) {

  if (!$scope.note) {
    // edit note or new note dialog
    if ($location.path().indexOf('/edit/' != -1) || $location.path().indexOf('/new' != -1)) {
      // edit note
      if ($routeParams.uuid) {
        $scope.note = NotesService.getNoteByUUID($routeParams.uuid, UISessionService.getActiveUUID());
      }
      // new note
      else {
        $scope.note = {
          relationships: {
            tags: []
          }
        };
        if ($rootScope.omnibarNote) {
          $scope.note.title = $rootScope.omnibarNote.title;
          delete $rootScope.omnibarNote;
        }
        if ($routeParams.parentUUID){
          $scope.note.relationships.list = $routeParams.parentUUID;
        }
      }
    }
  }

  $scope.saveNote = function(note) {
    if (note.uuid){
      AnalyticsService.do('saveNote', 'new');
    } else {
      AnalyticsService.do('saveNote', 'existing');
    }
    NotesService.saveNote(note, UISessionService.getActiveUUID());
    if (!$scope.isFeatureActive('notes')) {
      $scope.setActiveFeature('notes');
    }
    $location.path(UISessionService.getOwnerPrefix());
  };

  $scope.noteQuickEditDone = function(note) {
    AnalyticsService.do('noteQuickEditDone');
    NotesService.saveNote(note, UISessionService.getActiveUUID());
    $scope.close(note, true);
  };

  $scope.cancelEdit = function() {
    $scope.gotoPreviousPage();
  };

  $scope.addNew = function() {
    AnalyticsService.visit('newNote');
    $location.path($scope.ownerPrefix + '/notes/new');
  };

  $scope.editNoteTitle = function(note) {
    AnalyticsService.do('editNoteTitle');
    NotesService.saveNote(note, UISessionService.getActiveUUID());
  };

  $scope.editNote = function(note) {
    $location.path(UISessionService.getOwnerPrefix() + '/notes/edit/' + note.uuid);
  };

  $scope.deleteNote = function(note) {
    AnalyticsService.do('deleteNote');
    NotesService.deleteNote(note, UISessionService.getActiveUUID());
  };

  $scope.addNote = function(newNote) {
    if (!newNote.title  || newNote.title.length === 0) return false;
    var newNoteToSave = {title: newNote.title};
    if (newNote.relationships && newNote.relationships.list){
      newNoteToSave.relationships = {
        list: newNote.relationships.list
      };
    }
    delete newNote.title;

    AnalyticsService.do('addNote');
    NotesService.saveNote(newNoteToSave, UISessionService.getActiveUUID());
  };

  $scope.newList = {title: undefined};
  $scope.addList = function(newList) {
    ListsService.saveList(newList, UISessionService.getActiveUUID()).then(function(/*list*/) {
      // TODO
    });
    $scope.newList = {title: undefined};
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
}

NotesController['$inject'] = [
'$location', '$rootScope', '$routeParams', '$scope',
'UISessionService', 'NotesService', 'ListsService',
'AnalyticsService'];
angular.module('em.app').controller('NotesController', NotesController);
