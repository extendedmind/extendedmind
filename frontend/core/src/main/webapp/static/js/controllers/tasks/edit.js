/*global angular*/

( function() {'use strict';

    function EditTaskController($routeParams, $scope, activeItem, errorHandler, tasksArray, tasksRequest, tasksResponse) {

      $scope.errorHandler = errorHandler;

      if (activeItem.getItem()) {
        $scope.task = activeItem.getItem();
      } else {
        $scope.task = tasksArray.getTaskByUuid($routeParams.uuid);
      }

      if ($scope.task.relationships) {
        if ($scope.task.relationships.parentTask) {
          $scope.parentTask = tasksArray.getProjectByUuid($scope.task.relationships.parentTask);
        }
      }
      $scope.projects = tasksArray.getProjects();

      $scope.editTask = function() {

        if ($scope.parentTask) {

          tasksArray.setSubtask($scope.task);

          if (!$scope.task.relationships) {
            $scope.task.relationships = {};
          }

          $scope.task.relationships.parentTask = $scope.parentTask.uuid;

        } else {

          if ($scope.task.relationships) {
            if ($scope.task.relationships.plocarentTask) {
              tasksArray.removeSubtask($scope.task);
              tasksArray.deleteTaskProperty($scope.task.relationships, 'parentTask');
            }
          }
        }

        tasksRequest.putExistingTask($scope.task).then(function(putExistingTaskResponse) {

          tasksResponse.putTaskContent($scope.task, putExistingTaskResponse);
          $scope.task = {};
          activeItem.setItem();

        });

        window.history.back();
      };

      $scope.cancelEdit = function() {
        window.history.back();
      };
    }


    EditTaskController.$inject = ['$routeParams', '$scope', 'activeItem', 'errorHandler', 'tasksArray', 'tasksRequest', 'tasksResponse'];
    angular.module('em.app').controller('EditTaskController', EditTaskController);
  }());
