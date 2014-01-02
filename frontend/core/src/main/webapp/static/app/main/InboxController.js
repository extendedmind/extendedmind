/*global angular */
'use strict';

function InboxController($scope, DateService, ErrorHandlerService, FilterService, itemsArray, tagsArray, tasksArray, OwnerService) {
  $scope.items = itemsArray.getItems();
  $scope.tasks = tasksArray.getTasks();
  $scope.contexts = tagsArray.getTags();

  $scope.filterService = FilterService;
  $scope.prefix = OwnerService.getPrefix();
  $scope.errorHandler = ErrorHandlerService;

  $scope.dates = DateService.week();
}

InboxController.$inject = ['$scope', 'DateService', 'ErrorHandlerService', 'FilterService', 'itemsArray', 'tagsArray', 'tasksArray', 'OwnerService'];
angular.module('em.app').controller('InboxController', InboxController);
