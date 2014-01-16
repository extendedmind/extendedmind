/*global angular */
'use strict';

function ItemsController($location, $scope, $timeout, itemsArray, itemsRequest, tasksRequest, TagsService, tasksArray, OwnerService, FilterService) {
  
  $scope.items = itemsArray.getItems();
  $scope.tasks = tasksArray.getTasks();
  $scope.contexts = TagsService.getTags();
  $scope.prefix = OwnerService.getPrefix();
  $scope.filterService = FilterService;

  $scope.editItemTitle = function(item) {
    itemsRequest.putExistingItem(item);
  }

  $scope.editItem  = function(item) {
    $location.path($scope.prefix + '/items/edit/' + item.uuid);
  }

  function clearCompletedText() {
    $timeout(function() {
      $scope.completed = '';
    }, 2000);
  }

  $scope.deleteItem = function(item) {
    itemsRequest.deleteItem(item);
  };

  $scope.itemToTask = function(item) {
    $scope.itemType = 'task';
    tasksRequest.itemToTask(item).then(function() {
      $scope.task = item;
    });
  };

  $scope.taskEditMore = function(task) {
    $location.path($scope.prefix + '/tasks/edit/' + task.uuid);
  };

  $scope.taskEditDone = function(task) {
    cleanContext(task);
    tasksRequest.itemToTaskDone(task);
  };

  var cleanContext = function(task) {
    if (task.relationships && task.relationships.context){
      task.relationships.tags = [task.relationships.context];
      delete task.relationships.context;
    }
  }

}

ItemsController.$inject = ['$location', '$scope', '$timeout', 'itemsArray', 'itemsRequest', 'tasksRequest', 'TagsService', 'tasksArray', 'OwnerService', 'FilterService'];
angular.module('em.app').controller('ItemsController', ItemsController);
