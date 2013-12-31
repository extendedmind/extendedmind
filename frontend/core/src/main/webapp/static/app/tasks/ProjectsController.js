/*global angular */
'use strict';

function ProjectsController($scope, date, errorHandler, FilterService, itemsArray, tagsArray, tasksArray, userPrefix) {
  $scope.tasks = tasksArray.getTasks();
  $scope.tags = tagsArray.getTags();
  $scope.items = itemsArray.getItems();

  $scope.filterService = FilterService;
  $scope.prefix = userPrefix.getPrefix();
  $scope.errorHandler = errorHandler;

  $scope.dates = date.week();
  $scope.date = date.today();
}

ProjectsController.$inject = ['$scope', 'date', 'errorHandler', 'FilterService', 'itemsArray', 'tagsArray', 'tasksArray', 'userPrefix'];
angular.module('em.app').controller('ProjectsController', ProjectsController);
