/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('TasksController', ['$scope', 'itemsFactory', 'tasksArray', 'tasksRequest', 'tasksResponse',
    function($scope, itemsFactory, tasksArray, tasksRequest, tasksResponse) {
      $scope.tasksListFilter = true;
      $scope.tasks = itemsFactory.getUserTasks();

      $scope.addNewTask = function() {
        tasksRequest.putTask($scope.newTask, function(putTaskResponse) {
          tasksResponse.putTaskContent($scope.newTask, putTaskResponse);
          tasksArray.putNewTask($scope.newTask);
        }, function(putTaskResponse) {
        });
      };

    }]);
  }());
