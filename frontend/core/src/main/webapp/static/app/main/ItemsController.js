'use strict';

function ItemsController($scope, $timeout, UISessionService, ItemsService, AnalyticsService) {

  $scope.resetInboxEdit = function(){
    $scope.itemType = 'item';
  };

  $scope.saveItem = function(item) {
    if (item.uuid){
      AnalyticsService.do('saveItem', 'new');
    }else{
      AnalyticsService.do('saveItem', 'existing');
    }
    ItemsService.saveItem(item, UISessionService.getActiveUUID());
    if (!$scope.isFeatureActive('inbox')) {
      UISessionService.changeFeature('inbox', item);
    }
  };

  $scope.addNewItem = function addNewItem(newItem) {
    if (newItem.title && newItem.title.length > 0) {
      var newItemToSave = {title: newItem.title};
      delete newItem.title;
      ItemsService.saveItem(newItemToSave, UISessionService.getActiveUUID());
    }
  };

  $scope.editItemFields = function(item) {
    AnalyticsService.do('editItemFields');
    ItemsService.saveItem(item, UISessionService.getActiveUUID());
    $scope.resetInboxEdit();
  };

  $scope.itemDetails = {visible: false};
  $scope.editItem  = function(/*item*/) {
    $scope.itemDetails.visible = !$scope.itemDetails.visible;
  };

  $scope.deleteItem = function(item) {
    AnalyticsService.do('deleteItem');
    ItemsService.deleteItem(item, UISessionService.getActiveUUID());
    $scope.resetInboxEdit();
  };

  $scope.itemToTask = function(item) {
    $scope.itemType = 'task';
    $scope.task = item;
  };

  $scope.taskEditDone = function(task) {
    AnalyticsService.do('itemToTaskDone');
    ItemsService.itemToTask(task, UISessionService.getActiveUUID());
    $scope.resetInboxEdit();
  };

  $scope.itemToNote = function(item) {
    $scope.itemType = 'note';
    $scope.note = item;
  };

  $scope.itemToList = function(item) {
    AnalyticsService.do('itemToList');
    ItemsService.itemToList(item, UISessionService.getActiveUUID());
    $scope.resetInboxEdit();
  };

  $scope.noteEditDone = function(note) {
    AnalyticsService.do('itemToNoteDone');
    ItemsService.itemToNote(note, UISessionService.getActiveUUID());
    $scope.resetInboxEdit();
  };
}

ItemsController.$inject = ['$scope', '$timeout', 'UISessionService', 'ItemsService', 'AnalyticsService'];
angular.module('em.app').controller('ItemsController', ItemsController);
