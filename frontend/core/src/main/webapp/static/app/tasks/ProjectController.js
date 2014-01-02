/*global angular */
'use strict';

function ProjectController($location, $scope, $routeParams, DateService, ErrorHandlerService, FilterService, itemsArray, tagsArray, tasksArray, tasksRequest, tasksResponse, OwnerService) {
  $scope.tasks = tasksArray.getTasks();
  $scope.tags = tagsArray.getTags();
  $scope.items = itemsArray.getItems();

  $scope.errorHandler = ErrorHandlerService;
  $scope.prefix = OwnerService.getPrefix();
  $scope.filterService = FilterService;

  $scope.dates = DateService.week();
  $scope.date = DateService.today();

  $scope.editProject = function() {
    $location.path(OwnerService.getPrefix() + '/tasks/edit/' + $scope.project.uuid);
  };

  $scope.completeProject = function() {
    var i = 0;

    while ($scope.tasks[i]) {
      if (!$scope.tasks[i].completed) {
        if ($scope.tasks[i].relationships) {
          if ($scope.tasks[i].relationships.parentTask) {
            if ($scope.tasks[i].relationships.parentTask === $scope.project.uuid) {
              $scope.errorHandler.errorMessage = 'Cannot complete project. Project still has uncompleted subtasks.';
              return;
            }
          }
        }
      }
      i++;
    }

    tasksRequest.completeTask($scope.project).then(function(completeTaskResponse) {
      tasksResponse.putTaskContent($scope.project, completeTaskResponse);

      i = 0;

      while ($scope.tasks[i]) {
        if ($scope.tasks[i].relationships) {
          if ($scope.tasks[i].relationships.parentTask) {
            if ($scope.tasks[i].relationships.parentTask === $scope.project.uuid) {
              tasksArray.removeTask($scope.tasks[i]);
            }
          }
        }
        i++;
      }

      tasksArray.removeTask($scope.project);

      window.history.back();

    });
  };
}

ProjectController.$inject = ['$location', '$scope', '$routeParams', 'DateService', 'ErrorHandlerService', 'FilterService', 'itemsArray', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse', 'OwnerService'];
angular.module('em.app').controller('ProjectController', ProjectController);
