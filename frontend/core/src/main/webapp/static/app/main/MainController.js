'use strict';

// Controller for all main slides
// Holds a reference to all the item arrays. There is no sense in limiting
// the arrays because everything is needed anyway to get home and inbox to work,
// which are part of every main slide collection. 
function MainController($scope, $location, UserSessionService, ItemsService, ListsService, TagsService, TasksService, NotesService, OwnerService, FilterService, SwiperService, TasksSlidesService, NotesSlidesService) {
  $scope.items = ItemsService.getItems(UserSessionService.getActiveUUID());
  $scope.tasks = TasksService.getTasks(UserSessionService.getActiveUUID());
  $scope.notes = NotesService.getNotes(UserSessionService.getActiveUUID());
  $scope.lists = ListsService.getLists(UserSessionService.getActiveUUID());
  $scope.tags = TagsService.getTags(UserSessionService.getActiveUUID());
  $scope.prefix = OwnerService.getPrefix();
  $scope.filterService = FilterService;

  $scope.gotoInbox = function() {
    if ($scope.feature === 'tasks') {
      SwiperService.swipeTo(TasksSlidesService.INBOX);
    }else if ($scope.feature === 'notes'){
      SwiperService.swipeTo(NotesSlidesService.INBOX);
    }
  };

  $scope.gotoHome = function() {
    if ($scope.feature === 'tasks') {
      SwiperService.swipeTo(TasksSlidesService.HOME);
    }else if ($scope.feature === 'notes'){
      SwiperService.swipeTo(NotesSlidesService.HOME);
    }
  };

  $scope.gotoTasks = function() {
    if ($scope.feature === 'tasks') {
      SwiperService.swipeTo(TasksSlidesService.DATES);
    }else if ($scope.feature === 'notes'){
      $location.path($scope.prefix + '/tasks');
    }
  };

  $scope.gotoNotes = function() {
    if ($scope.feature === 'tasks') {
      $location.path($scope.prefix + '/notes');
    } else if ($scope.feature === 'notes'){
      SwiperService.swipeTo(NotesSlidesService.RECENT);
    }
  };

  $scope.gotoLists = function() {
    if ($scope.feature === 'tasks') {
      SwiperService.swipeTo(TasksSlidesService.LISTS);
    }else if ($scope.feature === 'notes') {
      SwiperService.swipeTo(NotesSlidesService.LISTS);
    }
  };

  $scope.gotoContexts = function() {
    if ($scope.feature === 'tasks') {
      SwiperService.swipeTo(TasksSlidesService.CONTEXTS);
    }
  };
}

MainController['$inject'] = ['$scope', '$location', 'UserSessionService', 'ItemsService', 'ListsService', 'TagsService', 'TasksService', 'NotesService', 'OwnerService', 'FilterService', 'SwiperService', 'TasksSlidesService', 'NotesSlidesService'];
angular.module('em.app').controller('MainController', MainController);
