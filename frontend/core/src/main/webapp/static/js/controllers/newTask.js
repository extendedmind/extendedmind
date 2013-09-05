/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NewTaskController', ['$scope', '$routeParams', 'errorHandler', 'itemsArray', 'itemsRequest', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse',
    function($scope, $routeParams, errorHandler, itemsArray, itemsRequest, tagsArray, tasksArray, tasksRequest, tasksResponse) {

      $scope.errorHandler = errorHandler;

      itemsRequest.getItems(function(itemsResponse) {
        itemsArray.setItems(itemsResponse.items);

        if ($routeParams.itemUuid) {
          $scope.newTask = itemsArray.getItemByUuid(itemsArray.getItems(), $routeParams.itemUuid);
        }
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
