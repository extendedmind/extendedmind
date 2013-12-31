/*global angular */
'use strict';

function TasksSlidesController($scope, DateService, errorHandler, FilterService, itemsArray, tagsArray, tasksArray, userPrefix) {
  $scope.tasks = tasksArray.getTasks();
  $scope.tags = tagsArray.getTags();
  $scope.items = itemsArray.getItems();

  $scope.filterService = FilterService;
  $scope.prefix = userPrefix.getPrefix();
  $scope.errorHandler = errorHandler;

  $scope.dates = DateService.week();
}

TasksSlidesController.$inject = ['$scope', 'DateService', 'errorHandler', 'FilterService', 'itemsArray', 'tagsArray', 'tasksArray', 'userPrefix'];
angular.module('em.app').controller('TasksSlidesController', TasksSlidesController);
