/*jslint white: true */
'use strict';

function TasksController($location, $rootScope, $scope, errorHandler, filterService, itemsArray, notesArray, slide, tagsArray, tasksArray, userPrefix) {

  $scope.slide = slide;

  $scope.tasks = tasksArray.getTasks();
  $scope.tags = tagsArray.getTags();
  $scope.items = itemsArray.getItems();
  $scope.notes = notesArray.getNotes();

  $scope.filterService = filterService;
  $scope.prefix = userPrefix.getPrefix();
  $scope.errorHandler = errorHandler;
}

TasksController.$inject = ['$location', '$rootScope', '$scope', 'errorHandler', 'filterService', 'itemsArray', 'notesArray', 'slide', 'tagsArray', 'tasksArray', 'userPrefix'];
angular.module('em.app').controller('TasksController', TasksController);
