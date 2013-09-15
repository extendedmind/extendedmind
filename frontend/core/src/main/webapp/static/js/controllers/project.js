/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('ProjectController', ['$location', '$scope', '$routeParams', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'tagsArray', 'tasksArray',
    function($location, $scope, $routeParams, activeItem, errorHandler, itemsArray, itemsRequest, tagsArray, tasksArray) {

      $scope.errorHandler = errorHandler;

      if (activeItem.getItem()) {
        $scope.project = activeItem.getItem();

        $scope.subtasks = itemsArray.getItemsByUuid(tasksArray.getSubtasks(), $scope.project.uuid);
      } else {
        itemsRequest.getItems(function(itemsResponse) {

          itemsArray.setItems(itemsResponse.items);
          tasksArray.setTasks(itemsResponse.tasks);
          tagsArray.setTags(itemsResponse.tags);

          $scope.tasks = tasksArray.getTasks();
          $scope.projects = tasksArray.getProjects();

          $scope.project = itemsArray.getItemByUuid(tasksArray.getProjects(), $routeParams.uuid);
          $scope.subtasks = itemsArray.getItemsByUuid(tasksArray.getSubtasks(), $scope.project.uuid);

        }, function(error) {
        });
      }

      $scope.addNew = function() {
        $location.path('/my/tasks/new/');
      };

      $scope.setActiveItem = function(tag) {
        activeItem.setItem(tag);
      };

    }]);
  }());
