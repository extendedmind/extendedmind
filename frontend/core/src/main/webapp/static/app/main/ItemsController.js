'use strict';

function ItemsController($location, $routeParams, $scope, $timeout, UISessionService, ItemsService, AnalyticsService) {
  if (!$scope.item){
    if ($location.path().indexOf('/edit/' != -1) || $location.path().indexOf('/new' != -1)){
      if ($routeParams.uuid) {
        $scope.item = ItemsService.getItemByUUID($routeParams.uuid, UISessionService.getActiveUUID());
      }else{
        $scope.item = {};
      }
    }
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
    $scope.gotoPreviousPage();
  };

  $scope.addNewItem = function addNewItem() {
    if ($scope.item.title && $scope.item.title.length > 0) {
      ItemsService.saveItem({title: $scope.item.title}, UISessionService.getActiveUUID()).then(function(/*item*/){
        $scope.item.title = '';
      });
    }
  };

  $scope.cancelEdit = function() {
    $scope.gotoPreviousPage();
  };

  $scope.editItemTitle = function(item) {
    AnalyticsService.do('editItemTitle');
    ItemsService.saveItem(item, UISessionService.getActiveUUID());
  };

  $scope.editItem  = function(item) {
    $location.path($scope.ownerPrefix + '/items/edit/' + item.uuid);
  };

  $scope.deleteItem = function(item) {
    AnalyticsService.do('deleteItem');
    ItemsService.deleteItem(item, UISessionService.getActiveUUID());
  };

  $scope.itemToTask = function(item) {
    $scope.itemType = 'task';
    $scope.task = item;
  };

  $scope.taskEditMore = function(task) {
    $location.path($scope.ownerPrefix + '/tasks/edit/' + task.uuid);
  };

  $scope.taskEditDone = function(task) {
    AnalyticsService.do('itemToTaskDone');
    ItemsService.itemToTask(task, UISessionService.getActiveUUID());
  };

  $scope.itemToNote = function(item) {
    $scope.itemType = 'note';
    $scope.note = item;
  };

  $scope.itemToNoteMore = function(note) {
    $location.path($scope.ownerPrefix + '/notes/edit/' + note.uuid);
  };

  $scope.itemToList = function(item) {
    AnalyticsService.do('itemToList');
    ItemsService.itemToList(item, UISessionService.getActiveUUID());
  };

  $scope.noteEditDone = function(note) {
    AnalyticsService.do('itemToNoteDone');
    ItemsService.itemToNote(note, UISessionService.getActiveUUID());
  };

  $scope.addNew = function() {
    $location.path($scope.ownerPrefix + '/items/new');
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
