'use strict';

function ItemsController($location, $routeParams, $scope, $timeout, UISessionService, ItemsService, AnalyticsService) {

  var featureChangedCallback = function featureChangedCallback(newFeature, oldFeature){
    if (newFeature.name === 'itemEdit'){
      if (newFeature.data){
        $scope.item = newFeature.data;
      }else{
        $scope.item = {};
      }
    }
  }
  UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'ItemsController');

  var resetInboxEdit = function(){
    $scope.itemType = 'item';
  }

  $scope.omnibarHasText = function omnibarHasText() {
    return $scope.omnibarText.title && $scope.omnibarText.title.length !== 0;
  };

  $scope.searchText = {};
  $scope.isSearchActive = function isSearchActive() {
    return $scope.searchText.delayed && $scope.searchText.delayed.length > 1;
  }
  $scope.$watch('omnibarText.title', function(newTitle, oldTitle) {
    $scope.searchText.current = newTitle;
    if (newTitle && newTitle.length > 1){
      // Use a delayed update for search
      $timeout(function(){
        if ($scope.searchText.current === newTitle){
          $scope.searchText.delayed = newTitle;
        }
      }, 700);
    }else{
      $scope.searchText.delayed = undefined;
    }
  });

  $scope.saveItem = function(item) {
    if (item.uuid){
      AnalyticsService.do('saveItem', 'new');
    }else{
      AnalyticsService.do('saveItem', 'existing');
    }
    ItemsService.saveItem(item, UISessionService.getActiveUUID());
    if (!$scope.isFeatureActive('inbox')) {
      UISessionService.changeFeature({name: 'inbox', data: item});
    }
  };

  $scope.addNewItem = function addNewItem(newItem) {
    if (newItem.title && newItem.title.length > 0) {
      var newItemToSave = {title: newItem.title};
      delete newItem.title;
      ItemsService.saveItem(newItemToSave, UISessionService.getActiveUUID());
    }
  };

  $scope.editItemTitle = function(item) {
    AnalyticsService.do('editItemTitle');
    ItemsService.saveItem(item, UISessionService.getActiveUUID());
    resetInboxEdit();
  };

  $scope.editItem  = function(item) {
    UISessionService.changeFeature({name: 'itemEdit', data: item});
  };

  $scope.deleteItem = function(item) {
    AnalyticsService.do('deleteItem');
    ItemsService.deleteItem(item, UISessionService.getActiveUUID());
    resetInboxEdit();
  };

  $scope.itemToTask = function(item) {
    $scope.itemType = 'task';
    $scope.task = item;
  };

  $scope.taskEditDone = function(task) {
    AnalyticsService.do('itemToTaskDone');
    ItemsService.itemToTask(task, UISessionService.getActiveUUID());
    resetInboxEdit();
  };

  $scope.itemToNote = function(item) {
    $scope.itemType = 'note';
    $scope.note = item;
  };

  $scope.itemToList = function(item) {
    AnalyticsService.do('itemToList');
    ItemsService.itemToList(item, UISessionService.getActiveUUID());
    resetInboxEdit();
  };

  $scope.noteEditDone = function(note) {
    AnalyticsService.do('itemToNoteDone');
    ItemsService.itemToNote(note, UISessionService.getActiveUUID());
    resetInboxEdit();
  };

  $scope.getOmnibarSearchResultsHeight = function() {
    if ($scope.currentHeight <= 810){
      return $scope.currentHeight - 142;
    }else{
      return 668;
    }
  };

  $scope.getColumnWidth = function() {
    if ($scope.currentWidth > 568){
      // Desktop, leave 44 pixels of gutter
      return 524;
    }else{
      return $scope.currentWidth - 44;
    }
  };
}

ItemsController.$inject = ['$location', '$routeParams', '$scope', '$timeout', 'UISessionService', 'ItemsService', 'AnalyticsService'];
angular.module('em.app').controller('ItemsController', ItemsController);
