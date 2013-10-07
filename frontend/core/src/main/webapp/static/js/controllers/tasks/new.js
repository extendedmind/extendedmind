/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NewTaskController', ['$location', '$routeParams', '$scope', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse',
    function($location, $routeParams, $scope, activeItem, errorHandler, itemsArray, itemsRequest, tagsArray, tasksArray, tasksRequest, tasksResponse) {

      $scope.errorHandler = errorHandler;

      itemsRequest.getItems(function(itemsResponse) {

        itemsArray.setItems(itemsResponse.items);
        tasksArray.setTasks(itemsResponse.tasks);
        tagsArray.setTags(itemsResponse.tags);

        $scope.projects = tasksArray.getProjects();

      }, function(error) {
      });

      $scope.editTask = function() {

        if ($scope.parentTask) {
          $scope.task.relationships = {};
          $scope.task.relationships.parentTask = $scope.parentTask.uuid;
        }

        tasksRequest.putTask($scope.task, function(putTaskResponse) {

          tasksResponse.putTaskContent($scope.task, putTaskResponse);
          tasksArray.putNewTask($scope.task);
          $scope.task = {};

        }, function(putTaskResponse) {
        });
      };

      $scope.cancelEdit = function() {
        window.history.back();
      };
    }]);
  }());
