'use strict';

function ItemsController($scope, $timeout, UISessionService, ItemsService, AnalyticsService) {

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

  // OMNIBAR

  $scope.omnibarText = {};
  $scope.omnibarPlaceholders = {};
  $scope.omnibarVisible = undefined;

  $scope.setOmnibarPlaceholder = function(omnibarFeature, heading) {
    $scope.omnibarPlaceholders[omnibarFeature + heading] = {text: heading + getOfflineIndicator(), heading: heading};
  };

  function getOfflineIndicator() {
    if (!$scope.online) {
      return '*';
    } else {
      return '';
    }
  }

  $scope.clickOmnibar = function(omnibarFeature, heading) {
    // NOTE Heading may be not correct before $digest() because ng-init is not run.
    $scope.omnibarVisible = heading;
    $scope.omnibarPlaceholders[omnibarFeature + heading] = {text: 'store / recall', heading: heading};
  };

  $scope.omnibarKeyDown = function(event) {
    if (event.keyCode === 27) {
      $scope.clearOmnibar();
    }
  };

  $scope.clearOmnibar = function() {
    $scope.omnibarText.title = '';
    $scope.omnibarVisible = false;
    for (var key in $scope.omnibarPlaceholders) {
      if ($scope.omnibarPlaceholders.hasOwnProperty(key)) {
        if ($scope.omnibarPlaceholders[key].text === 'store / recall') {
          // This is the active omnibar, blur it programmatically
          $('input#' + key + 'OmnibarInput').blur();
          $scope.omnibarPlaceholders[key].text = $scope.omnibarPlaceholders[key].heading;
          return;
        }
      }
    }
  };

  $scope.saveOmnibarText = function(omnibarText) {
    if (omnibarText.title && omnibarText.title.length > 0 && !$scope.isLoading) {
      ItemsService.saveItem({title: omnibarText.title}, UISessionService.getActiveUUID()).then(function(item) {
        $scope.clearOmnibar();
        if (!$scope.isFeatureActive('inbox')) {
          UISessionService.changeFeature({name: 'inbox', data: item});
        }
      });
    }
  };

  $scope.editAsTask = function editAsTask(omnibarText) {
    UISessionService.changeFeature(
      {name: 'taskEdit', data: {title: omnibarText.title}}
    );
    $scope.clearOmnibar();
  };

  $scope.editAsNote = function editAsNote(omnibarText) {
    UISessionService.changeFeature(
      {name: 'noteEdit', data: {title: omnibarText.title}}
    );
    $scope.clearOmnibar();
  };

}

ItemsController.$inject = ['$scope', '$timeout', 'UISessionService', 'ItemsService', 'AnalyticsService'];
angular.module('em.app').controller('ItemsController', ItemsController);
