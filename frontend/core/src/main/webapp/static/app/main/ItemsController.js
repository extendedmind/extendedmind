'use strict';

function ItemsController($scope, $location, $routeParams, UserSessionService, ItemsService) {
  
  if (!$scope.item){
    if ($location.path().indexOf('/edit/' != -1) || $location.path().indexOf('/new' != -1)){
      if ($routeParams.uuid) {
        $scope.item = ItemsService.getItemByUUID($routeParams.uuid, UserSessionService.getActiveUUID());
      }else{
        $scope.item = {};
      }
    }
  }

  $scope.saveItem = function(item) {
    ItemsService.saveItem(item, UserSessionService.getActiveUUID());
    window.history.back();
  };

  $scope.cancelEdit = function() {
    window.history.back();
  };

  $scope.editItemTitle = function(item) {
    ItemsService.saveItem(item, UserSessionService.getActiveUUID());
  };

  $scope.editItem  = function(item) {
    $location.path($scope.ownerPrefix + '/items/edit/' + item.uuid);
  };

  $scope.deleteItem = function(item) {
    ItemsService.deleteItem(item, UserSessionService.getActiveUUID());
  };

  $scope.itemToTask = function(item) {
    $scope.itemType = 'task';
    $scope.task = item;
  };

  $scope.taskEditMore = function(task) {
    $location.path($scope.ownerPrefix + '/tasks/edit/' + task.uuid);
  };

  $scope.taskEditDone = function(task) {
    ItemsService.itemToTask(task, UserSessionService.getActiveUUID());
  };

  $scope.itemToNote = function(item) {
    $scope.itemType = 'note';
    $scope.note = item;
  };

  $scope.itemToNoteMore = function(note) {
    $location.path($scope.ownerPrefix + '/notes/edit/' + note.uuid);
  };

  $scope.noteEditDone = function(note) {
    ItemsService.itemToNote(note, UserSessionService.getActiveUUID());
  };

  $scope.addNew = function() {
    $location.path($scope.ownerPrefix + '/items/new');
  };
}

ItemsController.$inject = ['$scope', '$location', '$routeParams', 'UserSessionService', 'ItemsService'];
angular.module('em.app').controller('ItemsController', ItemsController);
