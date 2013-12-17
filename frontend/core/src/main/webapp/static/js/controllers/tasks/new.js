/*global angular */
'use strict';

function NewTaskController($routeParams, $scope, activeItem, errorHandler, filterService, tagsArray, tasksArray, tasksRequest, tasksResponse, userPrefix) {

  $scope.errorHandler = errorHandler;
  $scope.prefix = userPrefix.getPrefix();
  $scope.filterService = filterService;

  $scope.contexts = tagsArray.getTags();
  $scope.tasks = tasksArray.getTasks();

  function newEmptyTask() {
    $scope.task = {
      relationships: {
        parentTask: '',
        tags: []
      }
    };
  }

  newEmptyTask();

  if (activeItem.getItem()) {
    $scope.parentTask = activeItem.getItem();
    $scope.task.relationships.parentTask = $scope.parentTask.uuid;
  }

  $scope.editTask = function() {

    tasksResponse.checkDate($scope.task);
    tasksResponse.checkParentTask($scope.task);
    tasksResponse.checkContexts($scope.task);

    tasksArray.putNewTask($scope.task);

    tasksRequest.putTask($scope.task).then(function(putTaskResponse) {
      tasksResponse.putTaskContent($scope.task, putTaskResponse);
      newEmptyTask();
    });
    
    activeItem.setItem();
    window.history.back();
  };

  $scope.cancelEdit = function() {
    if (activeItem.getItem()) {
      tasksArray.deleteTaskProperty(activeItem.getItem(), 'project');
      activeItem.setItem();
    }
    window.history.back();
  };
}

NewTaskController.$inject = ['$routeParams', '$scope', 'activeItem', 'errorHandler','filterService', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse', 'userPrefix'];
angular.module('em.app').controller('NewTaskController', NewTaskController);
