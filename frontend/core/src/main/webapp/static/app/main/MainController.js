/* global $, bindToFocusEvent, bindToResumeEvent */

'use strict';

// Controller for all main slides
// Holds a reference to all the item arrays. There is no sense in limiting
// the arrays because everything is needed anyway to get home and inbox to work,
// which are part of every main slide collection. 
function MainController(
  $scope, $location, $rootScope, $timeout, $window, $filter, $document,
  AccountService, UserSessionService, BackendClientService, ItemsService, ListsService,
  TagsService, TasksService, NotesService, FilterService, OnboardingService, SwiperService) {

  // ONBOARDING
  var userPreferences = UserSessionService.getPreferences();
  if (!userPreferences || (userPreferences && !userPreferences.onboarded)) {
    OnboardingService.launchOnboarding(onboardingSuccessCallback);
  }
  function onboardingSuccessCallback() {
    UserSessionService.setPreferences('onboarded', $rootScope.packaging);
    AccountService.putAccountPreferences();
  }

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

  // BACKEND POLLING

  var synchronizeItemsTimer;
  var synchronizeItemsDelay = 12 * 1000;
  var itemsSynchronizedThreshold = 10 * 1000; // 10 seconds in milliseconds

  // Start synchronize interval or just start synchronize interval. 
  synchronizeItemsAndSynchronizeItemsDelayed();

  // Global variable bindToFocusEvent specifies if focus event should be listened to. Variable is true by default
  // for browsers, where hidden tab should not poll continuously, false in Cordova where javascript
  // execution is paused anyway when app is not in focus.
  var bindToFocus = (typeof bindToFocusEvent !== 'undefined') ? bindToFocusEvent: true;
  if (bindToFocus) {
    angular.element($window).bind('focus', synchronizeItemsAndSynchronizeItemsDelayed);
    angular.element($window).bind('blur', cancelSynchronizeItemsDelayed);
  }

  function synchronizeItemsAndSynchronizeItemsDelayed() {
    synchronizeItems();
    synchronizeItemsDelayed();
  }
  function cancelSynchronizeItemsDelayed() {
    $timeout.cancel(synchronizeItemsTimer);
  }

  // https://developer.mozilla.org/en/docs/Web/API/window.setInterval
  function synchronizeItemsDelayed() {
    synchronizeItemsTimer = $timeout(function() {
      synchronizeItems();
      synchronizeItemsDelayed();
    }, synchronizeItemsDelay);
  }

  // Synchronize items if not already synchronizing and interval reached.
  function synchronizeItems() {
    $scope.registerActivity();
    var activeUUID = UserSessionService.getActiveUUID();
    // First check that the user has login
    if (activeUUID){
      var sinceLastItemsSynchronized = Date.now() - UserSessionService.getItemsSynchronized(activeUUID);
      if (isNaN(sinceLastItemsSynchronized) || sinceLastItemsSynchronized > itemsSynchronizedThreshold) {
        ItemsService.synchronize(activeUUID).then(function() {
          UserSessionService.setItemsSynchronized(activeUUID);
        });
      }
    }
  }

  // CLEANUP

  $scope.$on('$destroy', function() {
    // http://www.bennadel.com/blog/2548-Don-t-Forget-To-Cancel-timeout-Timers-In-Your-destroy-Events-In-AngularJS.htm
    $timeout.cancel(synchronizeItemsTimer);
    if (bindToFocus) {
      angular.element($window).unbind('focus', synchronizeItemsAndSynchronizeItemsDelayed);
      angular.element($window).unbind('blur', cancelSynchronizeItemsDelayed);
    }
  });

  // OMNIBAR

  $scope.omnibarText = {};
  $scope.omnibarPlaceholders = {};

  $scope.omnibarVisible = false;

  $scope.setOmnibarPlaceholder = function(heading){
    $scope.omnibarPlaceholders[heading] = heading + getOfflineIndicator();
  };

  function getOfflineIndicator(){
    if (!$scope.online){
      return '*';
    }else{
      return '';
    }
  }

  $scope.clickOmnibar = function(heading) {
    $scope.omnibarVisible = true;
    $scope.omnibarPlaceholders[heading] = 'store / recall';
  };

  $scope.omnibarKeyDown = function(event){
    if (event.keyCode === 27){
      $scope.clearOmnibar();
    }
  };

  $scope.clearOmnibar = function(){
    $scope.omnibarText.title = '';
    $scope.omnibarVisible = false;
    for (var heading in $scope.omnibarPlaceholders) {
      if ($scope.omnibarPlaceholders.hasOwnProperty(heading)){
        if ($scope.omnibarPlaceholders[heading] === 'store / recall'){
          // This is the active omnibar, blur it programmatically
          $('input#' + heading + 'OmnibarInput').blur();
          $scope.omnibarPlaceholders[heading] = heading;
          return;
        }
      }
    }
  };

  $scope.saveOmnibarText = function(omnibarText) {
    if (omnibarText.title && omnibarText.title.length > 0){
      ItemsService.saveItem({title: omnibarText.title}, UserSessionService.getActiveUUID()).then(function(/*item*/){
        $scope.omnibarText.title = '';
      });
    }
  };

  $scope.saveAsTask = function(omnibarText) {
    TasksService.saveTask({title: omnibarText.title}, UserSessionService.getActiveUUID()).then(function(){
      $scope.omnibarText.title = '';
    });
  };

  $scope.saveAsNote = function(omnibarText) {
    NotesService.saveNote({title: omnibarText.title}, UserSessionService.getActiveUUID());
    $scope.omnibarText.title = '';
  };

  $scope.clickOmnibarPlus = function(omnibarText) {
    if (omnibarText.title && omnibarText.title.length > 0){
      $scope.saveOmnibarText(omnibarText);
    }else{
      $location.path(UserSessionService.getOwnerPrefix() + '/items/new');
    }
  };

  // Navigation

  $scope.gotoHome = function() {
    if ($scope.feature === 'tasks') {
      SwiperService.swipeTo('tasks/home');
    }else if ($scope.feature === 'notes'){
      SwiperService.swipeTo('notes/home');
    }
  };

  $scope.gotoOverview = function() {
    if ($scope.feature === 'tasks') {
      SwiperService.swipeTo('tasks/overview');
    }else if ($scope.feature === 'notes'){
      SwiperService.swipeTo('notes/overview');
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
      SwiperService.swipeTo('tasks/details/' + identifier);
    }else if ($scope.feature === 'notes') {
      SwiperService.swipeTo('notes/details/' + identifier);
    }
  };
}

MainController.$inject = [
'$scope', '$location', '$rootScope', '$timeout', '$window', '$filter', '$document',
'AccountService', 'UserSessionService', 'BackendClientService', 'ItemsService', 'ListsService',
'TagsService', 'TasksService', 'NotesService', 'FilterService', 'OnboardingService', 'SwiperService'
];
angular.module('em.app').controller('MainController', MainController);
