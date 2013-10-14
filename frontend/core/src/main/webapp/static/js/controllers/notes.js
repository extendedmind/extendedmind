/*global angular*/

( function() {'use strict';

    function NotesListController($scope, notesArray, notesRequest, notesResponse) {

      $scope.deleteNote = function(note) {
        notesRequest.deleteNote(note).then(function(deleteNoteResponse) {
          notesArray.removeNote(note);
          notesResponse.putNoteContent(note, deleteNoteResponse);
        });
      };
    }


    NotesListController.$inject = ['$scope', 'notesArray', 'notesRequest', 'notesResponse'];
    angular.module('em.app').controller('NotesListController', NotesListController);
  }());
