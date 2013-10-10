/*global angular*/

( function() {'use strict';

    function ProjectController($location, $scope, $routeParams, activeItem, errorHandler, itemsArray, itemsRequest, tagsArray, tasksArray) {

      $scope.errorHandler = errorHandler;
      activeItem.setItem();

      if (activeItem.getItem()) {
        $scope.project = activeItem.getItem();
        $scope.tasks = tasksArray.getSubtasksByUuid($scope.project.uuid);
      } else {
        itemsRequest.getItems(function(itemsResponse) {

          itemsArray.setItems(itemsResponse.items);
          tasksArray.setTasks(itemsResponse.tasks);
          tagsArray.setTags(itemsResponse.tags);

          $scope.project = itemsArray.getItemByUuid(tasksArray.getProjects(), $routeParams.uuid);
          $scope.tasks = tasksArray.getSubtasksByUuid($scope.project.uuid);
        }, function(error) {
        });
      }

      $scope.addNew = function() {
        $location.path('/my/tasks/new/');
      };

      $scope.setActiveItem = function(tag) {
        activeItem.setItem(tag);
      };
    }


    ProjectController.$inject = ['$location', '$scope', '$routeParams', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'tagsArray', 'tasksArray'];
    angular.module('em.app').controller('ProjectController', ProjectController);
  }());
