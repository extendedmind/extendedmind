/*global angular */
'use strict';

function HomeController($scope, DateService, ErrorHandlerService, FilterService, itemsArray, TagsService, tasksArray, OwnerService) {
  $scope.items = itemsArray.getItems();
  $scope.tags = TagsService.getTags();
  $scope.tasks = tasksArray.getTasks();

  $scope.filterService = FilterService;
  $scope.prefix = OwnerService.getPrefix();
  $scope.errorHandler = ErrorHandlerService;

  $scope.dates = DateService.week();
}

angular.module('em.app').controller('HomeController', HomeController);
HomeController.$inject = ['$scope', 'DateService', 'ErrorHandlerService', 'FilterService', 'itemsArray', 'TagsService', 'tasksArray', 'OwnerService'];
