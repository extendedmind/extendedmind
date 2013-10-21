/*global angular*/

( function() {'use strict';

    function ProjectController($location, $scope, $routeParams, errorHandler, itemsRequest, tagsArray, tasksArray, userPrefix) {

      $scope.errorHandler = errorHandler;
      $scope.prefix = userPrefix.getPrefix();

      itemsRequest.getItems().then(function() {

        if ($routeParams.uuid) {
          $scope.project = tasksArray.getProjectByUUID($routeParams.uuid);
          $scope.tasks = tasksArray.getSubtasksByProjectUUID($scope.project.uuid);
        }
      });

      $scope.addNew = function() {
        $location.path(userPrefix.getPrefix() + '/tasks/new/');
      };
    }


    ProjectController.$inject = ['$location', '$scope', '$routeParams', 'errorHandler', 'itemsRequest', 'tagsArray', 'tasksArray', 'userPrefix'];
    angular.module('em.app').controller('ProjectController', ProjectController);
  }());
