'use strict';

function NotesController($location, $routeParams, $scope, UISessionService, NotesService, ListsService, AnalyticsService) {

  var featureChangedCallback = function featureChangedCallback(newFeature, oldFeature){
    if (newFeature.name === 'noteEdit'){
      if (newFeature.data){
        $scope.note = newFeature.data;
      }else{
        $scope.note = {
          relationships: {}
        };
      }
    }
  }
  UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'NotesController');

  $scope.saveNote = function(note) {
    if (note.uuid){
      AnalyticsService.do('saveNote', 'new');
    } else {
      AnalyticsService.do('saveNote', 'existing');
    }
    NotesService.saveNote(note, UISessionService.getActiveUUID());
    if (!$scope.isFeatureActive('notes')) {
      UISessionService.changeFeature({name: 'notes', data: note});
    }
    $location.path(UISessionService.getOwnerPrefix());
  };

  $scope.noteQuickEditDone = function(note) {
    AnalyticsService.do('noteQuickEditDone');
    NotesService.saveNote(note, UISessionService.getActiveUUID());
  };

  $scope.editNoteTitle = function(note) {
    AnalyticsService.do('editNoteTitle');
    NotesService.saveNote(note, UISessionService.getActiveUUID());
  };

  $scope.editNote = function(note) {
    UISessionService.changeFeature({name: 'noteEdit', data: note});
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
'$location', '$routeParams', '$scope',
'UISessionService', 'NotesService', 'ListsService',
'AnalyticsService'];
angular.module('em.app').controller('NotesController', NotesController);
