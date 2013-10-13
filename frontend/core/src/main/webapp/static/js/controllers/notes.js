/*global angular*/

( function() {'use strict';

    function NotesListController($scope, notesArray, notesRequest, notesResponse) {

      $scope.deleteNote = function(note) {
        notesRequest.deleteNote(note).then(function(deleteNoteResponse) {
          notesResponse.putNoteContent(note, deleteNoteResponse);
          notesArray.removeNote(note);
        });
      };
    }


    NotesListController.$inject = ['$scope', 'notesArray', 'notesRequest', 'notesResponse'];
    angular.module('em.app').controller('NotesListController', NotesListController);
  }());
