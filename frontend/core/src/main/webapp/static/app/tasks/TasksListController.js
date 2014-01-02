/*global angular */
'use strict';

function TasksListController($location, $routeParams, $scope, activeItem, tagsArray, tasksArray, tasksRequest, tasksResponse, OwnerService) {

  $scope.taskEdit = function(task) {
    $location.path(OwnerService.getPrefix() + '/tasks/edit/' + task.uuid);
  };

  $scope.taskChecked = function(task) {
    if (task.completed) {
      tasksArray.deleteTaskProperty(task, 'completed');
      tasksRequest.uncompleteTask(task).then(function(uncompleteTaskResponse) {
        tasksResponse.putTaskContent(task, uncompleteTaskResponse);
      });
    } else {
      tasksRequest.completeTask(task).then(function(completeTaskResponse) {
        tasksResponse.putTaskContent(task, completeTaskResponse);
      });
    }
  };

  $scope.taskToProject = function(task) {
    $location.path(OwnerService.getPrefix() + '/tasks/new');
    activeItem.setItem(task);
    task.project = true;
    tasksRequest.putExistingTask(task);
  };

  $scope.deleteTask = function(task) {
    tasksArray.removeTask(task);
    tasksRequest.deleteTask(task).then(function(deleteTaskResponse) {
      tasksResponse.putTaskContent(task, deleteTaskResponse);
    });
  };

  $scope.addSubtask = function(subtask) {
    $scope.subtask = {};
    tasksRequest.putTask(subtask).then(function(putTaskResponse) {
      tasksResponse.putTaskContent(subtask, putTaskResponse);
      tasksArray.putNewTask(subtask);
    });
  };
}

TasksListController.$inject = ['$location', '$routeParams', '$scope', 'activeItem', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse', 'OwnerService'];
angular.module('em.app').controller('TasksListController', TasksListController);
