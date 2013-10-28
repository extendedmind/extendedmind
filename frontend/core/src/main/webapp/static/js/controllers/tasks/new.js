/*global angular*/

( function() {'use strict';

    function NewTaskController($routeParams, $scope, activeItem, errorHandler, itemsArray, itemsRequest, tagsArray, tasksArray, tasksRequest, tasksResponse, userPrefix) {

      $scope.errorHandler = errorHandler;
      $scope.prefix = userPrefix.getPrefix();

      itemsRequest.getItems().then(function() {

        $scope.contexts = tagsArray.getTags();
        $scope.projects = tasksArray.getProjects();

        if (activeItem.getItem()) {
          $scope.parentTask = activeItem.getItem();
          tasksArray.removeTask(activeItem.getItem());
          tasksArray.setProject(activeItem.getItem());
        }
      });

      $scope.editTask = function() {

        if ($scope.taskContext) {

          if (!$scope.task.relationships) {
            $scope.task.relationships = {};
          }
          $scope.task.relationships.tags = [];

          $scope.task.relationships.tags[0] = $scope.taskContext.uuid;
        }

        if ($scope.parentTask) {

          if (!$scope.parentTask.project) {
            $scope.parentTask.project = true;

            tasksRequest.putExistingTask($scope.parentTask).then(function(putExistingTaskResponse) {
              tasksResponse.putTaskContent($scope.parentTask, putExistingTaskResponse);
            });
          }

          $scope.task.relationships = {};
          $scope.task.relationships.parentTask = $scope.parentTask.uuid;
        }

        tasksArray.putNewTask($scope.task);

        tasksRequest.putTask($scope.task).then(function(putTaskResponse) {

          tasksResponse.putTaskContent($scope.task, putTaskResponse);
          $scope.task = {};

        });
        activeItem.setItem();
        window.history.back();
      };

      $scope.cancelEdit = function() {
        activeItem.setItem();
        window.history.back();
      };
    }


    NewTaskController.$inject = ['$routeParams', '$scope', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse', 'userPrefix'];
    angular.module('em.app').controller('NewTaskController', NewTaskController);
  }());
