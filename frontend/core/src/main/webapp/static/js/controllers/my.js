/*global angular*/
/*jslint plusplus: true*/

( function() {'use strict';

    angular.module('em.app').controller('MyController', ['$scope', 'activeItem', 'itemsArray', 'itemsRequest', 'itemsResponse', 'notesArray', 'tagsArray', 'tasksArray',
    function($scope, activeItem, itemsArray, itemsRequest, itemsResponse, notesArray, tagsArray, tasksArray) {

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

      $scope.itemToTask = function itemToTask() {
        $scope.completed = 'task added';
      };

      $scope.itemToNote = function itemToNote() {
        $scope.completed = 'note added';
      };
    }]);
  }());
