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

      $scope.taskChecked = function(task) {

        if (task.done) {

          tasksRequest.completeTask(task, function(completeTaskResponse) {
            tasksResponse.putTaskContent(task, completeTaskResponse);
          }, function(completeTaskResponse) {
          });
        }
        // TODO: Uncomplete done task
      };

      $scope.setActiveTag = function(tag) {
        activeItem.setItem(tag);
      };
    }]);
  }());
