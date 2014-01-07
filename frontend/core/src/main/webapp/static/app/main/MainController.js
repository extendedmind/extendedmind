/*global angular */
'use strict';

// Controller for all main slides
// Holds a reference to all the item arrays, these are needed anyway to get the
// home and inbox to work.
function MainController($scope, itemsArray, TagsService, tasksArray, OwnerService) {
  $scope.items = itemsArray.getItems();
  $scope.tasks = tasksArray.getTasks();
  $scope.contexts = TagsService.getTags();
  $scope.prefix = OwnerService.getPrefix();
}

MainController.$inject = ['$scope', 'itemsArray', 'TagsService', 'tasksArray', 'OwnerService'];
angular.module('em.app').controller('MainController', MainController);
