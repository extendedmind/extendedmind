/*global angular */
'use strict';

function HomeController($scope, date, errorHandler, filterService, itemsArray, notesArray, tagsArray, tasksArray, userPrefix) {
  $scope.items = itemsArray.getItems();
  $scope.notes = notesArray.getNotes();
  $scope.tags = tagsArray.getTags();
  $scope.tasks = tasksArray.getTasks();

  $scope.filterService = filterService;
  $scope.prefix = userPrefix.getPrefix();
  $scope.errorHandler = errorHandler;

  $scope.dates = date.week();
}

angular.module('em.app').controller('HomeController', HomeController);
HomeController.$inject = ['$scope', 'date', 'errorHandler', 'filterService', 'itemsArray', 'notesArray', 'tagsArray', 'tasksArray', 'userPrefix'];
