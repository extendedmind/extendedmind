/*global angular*/

( function() {'use strict';

    function NoteEditController($routeParams, $scope, errorHandler, itemsRequest, notesArray, notesRequest, notesResponse) {

      $scope.errorHandler = errorHandler;

      itemsRequest.getItems().then(function() {
        if ($routeParams.uuid) {
          $scope.note = notesArray.getNoteByUuid($routeParams.uuid);
        }
      });

      $scope.editNote = function() {

        notesRequest.putExistingNote($scope.note).then(function(putExistingNoteResponse) {

          notesResponse.putNoteContent($scope.note, putExistingNoteResponse);
          $scope.note = {};

        });

        window.history.back();
      };

      $scope.cancelEdit = function() {
        window.history.back();
      };
    }


    NoteEditController.$inject = ['$routeParams', '$scope', 'errorHandler', 'itemsRequest', 'notesArray', 'notesRequest', 'notesResponse'];
    angular.module('em.app').controller('NoteEditController', NoteEditController);
  }());
