'use strict';

function ListsController($location, $scope, $timeout, $routeParams, UserSessionService, ListsService, SwiperService, AnalyticsService) {

  if (!$scope.list){
    if ($location.path().indexOf('/edit/' != -1) || $location.path().indexOf('/new' != -1)){
      if ($routeParams.uuid) {
        $scope.list = ListsService.getListByUUID($routeParams.uuid, UserSessionService.getActiveUUID());
      }else {
        $scope.list = {};
      }
    }
  }

  $scope.saveList = function(list) {
    ListsService.saveList(list, UserSessionService.getActiveUUID());
    window.history.back();
  };

  $scope.editList = function(list) {
    $location.path(UserSessionService.getOwnerPrefix() + '/lists/edit/' + list.uuid);
  };

  $scope.cancelEdit = function() {
    window.history.back();
  };

  $scope.showListContent = false;
  $scope.toggleListContent = function() {
    $scope.showListContent = !$scope.showListContent;
  };

  $scope.addList = function(newList) {

    if (!newList.title  || newList.title.length === 0) return false;
    ListsService.saveList(newList, UserSessionService.getActiveUUID()).then(function(/*list*/) {
      AnalyticsService.do("addList");
    });
    $scope.newList = {title: undefined};
  };

  $scope.archiveList = function(list) {
    ListsService.archiveList(list, UserSessionService.getActiveUUID());
  };

  $scope.deleteList = function(list) {
    ListsService.deleteList(list, UserSessionService.getActiveUUID());
  };
}

ListsController['$inject'] = ['$location', '$scope', '$timeout', '$routeParams', 'UserSessionService',
                              'ListsService', 'SwiperService', 'AnalyticsService'];
angular.module('em.app').controller('ListsController', ListsController);
