/*global angular*/

( function() {'use strict';

    function NewTaskController($routeParams, $scope, activeItem, errorHandler, itemsArray, tasksArray, tasksRequest, tasksResponse) {

      $scope.errorHandler = errorHandler;

      if ($routeParams.uuid) {
        $scope.parentTask = tasksArray.getProjectByUuid($routeParams.uuid);
      }

      $scope.projects = tasksArray.getProjects();

      $scope.editTask = function() {

        if ($scope.parentTask) {
          $scope.task.relationships = {};
          $scope.task.relationships.parentTask = $scope.parentTask.uuid;
        }

        tasksArray.putNewTask($scope.task);

        tasksRequest.putTask($scope.task).then(function(putTaskResponse) {

          tasksResponse.putTaskContent($scope.task, putTaskResponse);
          $scope.task = {};

        });
        window.history.back();
      };

      $scope.cancelEdit = function() {
        window.history.back();
      };
    }


    NewTaskController.$inject = ['$routeParams', '$scope', 'activeItem', 'errorHandler', 'itemsArray', 'tasksArray', 'tasksRequest', 'tasksResponse'];
    angular.module('em.app').controller('NewTaskController', NewTaskController);
  }());
