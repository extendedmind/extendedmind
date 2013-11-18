/*global window */
/*jslint white: true */
'use strict';

function EditTaskController($timeout,$routeParams, $scope, errorHandler, filterService, tagsArray, tasksArray, tasksRequest, tasksResponse, userPrefix) {

  $scope.errorHandler = errorHandler;
  $scope.prefix = userPrefix.getPrefix();
  $scope.filterService = filterService;

  $scope.contexts = tagsArray.getTags();
  $scope.tasks = tasksArray.getTasks();

  if ($routeParams.uuid) {
    if (tasksArray.getTaskByUUID($routeParams.uuid)) {
      $scope.task = tasksArray.getTaskByUUID($routeParams.uuid);
    } else if (tasksArray.getProjectByUUID($routeParams.uuid)) {
      $scope.task = tasksArray.getProjectByUUID($routeParams.uuid);
    }
  }

  $scope.focusDate = function() {
    $('#asd').focus();
  };

  $scope.editTask = function() {

    tasksResponse.checkDate($scope.task);
    tasksResponse.checkParentTask($scope.task);
    tasksResponse.checkContexts($scope.task);

    tasksRequest.putExistingTask($scope.task).then(function() {
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
