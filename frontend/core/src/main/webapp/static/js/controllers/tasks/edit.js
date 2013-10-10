/*global angular*/

( function() {'use strict';

    function EditTaskController($location, $routeParams, $scope, activeItem, errorHandler, itemsArray, itemsRequest, tagsArray, tasksArray, tasksRequest, tasksResponse) {

      $scope.errorHandler = errorHandler;

      if (activeItem.getItem()) {

        $scope.projects = tasksArray.getProjects();
        $scope.task = activeItem.getItem();

        if ($scope.task.relationships) {
          if ($scope.task.relationships.parentTask) {
            $scope.parentTask = tasksArray.getProjectByUuid($scope.task.relationships.parentTask);
          }
        }

      } else {

        itemsRequest.getItems(function(itemsResponse) {

          itemsArray.setItems(itemsResponse.items);
          tasksArray.setTasks(itemsResponse.tasks);
          tagsArray.setTags(itemsResponse.tags);

          $scope.projects = tasksArray.getProjects();
          $scope.task = tasksArray.getTaskByUuid($routeParams.uuid);

          if ($scope.task.relationships) {
            if ($scope.task.relationships.parentTask) {
              $scope.parentTask = tasksArray.getProjectByUuid($scope.task.relationships.parentTask);
            }
          }

        }, function(error) {
        });
      }

      $scope.editTask = function() {

        if ($scope.parentTask) {

          tasksArray.setSubtask($scope.task);

          if (!$scope.task.relationships) {
            $scope.task.relationships = {};
          }

          $scope.task.relationships.parentTask = $scope.parentTask.uuid;

        } else {

          if ($scope.task.relationships.parentTask) {
            tasksArray.removeSubtask($scope.task);
            tasksArray.deleteTaskProperty($scope.task.relationships, 'parentTask');
          }
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
