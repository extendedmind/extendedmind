/*global angular */
'use strict';

function ProjectsController($scope, date, ErrorHandlerService, FilterService, itemsArray, TagsService, tasksArray, OwnerService) {
  $scope.tasks = tasksArray.getTasks();
  $scope.tags = TagsService.getTags();
  $scope.items = itemsArray.getItems();

  $scope.filterService = FilterService;
  $scope.prefix = OwnerService.getPrefix();
  $scope.errorHandler = ErrorHandlerService;

  $scope.dates = date.week();
  $scope.date = date.today();
}

ProjectsController.$inject = ['$scope', 'date', 'ErrorHandlerService', 'FilterService', 'itemsArray', 'TagsService', 'tasksArray', 'OwnerService'];
angular.module('em.app').controller('ProjectsController', ProjectsController);
