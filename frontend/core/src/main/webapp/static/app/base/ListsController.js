'use strict';

function ListsController($location, $scope, $timeout, $routeParams, UserSessionService, OwnerService, ListsService, SwiperService, TasksSlidesService) {

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
    $location.path(OwnerService.getPrefix() + '/lists/edit/' + list.uuid);
  };

  $scope.cancelEdit = function() {
    window.history.back();
  };

  $scope.showListContent = false;
  $scope.toggleListContent = function() {
    $scope.showListContent = !$scope.showListContent;
  };

  $scope.goToList = function(uuid) {
    SwiperService.swipeTo(TasksSlidesService.LISTS + '/' + uuid);
  };

  $scope.addList = function(newList) {
    ListsService.saveList(newList, UserSessionService.getActiveUUID()).then(function(/*list*/) {
      // Using timeout 0 to make sure that DOM is ready before refreshing swiper.
      $timeout(function() {
        SwiperService.refreshSwiper(TasksSlidesService.LISTS);
      });
    });
    $scope.newList = {title: undefined};
  };

  $scope.archiveList = function(list) {
    ListsService.archiveList(list, UserSessionService.getActiveUUID());
  };
}

ListsController['$inject'] = ['$location', '$scope', '$timeout', '$routeParams',
                              'UserSessionService', 'OwnerService', 'ListsService',
                              'SwiperService', 'TasksSlidesService'];
angular.module('em.app').controller('ListsController', ListsController);
