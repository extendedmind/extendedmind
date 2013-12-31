/*global angular */
'use strict';

function HomeController($scope, date, errorHandler, filterService, itemsArray, tagsArray, tasksArray, userPrefix) {
  $scope.items = itemsArray.getItems();
  $scope.tags = tagsArray.getTags();
  $scope.tasks = tasksArray.getTasks();

  $scope.filterService = filterService;
  $scope.prefix = userPrefix.getPrefix();
  $scope.errorHandler = errorHandler;

  $scope.dates = date.week();
}

angular.module('em.app').controller('HomeController', HomeController);
HomeController.$inject = ['$scope', 'date', 'errorHandler', 'filterService', 'itemsArray', 'tagsArray', 'tasksArray', 'userPrefix'];
