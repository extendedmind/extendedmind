/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('EditTaskController', ['$location', '$routeParams', '$scope', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse',
    function($location, $routeParams, $scope, activeItem, errorHandler, itemsArray, itemsRequest, tagsArray, tasksArray, tasksRequest, tasksResponse) {

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
          $scope.newTask = itemsArray.getItemByUuid(tasksArray.getTasks(), $routeParams.uuid);

        }, function(error) {
        });
      }

      $scope.addNewTask = function() {

        if ($scope.parentTask) {
          $scope.newTask.relationships = {};
          $scope.newTask.relationships.parentTask = $scope.parentTask.uuid;
        }

        if ($routeParams.uuid) {

          tasksRequest.putExistingTask($scope.newTask, function(putExistingTaskResponse) {

            tasksResponse.putTaskContent($scope.newTask, putExistingTaskResponse);
            $scope.newTask = {};
            activeItem.setItem();

          }, function(putTaskResponse) {
          });

        } else {

          tasksRequest.putTask($scope.newTask, function(putTaskResponse) {

            tasksResponse.putTaskContent($scope.newTask, putTaskResponse);
            tasksArray.putNewTask($scope.newTask);
            $scope.newTask = {};

          }, function(putTaskResponse) {
          });
        }
      };

      $scope.cancelNew = function() {
        window.history.back();
      };
    }]);
  }());
