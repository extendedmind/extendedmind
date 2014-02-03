/*global angular */
'use strict';

function ItemsController($scope, $location, $routeParams, ItemsService) {
  
  if (!$scope.item){
    if ($location.path().indexOf('/edit/' != -1) || $location.path().indexOf('/new' != -1)){
      if ($routeParams.uuid) {
        $scope.item = ItemsService.getItemByUUID($routeParams.uuid);
      }else{
        $scope.item = {};
      }
    }
  }

  $scope.saveItem = function(item) {
    ItemsService.saveItem(item);
    window.history.back();
  };

  $scope.cancelEdit = function() {
    window.history.back();
  };

  $scope.editItemTitle = function(item) {
    ItemsService.saveItem(item);
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
    ItemsService.deleteItem(item);
  };

  $scope.itemToTask = function(item) {
    $scope.itemType = 'task';
    ItemsService.itemToTask(item);
    $scope.task = item;
  };

  $scope.taskEditMore = function(task) {
    $location.path($scope.prefix + '/tasks/edit/' + task.uuid);
  };

  $scope.taskEditDone = function(task) {
    cleanContext(task);
    ItemsService.completeItemToTask(task);
  };

  var cleanContext = function(task) {
    if (task.relationships && task.relationships.context){
      task.relationships.tags = [task.relationships.context];
      delete task.relationships.context;
    }
  };

  $scope.addNew = function() {
    $location.path($scope.prefix + '/items/new');
  };

}

ItemsController.$inject = ['$scope', '$location', '$routeParams', 'ItemsService'];
angular.module('em.app').controller('ItemsController', ItemsController);
