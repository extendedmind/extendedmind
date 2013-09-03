/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('TasksController', ['$scope', 'errorHandler', 'itemsRequest', 'tasksArray', 'tasksRequest', 'tasksResponse',
    function($scope, errorHandler, itemsRequest, tasksArray, tasksRequest, tasksResponse) {

      $scope.errorHandler = errorHandler;

      itemsRequest.getItems(function(itemsResponse) {
        tasksArray.setTasks(itemsResponse.tasks);

        $scope.tasks = tasksArray.getTasks();
      }, function(error) {
      });

      $scope.tasksListFilter = true;

      $scope.addNewTask = function(task) {
        tasksRequest.putTask($scope.newTask, function(putTaskResponse) {
          tasksResponse.putTaskContent($scope.newTask, putTaskResponse);
          tasksArray.putNewTask($scope.newTask);
          $scope.newTask = {};
        }, function(putTaskResponse) {
        });
      };

      $scope.taskChecked = function(task) {
        if (task.done) {
          tasksRequest.completeTask(task, function(completeTaskResponse) {
            tasksResponse.putTaskContent(task, completeTaskResponse);
          }, function(completeTaskResponse) {
          });
        }
        // TODO: Uncomplete done task
      };
    }]);
  }());
