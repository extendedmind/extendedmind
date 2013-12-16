/*global angular */
'use strict';

function NotesSlidesController($location, $scope, errorHandler, filterService, itemsArray, notesArray, tagsArray, tasksArray, userPrefix) {

  $scope.notes = notesArray.getNotes();
  $scope.items = itemsArray.getItems();
  $scope.tasks = tasksArray.getTasks();
  $scope.contexts = tagsArray.getTags();

  $scope.filterService = filterService;
  $scope.prefix = userPrefix.getPrefix();
  $scope.errorHandler = errorHandler;

}

NotesSlidesController.$inject = ['$location', '$scope', 'errorHandler', 'filterService', 'itemsArray', 'notesArray', 'tagsArray', 'tasksArray', 'userPrefix'];
angular.module('em.app').controller('NotesSlidesController', NotesSlidesController);
