'use strict';

function ListsController($scope, UISessionService, ListsService, AnalyticsService) {

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
}

ListsController['$inject'] = ['$scope', 'UISessionService',
'ListsService', 'AnalyticsService'];
angular.module('em.app').controller('ListsController', ListsController);
