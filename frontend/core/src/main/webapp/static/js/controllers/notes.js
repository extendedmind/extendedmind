/*global angular */
/*jslint white: true */

( function() {'use strict';

  function NotesListController($location, $scope, notesArray, notesRequest, notesResponse) {

    $scope.noteEdit = function(note) {
      $location.path($scope.prefix + '/notes/edit/' + note.uuid);
    };

    $scope.deleteNote = function(note) {

      notesArray.removeNote(note);

      notesRequest.deleteNote(note).then(function(deleteNoteResponse) {
        notesResponse.putNoteContent(note, deleteNoteResponse);
      });
    };
  }

  NotesListController.$inject = ['$location', '$scope', 'notesArray', 'notesRequest', 'notesResponse'];
  angular.module('em.app').controller('NotesListController', NotesListController);
}());
