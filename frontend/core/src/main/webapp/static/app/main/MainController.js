/*jshint sub:true*/
'use strict';

// Controller for all main slides
// Holds a reference to all the item arrays. There is no sense in limiting
// the arrays because everything is needed anyway to get home and inbox to work,
// which are part of every main slide collection. 
function MainController($scope, $timeout, DateService, UserSessionService, ItemsService, ListsService, TagsService, TasksService, OwnerService, FilterService, SwiperService, TasksSlidesService) {
  $scope.items = ItemsService.getItems(UserSessionService.getActiveUUID());
  $scope.tasks = TasksService.getTasks(UserSessionService.getActiveUUID());
  $scope.lists = ListsService.getLists(UserSessionService.getActiveUUID());
  $scope.tags = TagsService.getTags(UserSessionService.getActiveUUID());
  $scope.prefix = OwnerService.getPrefix();
  $scope.filterService = FilterService;
  $scope.dates = DateService.activeWeek();

  $scope.previousWeek = function() {
    $scope.dates = DateService.previousWeek();
    $timeout(function() {
    // $scope.$apply(function() {
    SwiperService.swipeTo(TasksSlidesService.getDateSlidePath($scope.dates[0].yyyymmdd));
  // });
  });
  };

  $scope.nextWeek = function() {
    $scope.dates = DateService.nextWeek();
  };

  $scope.getContexts = function() {
    var contexts = [];
    for (var i=0, len=$scope.tags.length; i<len; i++) {
      if (tags[i].tagType === "context") {
        contexts.push(tags[i]);
      }
    }
    return contexts;
  }

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

MainController['$inject'] = ['$scope', '$timeout', 'DateService', 'UserSessionService', 'ItemsService', 'ListsService', 'TagsService', 'TasksService', 'OwnerService', 'FilterService', 'SwiperService', 'TasksSlidesService'];
angular.module('em.app').controller('MainController', MainController);
