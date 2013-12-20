/*global angular */
'use strict';

function InboxController($scope, date, errorHandler, filterService, itemsArray, notesArray, tagsArray, tasksArray, userPrefix) {
  $scope.items = itemsArray.getItems();
  $scope.tasks = tasksArray.getTasks();
  $scope.contexts = tagsArray.getTags();
  $scope.notes = notesArray.getNotes();

  $scope.filterService = filterService;
  $scope.prefix = userPrefix.getPrefix();
  $scope.errorHandler = errorHandler;

  $scope.dates = date.week();
}

InboxController.$inject = ['$scope', 'date', 'errorHandler', 'filterService', 'itemsArray', 'notesArray', 'tagsArray', 'tasksArray', 'userPrefix'];
angular.module('em.app').controller('InboxController', InboxController);
