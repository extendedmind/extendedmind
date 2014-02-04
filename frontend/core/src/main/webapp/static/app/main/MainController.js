/*jshint sub:true*/
'use strict';

// Controller for all main slides
// Holds a reference to all the item arrays. There is no sense in limiting
// the arrays because everything is needed anyway to get home and inbox to work,
// which are part of every main slide collection. 
function MainController($scope, DateService, UserSessionService, ItemsService, ListsService, TagsService, TasksService, OwnerService, FilterService, SwiperService, TasksSlidesService) {
  $scope.items = ItemsService.getItems(UserSessionService.getActiveUUID());
  $scope.tasks = TasksService.getTasks(UserSessionService.getActiveUUID());
  $scope.lists = ListsService.getLists(UserSessionService.getActiveUUID());
  $scope.contexts = TagsService.getTags(UserSessionService.getActiveUUID());
  $scope.prefix = OwnerService.getPrefix();
  $scope.filterService = FilterService;
  $scope.dates = DateService.week();
  $scope.date = DateService.today();

  $scope.gotoInbox = function() {
    if ($scope.feature === 'tasks') {
      SwiperService.swipeTo(TasksSlidesService.INBOX);
    }
  };

  $scope.gotoHome = function() {
    if ($scope.feature === 'tasks') {
      SwiperService.swipeTo(TasksSlidesService.HOME);
    }
  };

  $scope.gotoTasks = function() {
    if ($scope.feature === 'tasks') {
      SwiperService.swipeTo(TasksSlidesService.DATES);
    }
  };

  $scope.gotoLists = function() {
    if ($scope.feature === 'tasks') {
      SwiperService.swipeTo(TasksSlidesService.LISTS);
    }
  };

  $scope.gotoContexts = function() {
    if ($scope.feature === 'tasks') {
      SwiperService.swipeTo(TasksSlidesService.CONTEXTS);
    }
  };
}

MainController['$inject'] = ['$scope', 'DateService', 'UserSessionService', 'ItemsService', 'ListsService', 'TagsService', 'TasksService', 'OwnerService', 'FilterService', 'SwiperService', 'TasksSlidesService'];
angular.module('em.app').controller('MainController', MainController);
