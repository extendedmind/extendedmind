"use strict";

emControllers.controller('TasksController', ['$scope', 'Tasks',
function($scope, Tasks) {
  $scope.tasks = Tasks.getUserTasks();
}]);
