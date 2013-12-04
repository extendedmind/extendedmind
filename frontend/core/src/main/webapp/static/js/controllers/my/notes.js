/*jslint white: true */
'use strict';

function NotesController($location, $scope, errorHandler, filterService, itemsArray, notesArray, tagsArray, tasksArray, userPrefix) {

  $scope.notes = notesArray.getNotes();
  $scope.items = itemsArray.getItems();
  $scope.tasks = tasksArray.getTasks();
  $scope.contexts = tagsArray.getTags();

  $scope.filterService = filterService;
  $scope.prefix = userPrefix.getPrefix();
  $scope.errorHandler = errorHandler;

  $scope.addNew = function() {
    $location.path(userPrefix.getPrefix() + '/notes/new');
  };
}

NotesController.$inject = ['$location', '$scope', 'errorHandler', 'filterService', 'itemsArray', 'notesArray', 'tagsArray', 'tasksArray', 'userPrefix'];
angular.module('em.app').controller('NotesController', NotesController);
