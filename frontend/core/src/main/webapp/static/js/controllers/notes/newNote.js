/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NewNoteController', ['$location', '$routeParams', '$scope', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'notesArray', 'notesRequest', 'notesResponse', 'tagsArray',
    function($location, $routeParams, $scope, activeItem, errorHandler, itemsArray, itemsRequest, notesArray, notesRequest, notesResponse, tagsArray) {

      $scope.errorHandler = errorHandler;

      itemsRequest.getItems(function(itemsResponse) {

        itemsArray.setItems(itemsResponse.items);
        notesArray.setNotes(itemsResponse.notes);
        tagsArray.setTags(itemsResponse.tags);

        $scope.newTask = itemsArray.getItemByUuid(itemsArray.getItems(), $routeParams.uuid);

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
