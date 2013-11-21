/*jslint white: true */
'use strict';

function TasksController($location, $rootScope, $scope, errorHandler, filterService, slide, tagsArray, tasksArray, userPrefix) {

  $scope.slide = slide;

  $scope.tags = tagsArray.getTags();
  $scope.tasks = tasksArray.getTasks();

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

  $scope.addNew = function() {
    $location.path($scope.prefix + '/tasks/new');
  };
}

TasksController.$inject = ['$location', '$rootScope', '$scope', 'errorHandler', 'filterService', 'slide', 'tagsArray', 'tasksArray', 'userPrefix'];
angular.module('em.app').controller('TasksController', TasksController);
