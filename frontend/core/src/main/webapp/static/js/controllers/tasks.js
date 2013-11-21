/*jslint white: true */
'use strict';

function TasksListController($location, $routeParams, $scope, activeItem, tagsArray, tasksArray, tasksRequest, tasksResponse) {

  $scope.taskEdit = function(task) {
    $location.path($scope.prefix + '/tasks/edit/' + task.uuid);
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
    $location.path($scope.prefix + '/tasks/new');
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

    if ($routeParams.uuid) {
      subtask.relationships = {};

      if (tasksArray.getProjectByUUID($routeParams.uuid)) {

        subtask.relationships.parentTask = $routeParams.uuid;

      } else if (tagsArray.getTagByUUID($routeParams.uuid)) {

        subtask.relationships.tags = [];
        subtask.relationships.tags[0] = $routeParams.uuid;
      }
    }

    tasksRequest.putTask(subtask).then(function(putTaskResponse) {
      tasksResponse.putTaskContent(subtask, putTaskResponse);

      tasksArray.putNewTask(subtask);

    });
  };
}

TasksListController.$inject = ['$location', '$routeParams', '$scope', 'activeItem', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse'];
angular.module('em.app').controller('TasksListController', TasksListController);
