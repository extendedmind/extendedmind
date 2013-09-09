/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NewTaskController', ['$scope', '$routeParams', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse',
    function($scope, $routeParams, activeItem, errorHandler, itemsArray, itemsRequest, tagsArray, tasksArray, tasksRequest, tasksResponse) {

      $scope.errorHandler = errorHandler;

      if (activeItem.getItem()) {
        $scope.newTask = activeItem.getItem();
        $scope.projects = tasksArray.getProjects();
      } else {

        itemsRequest.getItems(function(itemsResponse) {

          itemsArray.setItems(itemsResponse.items);
          tasksArray.setTasks(itemsResponse.tasks);
          tagsArray.setTags(itemsResponse.tags);

          $scope.projects = tasksArray.getProjects();
          $scope.newTask = itemsArray.getItemByUuid(itemsArray.getItems(), $routeParams.uuid);

        }, function(error) {
        });
      }

      $scope.addNewTask = function(task) {

        if ($scope.parentTask) {
          $scope.newTask.relationships = {};
          $scope.newTask.relationships.parentTask = $scope.parentTask.uuid;
        }

        tasksRequest.putTask($scope.newTask, function(putTaskResponse) {

          tasksResponse.putTaskContent($scope.newTask, putTaskResponse);
          console.log($scope.newTask);
          tasksArray.putNewTask($scope.newTask);
          $scope.newTask = {};

        }, function(putTaskResponse) {
        });
      };
    }]);
  }());
