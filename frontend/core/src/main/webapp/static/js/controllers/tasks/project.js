/*global angular*/

( function() {'use strict';

  function ProjectController($location, $scope, $routeParams, errorHandler,filterService, itemsRequest, tagsArray, tasksArray, userPrefix) {

    $scope.errorHandler = errorHandler;
    $scope.prefix = userPrefix.getPrefix();
    $scope.filterService=filterService;

    itemsRequest.getItems().then(function() {

      $scope.tasks=tasksArray.getTasks();

      if ($routeParams.uuid) {
        $scope.project = tasksArray.getProjectByUUID($routeParams.uuid);
        $scope.filterService.activeFilters.tasksByProjectUUID.filterBy=$routeParams.uuid;
      }
    });

    $scope.editProject = function() {
      $location.path(userPrefix.getPrefix() + '/tasks/edit/' + $scope.project.uuid);
    };

    $scope.addNew = function() {
      $location.path(userPrefix.getPrefix() + '/tasks/new/');
    };
  }


  ProjectController.$inject = ['$location', '$scope', '$routeParams', 'errorHandler', 'filterService','itemsRequest', 'tagsArray', 'tasksArray', 'userPrefix'];
  angular.module('em.app').controller('ProjectController', ProjectController);
}());
