/*global angular*/

( function() {'use strict';

    function NewNoteController($scope, errorHandler, notesArray, notesRequest, notesResponse) {

      $scope.errorHandler = errorHandler;

      $scope.editNote = function() {

        notesRequest.putNote($scope.note).then(function(putNoteResponse) {

          notesArray.putNewNote($scope.note);

          notesResponse.putNoteContent($scope.note, putNoteResponse);
          $scope.note = {};

        });
        window.history.back();
      };

      $scope.cancelEdit = function() {
        window.history.back();
      };
    }


    NewNoteController.$inject = ['$scope', 'errorHandler', 'notesArray', 'notesRequest', 'notesResponse'];
    angular.module('em.app').controller('NewNoteController', NewNoteController);
  }());
