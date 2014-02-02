'use strict';

// Controller for all main slides
// Holds a reference to all the item arrays. There is no sense in limiting
// the arrays because everything is needed anyway to get home and inbox to work,
// which are part of every main slide collection. 
function MainController($scope, DateService, ItemsService, ListsService, TagsService, TasksService, OwnerService, FilterService, SwiperService, TasksSlidesService) {
  $scope.items = ItemsService.getItems();
  $scope.tasks = TasksService.getTasks();
  $scope.lists = ListsService.getLists();
  $scope.contexts = TagsService.getTags();
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

MainController.$inject = ['$scope', 'DateService', 'ItemsService', 'ListsService', 'TagsService', 'TasksService', 'OwnerService', 'FilterService', 'SwiperService', 'TasksSlidesService'];
angular.module('em.app').controller('MainController', MainController);
