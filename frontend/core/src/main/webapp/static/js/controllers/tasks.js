/*global angular*/

( function() {'use strict';

    function TasksListController($location, $scope, tasksArray, tasksRequest, tasksResponse) {

      $scope.taskEdit = function(task) {
        $scope.setActiveItem(task);
        $location.path('/my/tasks/edit/' + task.uuid);
      };

      $scope.taskChecked = function(index) {

        $scope.task = $scope.tasks[index];
        if ($scope.task.completed) {

          tasksArray.deleteTaskProperty($scope.task, 'completed');

          tasksRequest.uncompleteTask($scope.task).then(function(uncompleteTaskResponse) {
            tasksResponse.putTaskContent($scope.task, uncompleteTaskResponse);
          });

        } else {

          tasksRequest.completeTask($scope.task).then(function(completeTaskResponse) {
            tasksResponse.putTaskContent($scope.task, completeTaskResponse);
          });

        }
      };

      $scope.taskToProject = function(task) {

        task.project = true;

        tasksRequest.putExistingTask(task).then(function(putExistingTaskResponse) {
          tasksResponse.putTaskContent(task, putExistingTaskResponse);

          $location.path('/my/tasks/new/');

          tasksArray.removeTask(task);
          tasksArray.setProject(task);
        });
      };

      $scope.deleteTask = function(task) {

        tasksRequest.deleteTask(task).then(function(deleteTaskResponse) {
          tasksArray.removeTask(task);
          tasksResponse.putTaskContent(task, deleteTaskResponse);
        });

      };
    }


    TasksListController.$inject = ['$location', '$scope', 'tasksArray', 'tasksRequest', 'tasksResponse'];
    angular.module('em.app').controller('TasksListController', TasksListController);
  }());
