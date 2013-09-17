/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('TasksController', ['$location', '$rootScope', '$scope', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse',
    function($location, $rootScope, $scope, activeItem, errorHandler, itemsArray, itemsRequest, tagsArray, tasksArray, tasksRequest, tasksResponse) {

      $scope.tasks = tasksArray.getTasks();
      $scope.tags = tagsArray.getTags();
      $scope.projects = tasksArray.getProjects();
      $scope.subtasks = tasksArray.getSubtasks();

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

      $scope.setActiveItem = function(item) {
        activeItem.setItem(item);
      };

      $scope.addNew = function() {
        $location.path('/my/tasks/new/');
      };
    }]);
  }());
