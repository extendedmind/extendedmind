/*global angular*/
/*jslint plusplus: true*/

( function() {'use strict';

    angular.module('em.app').controller('MyController', ['$scope', 'activeItem', 'itemsArray', 'itemsRequest', 'itemsResponse', 'notesArray', 'notesRequest', 'notesResponse', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse',
    function($scope, activeItem, itemsArray, itemsRequest, itemsResponse, notesArray, notesRequest, notesResponse, tagsArray, tasksArray, tasksRequest, tasksResponse) {

      itemsRequest.getItems(function(itemsResponse) {

        itemsArray.setItems(itemsResponse.items);
        notesArray.setNotes(itemsResponse.notes);
        tagsArray.setTags(itemsResponse.tags);
        tasksArray.setTasks(itemsResponse.tasks);

        $scope.items = itemsArray.getItems();
        $scope.notes = notesArray.getNotes();
        $scope.tags = tagsArray.getTags();
        $scope.tasks = tasksArray.getTasks();

      }, function(error) {
      });

      $scope.addNewItem = function() {

        itemsRequest.putItem($scope.newItem, function(putItemResponse) {
          itemsResponse.putItemContent($scope.newItem, putItemResponse);
          itemsArray.putNewItem($scope.newItem);
          $scope.newItem = {};

        }, function(error) {
        });
      };

      $scope.setActiveItem = function(item) {
        activeItem.setItem(item);
      };

      $scope.itemToTask = function itemToTask(item) {

        tasksRequest.putExistingTask(item, function(putExistingTaskResponse) {

          $scope.completed = 'task added';
          itemsArray.removeItem(item);

          itemsRequest.deleteItem(item, function(deleteItemResponse) {
            itemsResponse.putItemContent(item, deleteItemResponse);
          }, function(deleteItemResponse) {
          });

          tasksResponse.putTaskContent(item, putExistingTaskResponse);
          tasksArray.putNewTask(item);

        }, function(putTaskResponse) {
        });
      };

      $scope.itemToNote = function itemToNote(item) {

        notesRequest.putExistingNote(item, function(putExistingNoteResponse) {

          $scope.completed = 'note added';
          itemsArray.removeItem(item);

          itemsRequest.deleteItem(item, function(deleteItemResponse) {
            itemsResponse.putItemContent(item, deleteItemResponse);
          }, function(deleteItemResponse) {
          });

          notesResponse.putNoteContent(item, putExistingNoteResponse);
          notesArray.putNewNote(item);

        }, function(putExistingNoteResponse) {
        });
      };

    }]);
  }());
