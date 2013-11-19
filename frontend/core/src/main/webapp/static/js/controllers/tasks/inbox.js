/*jslint white: true */
'use strict';

function InboxController($scope, errorHandler, filterService, itemsArray, notesArray, slide, tagsArray, tasksArray, userPrefix) {

  $scope.slide = slide;

  $scope.items = itemsArray.getItems();
  $scope.tasks = tasksArray.getTasks();
  $scope.contexts = tagsArray.getTags();
  $scope.notes = notesArray.getNotes();

  $scope.filterService = filterService;
  $scope.prefix = userPrefix.getPrefix();
  $scope.errorHandler = errorHandler;

  $scope.gotoHome = function() {
    $scope.slide = 0;
  };

  $scope.prevSlide = function() {
    $scope.slide--;
  };

  $scope.nextSlide = function() {
    $scope.slide++;
  };
}

InboxController.$inject = ['$scope', 'errorHandler', 'filterService', 'itemsArray', 'notesArray', 'slide', 'tagsArray', 'tasksArray', 'userPrefix'];
angular.module('em.app').controller('InboxController', InboxController);
