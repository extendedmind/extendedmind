/*global angular*/

( function() {'use strict';

    function NotesListController($scope, notesArray, notesRequest, notesResponse) {

      $scope.deleteNote = function(note) {

        notesArray.removeNote(note);

        notesRequest.deleteNote(note).then(function(deleteNoteResponse) {
          notesResponse.putNoteContent(note, deleteNoteResponse);
        });
      };
    }


    NotesListController.$inject = ['$scope', 'notesArray', 'notesRequest', 'notesResponse'];
    angular.module('em.app').controller('NotesListController', NotesListController);
  }());
