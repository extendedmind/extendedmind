/*global angular, window */
/*jslint white: true */

( function() {'use strict';

  function ProjectController($location, $scope, $routeParams, errorHandler, filterService, tasksArray, tasksRequest, tasksResponse, userPrefix) {

    $scope.errorHandler = errorHandler;
    $scope.prefix = userPrefix.getPrefix();
    $scope.filterService = filterService;

    $scope.tasks=tasksArray.getTasks();

    if ($routeParams.uuid) {
      $scope.project = tasksArray.getProjectByUUID($routeParams.uuid);
      $scope.filterService.activeFilters.tasksByProjectUUID.filterBy=$routeParams.uuid;
    }

    $scope.editProject = function() {
      $location.path(userPrefix.getPrefix() + '/tasks/edit/' + $scope.project.uuid);
    };

    $scope.completeProject = function(project) {

      var i = 0;

      while ($scope.tasks[i]) {
        if (!$scope.tasks[i].completed) {
          if ($scope.tasks[i].relationships) {
            if ($scope.tasks[i].relationships.parentTask) {
              if ($scope.tasks[i].relationships.parentTask === project.uuid) {
                $scope.errorHandler.errorMessage = 'Cannot complete project. Project still has uncompleted subtasks.';
                return;
              }
            }
          }
        }
        i++;
      }

      tasksRequest.completeTask(project).then(function(completeTaskResponse) {
        tasksResponse.putTaskContent(project, completeTaskResponse);

        i = 0;

        while ($scope.tasks[i]) {
          if ($scope.tasks[i].relationships) {
            if ($scope.tasks[i].relationships.parentTask) {
              if ($scope.tasks[i].relationships.parentTask === project.uuid) {
                tasksArray.removeTask($scope.tasks[i]);
              }
            }
          }
          i++;
        }

        tasksArray.removeTask(project);

        window.history.back();

      });
    };

    $scope.addNew = function() {
      $location.path(userPrefix.getPrefix() + '/tasks/new/');
    };
  }

  ProjectController.$inject = ['$location', '$scope', '$routeParams', 'errorHandler', 'filterService', 'tasksArray', 'tasksRequest', 'tasksResponse', 'userPrefix'];
  angular.module('em.app').controller('ProjectController', ProjectController);
}());
