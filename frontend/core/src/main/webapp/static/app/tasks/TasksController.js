/*global angular */
'use strict';

function TasksController($location, $scope, OwnerService) {

  $scope.editTaskTitle = function(task) {
    console.log("editTaskTitle: " + task.title);
  }

  $scope.editTask = function(task) {
    console.log("editItem");
    $location.path(OwnerService.getPrefix() + '/tasks/edit/' + task.uuid);
  }
}

TasksController.$inject = ['$location', '$scope', 'OwnerService'];
angular.module('em.app').controller('TasksController', TasksController);
