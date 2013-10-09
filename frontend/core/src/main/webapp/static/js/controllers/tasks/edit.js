/*global angular*/

( function() {'use strict';

    function EditTaskController($location, $routeParams, $scope, activeItem, errorHandler, itemsArray, itemsRequest, tagsArray, tasksArray, tasksRequest, tasksResponse) {

      $scope.errorHandler = errorHandler;

      if (activeItem.getItem()) {

        $scope.task = activeItem.getItem();
        $scope.projects = tasksArray.getProjects();

      } else {

        itemsRequest.getItems(function(itemsResponse) {

          itemsArray.setItems(itemsResponse.items);
          tasksArray.setTasks(itemsResponse.tasks);
          tagsArray.setTags(itemsResponse.tags);

          $scope.projects = tasksArray.getProjects();
          $scope.task = itemsArray.getItemByUuid(tasksArray.getTasks(), $routeParams.uuid);

        }, function(error) {
        });
      }

      $scope.editTask = function() {

        if ($scope.parentTask) {
          $scope.task.relationships = {};
          $scope.task.relationships.parentTask = $scope.parentTask.uuid;
        }

        tasksRequest.putExistingTask($scope.task, function(putExistingTaskResponse) {

          tasksResponse.putTaskContent($scope.task, putExistingTaskResponse);
          $scope.task = {};
          activeItem.setItem();

        }, function(putExistingTaskResponse) {
        });

        window.history.back();
      };

      $scope.cancelEdit = function() {
        window.history.back();
      };
    }


    EditTaskController.$inject = ['$location', '$routeParams', '$scope', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse'];
    angular.module('em.app').controller('EditTaskController', EditTaskController);
  }());
