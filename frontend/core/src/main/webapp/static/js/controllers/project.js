/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('ProjectController', ['$scope', '$routeParams', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'tagsArray', 'tasksArray',
    function($scope, $routeParams, activeItem, errorHandler, itemsArray, itemsRequest, tagsArray, tasksArray) {

      $scope.errorHandler = errorHandler;

      if (activeItem.getItem()) {
        $scope.project = activeItem.getItem();

        $scope.subtasks = itemsArray.getItemsByUuid(tasksArray.getSubtasks(), $scope.project.uuid);
      } else {
        itemsRequest.getItems(function(itemsResponse) {

          itemsArray.setItems(itemsResponse.items);
          tagsArray.setTags(itemsResponse.tags);

          tasksArray.setTasks(itemsResponse.tasks);
          $scope.tasks = tasksArray.getTasks();

          tasksArray.setProjects($scope.tasks);
          $scope.projects = tasksArray.getProjects();
          tasksArray.setSubtasks($scope.tasks);

          $scope.project = itemsArray.getItemByUuid(tasksArray.getProjects(), $routeParams.uuid);
          $scope.subtasks = itemsArray.getItemsByUuid(tasksArray.getSubtasks(), $scope.project.uuid);

        }, function(error) {
        });
      }

      $scope.setActiveItem = function(tag) {
        activeItem.setItem(tag);
      };

    }]);
  }());
