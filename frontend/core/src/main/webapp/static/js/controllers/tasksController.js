/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('TasksController', ['$scope', 'itemsFactory',
    function($scope, itemsFactory) {
      $scope.tasksListFilter = true;
      $scope.tasks = itemsFactory.getUserTasks();
    }]);
  }());
