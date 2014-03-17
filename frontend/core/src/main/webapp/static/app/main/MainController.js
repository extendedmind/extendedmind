/* global $ */

'use strict';

// Controller for all main slides
// Holds a reference to all the item arrays. There is no sense in limiting
// the arrays because everything is needed anyway to get home and inbox to work,
// which are part of every main slide collection. 
function MainController(
  $scope, $location, $rootScope, $timeout, $window, $filter, $document,
  UserSessionService, BackendClientService, ItemsService, ListsService,
  TagsService, TasksService, NotesService, FilterService, SwiperService,
  TasksSlidesService, NotesSlidesService) {
  // Data arrays 
  $scope.items = ItemsService.getItems(UserSessionService.getActiveUUID());
  $scope.tasks = TasksService.getTasks(UserSessionService.getActiveUUID());
  $scope.notes = NotesService.getNotes(UserSessionService.getActiveUUID());
  $scope.lists = ListsService.getLists(UserSessionService.getActiveUUID());
  $scope.tags = TagsService.getTags(UserSessionService.getActiveUUID());

  $scope.$watch('tags.length', function(/*newValue, oldValue*/) {
    $scope.contexts = $filter('filter')($scope.tags, {tagType:'context'});
  });

  $scope.ownerPrefix = UserSessionService.getOwnerPrefix();
  $scope.filterService = FilterService;

  $scope.saveOmnibarText = function(omnibarText) {
    if (omnibarText.title && omnibarText.title.length > 0){
      ItemsService.saveItem({title: omnibarText.title}, UserSessionService.getActiveUUID()).then(function(/*item*/){
        $scope.omnibarText.title = '';
      });
    }
  };

  $scope.clickOmnibarPlus = function(omnibarText) {
    if (omnibarText.title && omnibarText.title.length > 0){
      $scope.saveOmnibarText(omnibarText);
    }else{
      $location.path(UserSessionService.getOwnerPrefix() + '/items/new');
    }
  }

  $scope.gotoHome = function() {
    if ($scope.feature === 'tasks') {
      SwiperService.swipeTo(TasksSlidesService.DATES);
    }else if ($scope.feature === 'notes'){
      SwiperService.swipeTo(NotesSlidesService.RECENT);
    }
  };

  $scope.gotoOverview = function() {
    if ($scope.feature === 'tasks') {
      SwiperService.swipeTo(TasksSlidesService.OVERVIEW);
    }else if ($scope.feature === 'notes'){
      SwiperService.swipeTo(NotesSlidesService.OVERVIEW);
    }
  };

  $scope.gotoDetails = function() {
    $scope.gotoLists();
  };

  $scope.gotoLists = function() {
    if ($scope.lists.length > 0){
      $scope.gotoDetails($scope.lists[0].uuid);
    }
  };

  $scope.gotoContexts = function() {
    if ($scope.contexts.length > 0){
      $scope.gotoDetails($scope.contexts[0].uuid);
    }
  };

  $scope.gotoDetails = function(identifier) {
    if ($scope.feature === 'tasks') {
      SwiperService.swipeTo(TasksSlidesService.DETAILS + '/' + identifier);
    }else if ($scope.feature === 'notes') {
      SwiperService.swipeTo(NotesSlidesService.DETAILS + '/' + identifier);
    }
  };

  $scope.getNoSwipingClass = function getNoSwipingClass() {
    return ($rootScope.noSwiping) ? 'swiper-no-swiping' : '';
  };
}

MainController.$inject = [
'$scope', '$location', '$rootScope', '$timeout', '$window', '$filter', '$document',
'UserSessionService', 'BackendClientService', 'ItemsService', 'ListsService',
'TagsService', 'TasksService', 'NotesService', 'FilterService', 'SwiperService',
'TasksSlidesService', 'NotesSlidesService'
];
angular.module('em.app').controller('MainController', MainController);
