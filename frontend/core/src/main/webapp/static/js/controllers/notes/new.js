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

      $scope.addNewNote = function() {

        notesRequest.putNote($scope.newNote, function(putNoteResponse) {

          notesResponse.putNoteContent($scope.newNote, putNoteResponse);
          notesArray.putNewNote($scope.newNote);
          $scope.newNote = {};

        }, function(putNoteResponse) {
        });
      };

      $scope.cancelNew = function() {
        window.history.back();
      };
    }]);
  }());
