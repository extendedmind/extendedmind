/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NewTaskController', ['$scope', '$routeParams', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse',
    function($scope, $routeParams, activeItem, errorHandler, itemsArray, itemsRequest, tasArray, tasksArray, tasksRequest, tasksResponse) {

      $scope.errorHandler = errorHandler;

      if ($routeParams.uuid) {

        if (activeItem.getItem()) {
          $scope.newTask = activeItem.getItem();
        } else {

          itemsRequest.getItems(function(itemsResponse) {

            itemsArray.setItems(itemsResponse.items);
            $scope.newTask = itemsArray.getItemByUuid(itemsArray.getItems(), $routeParams.uuid);

          }, function(error) {
          });
        }
      }

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
