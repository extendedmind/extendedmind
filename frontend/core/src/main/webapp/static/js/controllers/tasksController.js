/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('TasksController', ['$scope', 'itemsFactory', 'tasksRequest',
    function($scope, itemsFactory, tasksRequest) {
      $scope.tasksListFilter = true;
      $scope.tasks = itemsFactory.getUserTasks();

      $scope.addNewTask = function() {
        tasksRequest.putTask($scope.newTask, function(success) {
        }, function(error) {
        });
      };

    }]);
  }());
