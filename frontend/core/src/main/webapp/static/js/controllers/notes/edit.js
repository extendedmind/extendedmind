/*global angular*/

( function() {'use strict';

    function NoteEditController($routeParams, $scope, activeItem, errorHandler, notesArray, notesRequest, notesResponse) {

      $scope.errorHandler = errorHandler;

      if (activeItem.getItem()) {
        $scope.note = activeItem.getItem();
      } else {
        $scope.note = notesArray.getNoteByUuid($routeParams.uuid);
      }

      $scope.editNote = function() {

        notesRequest.putExistingNote($scope.note).then(function(putExistingNoteResponse) {

          notesResponse.putNoteContent($scope.note, putExistingNoteResponse);
          $scope.note = {};
          activeItem.setItem();

        });

        window.history.back();
      };

      $scope.cancelEdit = function() {
        window.history.back();
      };
    }


    NoteEditController.$inject = ['$routeParams', '$scope', 'activeItem', 'errorHandler', 'notesArray', 'notesRequest', 'notesResponse'];
    angular.module('em.app').controller('NoteEditController', NoteEditController);
  }());
