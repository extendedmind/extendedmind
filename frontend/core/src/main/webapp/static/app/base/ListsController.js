'use strict';

function ListsController($scope, UISessionService, ListsService, AnalyticsService) {

  var featureChangedCallback = function featureChangedCallback(name, data/*, state*/){
    if (name === 'list'){
      $scope.list = data;
      $scope.subtask = {relationships: {list: $scope.list.uuid}};
      $scope.newNote = {relationships: {list: $scope.list.uuid}};
    }
  };
  UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'ListsController');

  $scope.saveList = function(list) {
    ListsService.saveList(list, UISessionService.getActiveUUID());
    $scope.gotoPreviousPage();
  };

  $scope.listDetails = {visible: false};
  $scope.editList = function(list) {
    $scope.listDetails.visible = !$scope.listDetails.visible;
  };

  $scope.editListFields = function(list) {
    AnalyticsService.do('editListFields');
    ListsService.saveList(list, UISessionService.getActiveUUID());
  };

  $scope.addList = function(newList) {
    if (!newList.title  || newList.title.length === 0) return false;

    var listToSave = {title: newList.title};
    delete newList.title;
    ListsService.saveList(listToSave, UISessionService.getActiveUUID()).then(function(/*list*/) {
      AnalyticsService.do('addList');
    });
  };

  $scope.archiveList = function(list) {
    ListsService.archiveList(list, UISessionService.getActiveUUID());
  };

  $scope.deleteList = function(list) {
    ListsService.deleteList(list, UISessionService.getActiveUUID());
  };

  $scope.listQuickEditDone = function(list) {
    AnalyticsService.do('listQuickEditDone');
    ListsService.saveList(list, UISessionService.getActiveUUID());
  };

  // Navigation

  $scope.gotoList = function(list){
    if (UISessionService.getCurrentFeatureName() !== 'list' ||
        UISessionService.getFeatureState('list') !== list) {
      UISessionService.changeFeature('list', list);
      AnalyticsService.visit('list');
    }
  }

  $scope.archiveListAndMoveInbox = function(list){
    $scope.archiveList(list);
    UISessionService.changeFeature('inbox');
  }

  $scope.deleteListAndMoveToInbox = function(list){
    $scope.deleteList(list);
    UISessionService.changeFeature('inbox');
  }

}

ListsController['$inject'] = ['$scope', 'UISessionService',
'ListsService', 'AnalyticsService'];
angular.module('em.app').controller('ListsController', ListsController);
