/*global angular */
'use strict';

// Controller for all main slides
// Holds a reference to all the item arrays, these are needed anyway to get the
// home and inbox to work.
function MainController($scope, DateService, itemsArray, TagsService, tasksArray, OwnerService, FilterService) {
  $scope.items = itemsArray.getItems();
  $scope.tasks = tasksArray.getTasks();
  $scope.contexts = TagsService.getTags();
  $scope.prefix = OwnerService.getPrefix();
  $scope.filterService = FilterService;
  $scope.dates = DateService.week();
  $scope.date = DateService.today();

}

MainController.$inject = ['$scope', 'DateService', 'itemsArray', 'TagsService', 'tasksArray', 'OwnerService', 'FilterService'];
angular.module('em.app').controller('MainController', MainController);
