/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('TasksController', ['$scope', 'itemsFactory', 'tasksArray', 'tasksRequest', 'tasksResponse', 'userItemsFactory',
    function($scope, itemsFactory, tasksArray, tasksRequest, tasksResponse, userItemsFactory) {

      userItemsFactory.getItems(function() {
        $scope.tasks = itemsFactory.getUserTasks();
      }, function(error) {
      });

      $scope.tasksListFilter = true;

      $scope.addNewTask = function() {
        tasksRequest.putTask($scope.newTask, function(putTaskResponse) {
          tasksResponse.putTaskContent($scope.newTask, putTaskResponse);
          tasksArray.putNewTask($scope.newTask);
        }, function(putTaskResponse) {
        });
      };

      $scope.taskChecked = function(task) {
        if (task.done) {
          tasksRequest.completeTask(task, function(completeTaskResponse) {
          }, function(completeTaskResponse) {
          });
        }
      };

    }]);
  }());
