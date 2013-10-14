/*global angular*/

( function() {'use strict';

    function ItemsController($scope, itemsArray, itemsRequest, itemsResponse, notesArray, notesRequest, notesResponse, tasksArray, tasksRequest, tasksResponse) {

      $scope.deleteItem = function(item) {
        itemsArray.removeItem(item);

        itemsRequest.deleteItem(item).then(function(deleteItemResponse) {
          itemsResponse.putItemContent(item, deleteItemResponse);
        });
      };

      $scope.itemToTask = function itemToTask(item) {

        $scope.completed = 'task added';
        itemsArray.removeItem(item);

        tasksRequest.putExistingTask(item).then(function(putExistingTaskResponse) {

          tasksResponse.putTaskContent(item, putExistingTaskResponse);
          tasksArray.putNewTask(item);

        });
      };

      $scope.itemToNote = function itemToNote(item) {

        $scope.completed = 'note added';
        itemsArray.removeItem(item);

        notesRequest.putExistingNote(item).then(function(putExistingNoteResponse) {

          notesResponse.putNoteContent(item, putExistingNoteResponse);
          notesArray.putNewNote(item);

        });
      };
    }


    ItemsController.$inject = ['$scope', 'itemsArray', 'itemsRequest', 'itemsResponse', 'notesArray', 'notesRequest', 'notesResponse', 'tasksArray', 'tasksRequest', 'tasksResponse'];
    angular.module('em.app').controller('ItemsController', ItemsController);
  }());
