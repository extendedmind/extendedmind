/*global angular*/

( function() {'use strict';

    function ProjectController($location, $scope, $routeParams, errorHandler, itemsRequest, tagsArray, tasksArray) {

      $scope.errorHandler = errorHandler;

      itemsRequest.getItems().then(function() {

        if ($routeParams.uuid) {
          $scope.project = tasksArray.getProjectByUuid($routeParams.uuid);
          $scope.tasks = tasksArray.getSubtasksByProjectUuid($scope.project.uuid);
        }
      });

      $scope.addNew = function() {
        $location.path('/my/tasks/new/');
      };
    }


    ProjectController.$inject = ['$location', '$scope', '$routeParams', 'errorHandler', 'itemsRequest', 'tagsArray', 'tasksArray'];
    angular.module('em.app').controller('ProjectController', ProjectController);
  }());
