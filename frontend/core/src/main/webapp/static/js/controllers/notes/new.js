/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NewNoteController', ['$location', '$routeParams', '$scope', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'notesArray', 'notesRequest', 'notesResponse',
    function($location, $routeParams, $scope, activeItem, errorHandler, itemsArray, itemsRequest, notesArray, notesRequest, notesResponse) {

      $scope.errorHandler = errorHandler;

      itemsRequest.getItems(function(itemsResponse) {

        itemsArray.setItems(itemsResponse.items);
        notesArray.setNotes(itemsResponse.notes);

      }, function(error) {
      });

      $scope.editNote = function() {

        notesRequest.putNote($scope.note, function(putNoteResponse) {

          notesResponse.putNoteContent($scope.note, putNoteResponse);
          notesArray.putNewNote($scope.note);
          $scope.note = {};

        }, function(putNoteResponse) {
        });
      };

      $scope.cancelEdit = function() {
        window.history.back();
      };
    }]);
  }());
