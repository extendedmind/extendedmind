/*global angular */
'use strict';

function EditTaskController($timeout, $routeParams, $scope, TasksService) {

  if ($routeParams.uuid) {
    $scope.task = TasksService.getTaskByUUID($routeParams.uuid);
  }else {
    $scope.task = {
      relationships: {
        tags: []
      }
    };
    if ($routeParams.parentUUID){
      $scope.task.relationships.parent = $routeParams.parentUUID;
    }
  }

  $scope.editTask = function() {
    TasksService.saveTask($scope.task);
    $scope.task = {};
    window.history.back();
  };

  $scope.cancelEdit = function() {
    window.history.back();
  };
}

EditTaskController.$inject = ['$timeout','$routeParams', '$scope', 'TasksService'];
angular.module('em.app').controller('EditTaskController', EditTaskController);
