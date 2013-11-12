/*global angular, window */
/*jslint white: true */

( function() {'use strict';

  function NewTaskController($routeParams, $scope, activeItem, errorHandler, filterService, tagsArray, tasksArray, tasksRequest, tasksResponse, userPrefix) {

    $scope.errorHandler = errorHandler;
    $scope.prefix = userPrefix.getPrefix();
    $scope.filterService = filterService;

    $scope.contexts = tagsArray.getTags();
    $scope.tasks = tasksArray.getTasks();

    if (activeItem.getItem()) {
      $scope.parentTask = activeItem.getItem();
    }

    $scope.editTask = function() {

      if ($scope.taskContext) {

        if (!$scope.task.relationships) {
          $scope.task.relationships = {};
        }
        $scope.task.relationships.tags = [];

        $scope.task.relationships.tags[0] = $scope.taskContext.uuid;
      }

      if ($scope.parentTask) {

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
      if (activeItem.getItem()) {
        tasksArray.deleteTaskProperty(activeItem.getItem(),'project');
        activeItem.setItem();
      }
      window.history.back();
    };

    $scope.focusDate = function() {
      $('#asd').focus();
    };
  }

  NewTaskController.$inject = ['$routeParams', '$scope', 'activeItem', 'errorHandler','filterService', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse', 'userPrefix'];
  angular.module('em.app').controller('NewTaskController', NewTaskController);
}());
