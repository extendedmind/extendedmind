/*global angular, window */
/*jslint white: true */

( function() {'use strict';

  function EditTaskController($timeout,$routeParams, $scope, errorHandler, filterService, tagsArray, tasksArray, tasksRequest, tasksResponse, userPrefix) {

    $scope.errorHandler = errorHandler;
    $scope.prefix = userPrefix.getPrefix();
    $scope.filterService = filterService;

    $scope.contexts = tagsArray.getTags();
    $scope.tasks = tasksArray.getTasks();

    if ($routeParams.uuid) {
      if (tasksArray.getTaskByUUID($routeParams.uuid)) {
        $scope.task = tasksArray.getTaskByUUID($routeParams.uuid);

        if ($scope.task.relationships) {
          if ($scope.task.relationships.parentTask) {
            $scope.parentTask = tasksArray.getProjectByUUID($scope.task.relationships.parentTask);
          }
          if ($scope.task.relationships.tags) {
            $scope.taskContext = tagsArray.getTagByUUID($scope.task.relationships.tags[0]);
          }
        }
      } else if (tasksArray.getProjectByUUID($routeParams.uuid)) {
        $scope.task = tasksArray.getProjectByUUID($routeParams.uuid);
      }
    }

    $scope.focusDate = function() {
      $('#asd').focus();
    };

    $scope.editTask = function() {

      if ($scope.taskContext) {

        if (!$scope.task.relationships) {
          $scope.task.relationships = {};
        }
        $scope.task.relationships.tags = [];

        $scope.task.relationships.tags[0] = $scope.taskContext.uuid;
      }

      if ($scope.parentTask) {

        if (!$scope.task.relationships) {
          $scope.task.relationships = {};
        }

        $scope.task.relationships.parentTask = $scope.parentTask.uuid;

      } else {

        if ($scope.task.relationships) {
          if ($scope.task.relationships.parentTask) {
            tasksArray.deleteTaskProperty($scope.task.relationships, 'parentTask');
          }
        }
      }

      tasksRequest.putExistingTask($scope.task).then(function(putExistingTaskResponse) {

        tasksResponse.putTaskContent($scope.task, putExistingTaskResponse);
        $scope.task = {};

      });

      window.history.back();
    };

    $scope.cancelEdit = function() {
      window.history.back();
    };
  }

  EditTaskController.$inject = ['$timeout','$routeParams', '$scope', 'errorHandler','filterService', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse', 'userPrefix'];
  angular.module('em.app').controller('EditTaskController', EditTaskController);
}());
