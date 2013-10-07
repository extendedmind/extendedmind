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
          $scope.newTask.relationships = {};
          $scope.newTask.relationships.parentTask = $scope.parentTask.uuid;
        }

        tasksRequest.putTask($scope.newTask, function(putTaskResponse) {

          tasksResponse.putTaskContent($scope.newTask, putTaskResponse);
          tasksArray.putNewTask($scope.newTask);
          $scope.newTask = {};

        }, function(putTaskResponse) {
        });
      };

      $scope.cancelEdit = function() {
        window.history.back();
      };
    }]);
  }());
