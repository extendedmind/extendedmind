/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('TasksController', ['$scope', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse',
    function($scope, activeItem, errorHandler, itemsArray, itemsRequest, tagsArray, tasksArray, tasksRequest, tasksResponse) {

      $scope.errorHandler = errorHandler;

      itemsRequest.getItems(function(itemsResponse) {

        itemsArray.setItems(itemsResponse.items);
        tagsArray.setTags(itemsResponse.tags);
        tasksArray.setTasks(itemsResponse.tasks);

        $scope.tags = tagsArray.getTags();
        $scope.tasks = tasksArray.getTasks();

      }, function(error) {
      });

      $scope.tasksListFilter = true;

      $scope.taskChecked = function(index) {
        $scope.task = $scope.tasks[index];

        if ($scope.task.done) {

          tasksRequest.completeTask($scope.task, function(completeTaskResponse) {
            tasksResponse.putTaskContent($scope.task, completeTaskResponse);
          }, function(completeTaskResponse) {
          });

        } else {

          tasksRequest.uncompleteTask($scope.task, function(uncompleteTaskResponse) {
            tasksResponse.deleteTaskProperty($scope.task, 'completed');
          }, function(uncompleteTaskResponse) {

          });
        }
      };

      $scope.setActiveTag = function(tag) {
        activeItem.setItem(tag);
      };
    }]);
  }());
