/*global angular */
'use strict';

function InboxController($scope, DateService, errorHandler, FilterService, itemsArray, tagsArray, tasksArray, userPrefix) {
  $scope.items = itemsArray.getItems();
  $scope.tasks = tasksArray.getTasks();
  $scope.contexts = tagsArray.getTags();

  $scope.filterService = FilterService;
  $scope.prefix = userPrefix.getPrefix();
  $scope.errorHandler = errorHandler;

  $scope.dates = DateService.week();
}

InboxController.$inject = ['$scope', 'DateService', 'errorHandler', 'FilterService', 'itemsArray', 'tagsArray', 'tasksArray', 'userPrefix'];
angular.module('em.app').controller('InboxController', InboxController);
