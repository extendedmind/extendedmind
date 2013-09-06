/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('TasksController', ['$scope', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse',
    function($scope, activeItem, errorHandler, itemsArray, itemsRequest, tagsArray, tasksArray, tasksRequest, tasksResponse) {

      $scope.errorHandler = errorHandler;

      itemsRequest.getItems(function(itemsResponse) {

        itemsArray.setItems(itemsResponse.items);

        tagsArray.setTags(itemsResponse.tags);
        $scope.tags = tagsArray.getTags();

        tasksArray.setTasks(itemsResponse.tasks);
        $scope.tasks = tasksArray.getTasks();

        tasksArray.setSubtasks($scope.tasks);
        $scope.subtasks = tasksArray.getSubtasks();

        tasksArray.setProjects($scope.tasks);
        $scope.projects = tasksArray.getProjects();

      }, function(error) {
      });

      $scope.tasksListFilter = true;

      $scope.taskChecked = function(index) {
        $scope.task = $scope.tasks[index];

        if ($scope.task.done) {

          tasksRequest.completeTask($scope.task, function(completeTaskResponse) {
            tasksResponse.putTaskContent($scope.task, completeTaskResponse);
          }, function(completeTaskResponse) {
          });

        } else {

          tasksRequest.uncompleteTask($scope.task, function(uncompleteTaskResponse) {
            tasksResponse.deleteTaskProperty($scope.task, 'completed');
          }, function(uncompleteTaskResponse) {

          });
        }
      };

      $scope.setActiveItem = function(tag) {
        activeItem.setItem(tag);
      };
    }]);
  }());
