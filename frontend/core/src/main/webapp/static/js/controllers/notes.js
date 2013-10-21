/*global angular*/

( function() {'use strict';

    function NotesListController($location, $scope, notesArray, notesRequest, notesResponse, userPrefix) {

      $scope.noteEdit = function(note) {
        $location.path(userPrefix.getPrefix() + '/notes/edit/' + note.uuid);
      };

      $scope.deleteNote = function(note) {

        notesArray.removeNote(note);

        notesRequest.deleteNote(note).then(function(deleteNoteResponse) {
          notesResponse.putNoteContent(note, deleteNoteResponse);
        });
      };
    }


    NotesListController.$inject = ['$location', '$scope', 'notesArray', 'notesRequest', 'notesResponse', 'userPrefix'];
    angular.module('em.app').controller('NotesListController', NotesListController);
  }());
