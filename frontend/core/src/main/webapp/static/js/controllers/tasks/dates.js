/*global angular */
'use strict';

function DatesController($scope, date, errorHandler, filterService, itemsArray, tagsArray, tasksArray, userPrefix) {
  $scope.tasks = tasksArray.getTasks();
  $scope.tags = tagsArray.getTags();
  $scope.items = itemsArray.getItems();

  $scope.filterService = filterService;
  $scope.prefix = userPrefix.getPrefix();
  $scope.errorHandler = errorHandler;

  $scope.dates = date.week();
  $scope.date = date.today();
}

DatesController.$inject = ['$scope', 'date', 'errorHandler', 'filterService', 'itemsArray', 'tagsArray', 'tasksArray', 'userPrefix'];
angular.module('em.app').controller('DatesController', DatesController);
