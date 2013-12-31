/*global angular */
'use strict';

function HomeController($scope, DateService, errorHandler, FilterService, itemsArray, tagsArray, tasksArray, userPrefix) {
  $scope.items = itemsArray.getItems();
  $scope.tags = tagsArray.getTags();
  $scope.tasks = tasksArray.getTasks();

  $scope.filterService = FilterService;
  $scope.prefix = userPrefix.getPrefix();
  $scope.errorHandler = errorHandler;

  $scope.dates = DateService.week();
}

angular.module('em.app').controller('HomeController', HomeController);
HomeController.$inject = ['$scope', 'DateService', 'errorHandler', 'FilterService', 'itemsArray', 'tagsArray', 'tasksArray', 'userPrefix'];
