'use strict';

function NotesController($location, $scope, $timeout, $routeParams, UserSessionService, NotesService, ListsService, SwiperService, AnalyticsService) {

  if (!$scope.note){
    if ($location.path().indexOf('/edit/' != -1) || $location.path().indexOf('/new' != -1)){
      if ($routeParams.uuid) {
        $scope.note = NotesService.getNoteByUUID($routeParams.uuid, UserSessionService.getActiveUUID());
      }else {
        $scope.note = {
          relationships: {
            tags: []
          }
        };
        if ($routeParams.parentUUID){
          $scope.note.relationships.list = $routeParams.parentUUID;
        }
      }
    }
  }

  $scope.saveNote = function(note) {
    if (note.uuid){
      AnalyticsService.do("saveNote", "new");
    }else{
      AnalyticsService.do("saveNote", "existing");
    }
    NotesService.saveNote(note, UserSessionService.getActiveUUID());
    window.history.back();
  };

  $scope.noteQuickEditDone = function(note) {
    AnalyticsService.do("noteQuickEditDone");    
    NotesService.saveNote(note, UserSessionService.getActiveUUID());
    $scope.close(note, true);
  };

  $scope.cancelEdit = function() {
    window.history.back();
  };

  $scope.addNew = function() {
    AnalyticsService.visit("newNote");
    $location.path($scope.ownerPrefix + '/notes/new');
  };

  $scope.editNoteTitle = function(note) {
    AnalyticsService.do("editNoteTitle");
    NotesService.saveNote(note, UserSessionService.getActiveUUID());
  };

  $scope.editNote = function(note) {
    $location.path(UserSessionService.getOwnerPrefix() + '/notes/edit/' + note.uuid);
  };

  $scope.deleteNote = function(note) {
    AnalyticsService.do("deleteNote");
    NotesService.deleteNote(note, UserSessionService.getActiveUUID());
  };

  $scope.addNote = function(newNote) {
    var newNoteToSave = {title: newNote.title};
    if (newNote.relationships && newNote.relationships.list){
      newNoteToSave.relationships = {
        parent: newNote.relationships.list
      };
    }
    delete newNote.title;

    AnalyticsService.do("addNote");
    NotesService.saveNote(newNoteToSave, UserSessionService.getActiveUUID());
  };

  $scope.newList = {title: undefined};
  $scope.addList = function(newList) {
    ListsService.saveList(newList, UserSessionService.getActiveUUID()).then(function(/*list*/) {
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

NotesController['$inject'] = ['$location', '$scope', '$timeout', '$routeParams',
                              'UserSessionService', 'NotesService', 'ListsService',
                              'SwiperService', 'AnalyticsService'];
angular.module('em.app').controller('NotesController', NotesController);
