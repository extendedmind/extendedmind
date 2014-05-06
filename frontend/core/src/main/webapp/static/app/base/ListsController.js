'use strict';

function ListsController($location, $scope, $routeParams, UISessionService, ListsService, AnalyticsService) {

  if (!$scope.list){
    if ($location.path().indexOf('/edit/' != -1) || $location.path().indexOf('/new' != -1)){
      if ($routeParams.uuid) {
        $scope.list = ListsService.getListByUUID($routeParams.uuid, UISessionService.getActiveUUID());
      }else {
        $scope.list = {};
      }
    }
  }

  $scope.saveList = function(list) {
    ListsService.saveList(list, UISessionService.getActiveUUID());
    $scope.gotoPreviousPage();
  };

  $scope.editList = function(list) {
    $location.path(UISessionService.getOwnerPrefix() + '/lists/edit/' + list.uuid);
  };

  $scope.cancelEdit = function() {
    $scope.gotoPreviousPage();
  };

  $scope.showListContent = false;
  $scope.toggleListContent = function() {
    $scope.showListContent = !$scope.showListContent;
  };

  $scope.addList = function(newList) {

    if (!newList.title  || newList.title.length === 0) return false;
    ListsService.saveList(newList, UISessionService.getActiveUUID()).then(function(/*list*/) {
      AnalyticsService.do('addList');
    });
    $scope.newList = {title: undefined};
  };

  $scope.archiveList = function(list) {
    ListsService.archiveList(list, UISessionService.getActiveUUID());
  };

  $scope.deleteList = function(list) {
    ListsService.deleteList(list, UISessionService.getActiveUUID());
  };
}

ListsController['$inject'] = ['$location', '$scope', '$routeParams', 'UISessionService',
'ListsService', 'AnalyticsService'];
angular.module('em.app').controller('ListsController', ListsController);
