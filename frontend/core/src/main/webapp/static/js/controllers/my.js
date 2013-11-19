/*jslint white: true */
'use strict';

function MyController($scope, errorHandler, filterService, itemsArray, notesArray, slide, tagsArray, tasksArray, userPrefix) {

  $scope.slide = slide;

  $scope.items = itemsArray.getItems();
  $scope.notes = notesArray.getNotes();
  $scope.tags = tagsArray.getTags();
  $scope.tasks = tasksArray.getTasks();

  $scope.prefix = userPrefix.getPrefix();
  $scope.filterService = filterService;
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

MyController.$inject = ['$scope', 'errorHandler', 'filterService', 'itemsArray', 'notesArray', 'slide', 'tagsArray', 'tasksArray', 'userPrefix'];
angular.module('em.app').controller('MyController', MyController);
