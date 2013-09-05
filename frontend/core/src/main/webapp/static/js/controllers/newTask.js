/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NewTaskController', ['$scope', '$routeParams', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse',
    function($scope, $routeParams, activeItem, errorHandler, itemsArray, itemsRequest, tagsArray, tasksArray, tasksRequest, tasksResponse) {

      $scope.errorHandler = errorHandler;

      if ($routeParams.itemUuid) {
        $scope.newTask = activeItem.getItem();
      }

      itemsRequest.getItems(function(itemsResponse) {
        itemsArray.setItems(itemsResponse.items);
      }, function(error) {
      });

      $scope.addNewTask = function(task) {
        tasksRequest.putTask($scope.newTask, function(putTaskResponse) {
          tasksResponse.putTaskContent($scope.newTask, putTaskResponse);
          tasksArray.putNewTask($scope.newTask);
          $scope.newTask = {};
        }, function(putTaskResponse) {
        });
      };
    }]);
  }());
