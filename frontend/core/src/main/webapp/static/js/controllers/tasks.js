/*global angular*/
/*jslint white: true */

( function() {'use strict';

  function TasksListController($location, $routeParams, $scope, activeItem, tagsArray, tasksArray, tasksRequest, tasksResponse, userPrefix) {

    $scope.taskEdit = function(task) {
      $location.path(userPrefix.getPrefix() + '/tasks/edit/' + task.uuid);
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
      $location.path(userPrefix.getPrefix() + '/tasks/new');
      activeItem.setItem(task);
      task.project=true;

      tasksRequest.putExistingTask(task).then(function(putExistingTaskResponse) {
        tasksResponse.putTaskContent(task, putExistingTaskResponse);
      });
    };

    $scope.deleteTask = function(task) {

      tasksArray.removeTask(task);

      tasksRequest.deleteTask(task).then(function(deleteTaskResponse) {
        tasksResponse.putTaskContent(task, deleteTaskResponse);
      });
    };

    $scope.addSubtask = function() {

      if ($routeParams.uuid) {
        $scope.subtask.relationships = {};

        if (tasksArray.getProjectByUUID($routeParams.uuid)) {

          $scope.subtask.relationships.parentTask = $routeParams.uuid;

        } else if (tagsArray.getTagByUUID($routeParams.uuid)) {

          $scope.subtask.relationships.tags = [];
          $scope.subtask.relationships.tags[0] = $routeParams.uuid;
        }
      }

      tasksArray.putNewTask($scope.subtask);

      tasksRequest.putTask($scope.subtask).then(function(putTaskResponse) {
        tasksResponse.putTaskContent($scope.subtask, putTaskResponse);

        $scope.subtask = {};
      });
    };
  }


  TasksListController.$inject = ['$location', '$routeParams', '$scope', 'activeItem', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse', 'userPrefix'];
  angular.module('em.app').controller('TasksListController', TasksListController);
}());
