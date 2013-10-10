/*global angular*/

( function() {'use strict';

    function NoteEditController($rootScope, $routeParams, $scope, activeItem, itemsArray, itemsRequest, notesArray, notesRequest, notesResponse) {

      if (activeItem.getItem()) {
        $scope.note = activeItem.getItem();
      } else {

        itemsRequest.getItems(function(itemsResponse) {
          notesArray.setNotes(itemsResponse.notes);

          $scope.note = itemsArray.getItemByUuid(notesArray.getNotes(), $routeParams.uuid);

        }, function(error) {
        });
      }

      $scope.editNote = function() {

        notesRequest.putExistingNote($scope.note, function(putExistingNoteResponse) {

          notesResponse.putNoteContent($scope.note, putExistingNoteResponse);
          $scope.note = {};
          activeItem.setItem();

        }, function(putTaskResponse) {
        });

        window.history.back();
      };

      $scope.cancelEdit = function() {
        window.history.back();
      };
    }


    NoteEditController.$inject = ['$rootScope', '$routeParams', '$scope', 'activeItem', 'itemsArray', 'itemsRequest', 'notesArray', 'notesRequest', 'notesResponse'];
    angular.module('em.app').controller('NoteEditController', NoteEditController);
  }());
