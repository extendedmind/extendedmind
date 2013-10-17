/*global angular*/

( function() {'use strict';

    function ProjectController($location, $scope, $routeParams, activeItem, errorHandler, itemsRequest, tagsArray, tasksArray) {

      $scope.errorHandler = errorHandler;

      itemsRequest.getItems().then(function() {

        if (activeItem.getItem()) {
          $scope.project = activeItem.getItem();
        } else {
          $scope.project = tasksArray.getProjectByUuid($routeParams.uuid);
        }

        $scope.tasks = tasksArray.getSubtasksByProjectUuid($scope.project.uuid);

      });

      $scope.addNew = function() {
        $location.path('/my/tasks/new/');
      };

      $scope.setActiveItem = function(tag) {
        activeItem.setItem(tag);
      };
    }


    ProjectController.$inject = ['$location', '$scope', '$routeParams', 'activeItem', 'errorHandler', 'itemsRequest', 'tagsArray', 'tasksArray'];
    angular.module('em.app').controller('ProjectController', ProjectController);
  }());
