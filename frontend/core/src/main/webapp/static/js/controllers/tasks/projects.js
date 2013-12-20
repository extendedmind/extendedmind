/*global angular */
'use strict';

function ProjectsController($scope, date, errorHandler, filterService, itemsArray, notesArray, tagsArray, tasksArray, userPrefix) {
  $scope.tasks = tasksArray.getTasks();
  $scope.tags = tagsArray.getTags();
  $scope.items = itemsArray.getItems();
  $scope.notes = notesArray.getNotes();

  $scope.filterService = filterService;
  $scope.prefix = userPrefix.getPrefix();
  $scope.errorHandler = errorHandler;

  $scope.dates = date.week();
  $scope.date = date.today();
}

ProjectsController.$inject = ['$scope', 'date', 'errorHandler', 'filterService', 'itemsArray', 'notesArray', 'tagsArray', 'tasksArray', 'userPrefix'];
angular.module('em.app').controller('ProjectsController', ProjectsController);
