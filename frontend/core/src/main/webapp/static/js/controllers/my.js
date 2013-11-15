'use strict';

function MyController($scope, errorHandler, itemsArray, notesArray, tagsArray, tasksArray, userPrefix) {

  $scope.items = itemsArray.getItems();
  $scope.notes = notesArray.getNotes();
  $scope.tags = tagsArray.getTags();
  $scope.tasks = tasksArray.getTasks();

  $scope.prefix = userPrefix.getPrefix();
  $scope.errorHandler = errorHandler;
}

MyController.$inject = ['$scope', 'errorHandler', 'itemsArray', 'notesArray', 'tagsArray', 'tasksArray', 'userPrefix'];
angular.module('em.app').controller('MyController', MyController);
