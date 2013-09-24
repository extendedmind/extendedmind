/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('TasksController', ['$location', '$scope', 'activeItem', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse',
    function($location, $scope, activeItem, tagsArray, tasksArray, tasksRequest, tasksResponse) {

      $scope.tasks = tasksArray.getTasks();
      $scope.tags = tagsArray.getTags();
      $scope.projects = tasksArray.getProjects();
      $scope.subtasks = tasksArray.getSubtasks();

      $scope.tasksListFilter = true;

      $scope.taskChecked = function(index) {
        $scope.task = $scope.tasks[index];

        if ($scope.task.completed) {

          $scope.task.done = false;

          tasksRequest.uncompleteTask($scope.task, function(uncompleteTaskResponse) {
            tasksResponse.deleteTaskProperty($scope.task, 'completed');
          }, function(uncompleteTaskResponse) {
            $scope.task.done = true;
          });

        } else {

          $scope.task.done = true;

          tasksRequest.completeTask($scope.task, function(completeTaskResponse) {
            tasksResponse.putTaskContent($scope.task, completeTaskResponse);
          }, function(completeTaskResponse) {
            $scope.task.done = false;
          });

        }
      };

      $scope.addNew = function() {
        $location.path('/my/tasks/new/');
      };

      $scope.setActiveItem = function(item) {
        activeItem.setItem(item);
      };
    }]);
  }());
