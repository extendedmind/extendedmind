/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('MyController', ['$scope', 'errorService', 'itemsArray', 'itemsRequest', 'itemsResponse', 'notesArray', 'tasksArray',
    function($scope, errorService, itemsArray, itemsRequest, itemsResponse, notesArray, tasksArray) {

      $scope.errorService = errorService;

      itemsRequest.getItems(function(itemsResponse) {
        itemsArray.setItems(itemsResponse.items);
        tasksArray.setTasks(itemsResponse.tasks);
        notesArray.setNotes(itemsResponse.notes);

        $scope.items = itemsArray.getItems();
        $scope.notes = notesArray.getNotes();
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
    }]);
  }());
