/*jslint white: true */
'use strict';

function TasksController($scope, errorHandler, filterService, itemsArray, notesArray, tagsArray, tasksArray, userPrefix) {

  $scope.tasks = tasksArray.getTasks();
  $scope.tags = tagsArray.getTags();
  $scope.items = itemsArray.getItems();
  $scope.notes = notesArray.getNotes();

  $scope.filterService = filterService;
  $scope.prefix = userPrefix.getPrefix();
  $scope.errorHandler = errorHandler;
}

TasksController.$inject = ['$scope', 'errorHandler', 'filterService', 'itemsArray', 'notesArray', 'tagsArray', 'tasksArray', 'userPrefix'];
angular.module('em.app').controller('TasksController', TasksController);
