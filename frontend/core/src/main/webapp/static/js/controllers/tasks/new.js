/*global angular*/

( function() {'use strict';

    function NewTaskController($scope, errorHandler, tasksArray, tasksRequest, tasksResponse) {

      $scope.errorHandler = errorHandler;

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


    NewTaskController.$inject = ['$scope', 'errorHandler', 'tasksArray', 'tasksRequest', 'tasksResponse'];
    angular.module('em.app').controller('NewTaskController', NewTaskController);
  }());
