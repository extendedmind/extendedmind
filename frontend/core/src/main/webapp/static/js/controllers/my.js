/*global angular*/
/*jslint plusplus: true*/

( function() {'use strict';

    angular.module('em.app').controller('MyController', ['$scope', 'activeItem', 'itemsArray', 'itemsRequest', 'itemsResponse', 'notesArray', 'tagsArray', 'tasksArray',
    function($scope, activeItem, itemsArray, itemsRequest, itemsResponse, notesArray, tagsArray, tasksArray) {

      $scope.items = itemsArray.getItems();
      $scope.notes = notesArray.getNotes();
      $scope.tags = tagsArray.getTags();
      $scope.tasks = tasksArray.getTasks();

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
    }]);
  }());
