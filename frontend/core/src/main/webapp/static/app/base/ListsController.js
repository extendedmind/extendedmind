'use strict';

function ListsController($q, $scope, UISessionService, ListsService, AnalyticsService) {

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
  $scope.editList = function(/*list*/) {
    $scope.listDetails.visible = !$scope.listDetails.visible;
  };

  $scope.editListFields = function(list) {
    AnalyticsService.do('editListFields');
    ListsService.saveList(list, UISessionService.getActiveUUID());
  };

  $scope.saveUnsavedListAndLinkToItem = function saveUnsavedListAndLinkToItem(item) {
    if ($scope.newList && $scope.newList.title) {
      return $scope.addList($scope.newList).then(function(list) {
        if (!item.relationships) item.relationships = {};
        item.relationships.list = list.uuid;
      });
    }
    var deferred = $q.defer();
    deferred.resolve();
    return deferred.promise;
  };

  $scope.setUnsavedList = function setUnsavedList(/*list*/) {
    $scope.newList = {};
  };

  $scope.clearUnsavedList = function clearUnsavedList() {
    $scope.newList = undefined;
  };

  $scope.addList = function(newList) {
    if (!newList.title || newList.title.length === 0) return false;

    var listToSave = {title: newList.title};
    delete newList.title;
    return ListsService.saveList(listToSave, UISessionService.getActiveUUID()).then(function(list) {
      AnalyticsService.do('addList');
      return list;
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
};

$scope.archiveListAndMoveToLists = function(list){
  $scope.archiveList(list);
  UISessionService.changeFeature('lists');
};

$scope.deleteListAndMoveToLists = function(list){
  $scope.deleteList(list);
  UISessionService.changeFeature('lists');
};

$scope.saveListAndMoveToLists = function(list){
  $scope.editListFields(list);
  UISessionService.changeFeature('lists');
};

}

ListsController['$inject'] = ['$q', '$scope', 'UISessionService',
'ListsService', 'AnalyticsService'];
angular.module('em.app').controller('ListsController', ListsController);
