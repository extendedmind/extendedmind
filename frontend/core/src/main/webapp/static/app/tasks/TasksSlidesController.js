/*global angular */
'use strict';

function TasksSlidesController($scope, DateService, ErrorHandlerService, FilterService, itemsArray, TagsService, tasksArray, OwnerService) {
  $scope.tasks = tasksArray.getTasks();
  $scope.tags = TagsService.getTags();
  $scope.items = itemsArray.getItems();

  $scope.filterService = FilterService;
  $scope.prefix = OwnerService.getPrefix();
  $scope.errorHandler = ErrorHandlerService;

  $scope.dates = DateService.week();
}

TasksSlidesController.$inject = ['$scope', 'DateService', 'ErrorHandlerService', 'FilterService', 'itemsArray', 'TagsService', 'tasksArray', 'OwnerService'];
angular.module('em.app').controller('TasksSlidesController', TasksSlidesController);
