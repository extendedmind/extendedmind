/* global bindToFocusEvent */

'use strict';

// Controller for all main slides
// Holds a reference to all the item arrays. There is no sense in limiting
// the arrays because everything is needed anyway to get home and inbox to work,
// which are part of every main slide collection.
function MainController(
  $controller, $filter, $rootScope, $scope, $timeout, $window,
  AccountService, UISessionService, UserSessionService, ItemsService, ListsService,
  TagsService, TasksService, NotesService, FilterService, OnboardingService, SwiperService) {

  // ONBOARDING
  var userPreferences = UserSessionService.getPreferences();
  if (!userPreferences || (userPreferences && !userPreferences.onboarded)) {
    OnboardingService.launchOnboarding(onboardingSuccessCallback);
  }
  function onboardingSuccessCallback() {
    UserSessionService.setPreference('onboarded', $rootScope.packaging);
    AccountService.updateAccountPreferences();
  }

  // DATA ARRAYS

  $scope.items = ItemsService.getItems(UISessionService.getActiveUUID());
  $scope.tasks = TasksService.getTasks(UISessionService.getActiveUUID());
  $scope.notes = NotesService.getNotes(UISessionService.getActiveUUID());
  $scope.lists = ListsService.getLists(UISessionService.getActiveUUID());
  $scope.tags = TagsService.getTags(UISessionService.getActiveUUID());

  $scope.$watch('tags.length', function(/*newValue, oldValue*/) {
    $scope.contexts = $filter('filter')($scope.tags, {tagType:'context'});
  });

  $scope.ownerPrefix = UISessionService.getOwnerPrefix();
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

  $rootScope.isLoading = false;
  function synchronizeItems() {
    $scope.registerActivity();
    var activeUUID = UISessionService.getActiveUUID();
    // First check that the user has login
    if (activeUUID) {
      var sinceLastItemsSynchronized = Date.now() - UserSessionService.getItemsSynchronized(activeUUID);
      if (isNaN(sinceLastItemsSynchronized) || sinceLastItemsSynchronized > itemsSynchronizedThreshold) {
        if (UserSessionService.getLatestModified(activeUUID) === undefined){
          // This is the first load for the user, set loading variable
          $scope.$evalAsync(function() {
            $rootScope.isLoading = true;
          });
        }
        ItemsService.synchronize(activeUUID).then(function() {
          UserSessionService.setItemsSynchronized(activeUUID);
          $rootScope.isLoading = false;
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


  // GENERAL

  $scope.cancelEdit = function() {
    UISessionService.changeFeature(UISessionService.getPreviousFeatureName());
  };

  $scope.isActiveSlide = function isActiveSlide(pathFragment) {
    var activeSlide = SwiperService.getActiveSlidePath($scope.getActiveFeature());
    if (activeSlide && (activeSlide.indexOf(pathFragment) != -1)) {
      return true;
      // NOTE Swiper may not have set active slide for this feature during init
    } else if (!activeSlide) {
      if (pathFragment === 'home') {
        return true;
      }
    }
  };

  // Navigation

  $scope.gotoLists = function() {
    if ($scope.lists.length > 0) {
      $scope.gotoDetails($scope.lists[0].uuid);
    }
  };

  $scope.gotoContexts = function() {
    if ($scope.contexts.length > 0) {
      $scope.gotoDetails($scope.contexts[0].uuid);
    }
  };

  $scope.gotoDetails = function(identifier) {
    if ($scope.isFeatureActive('tasks')) {
      SwiperService.swipeTo('tasks/details/' + identifier);
    } else if ($scope.isFeatureActive('notes')) {
      SwiperService.swipeTo('notes/details/' + identifier);
    }
  };

  $scope.showContent = function showContent(feature) {
    return $scope.isFeatureActive(feature);
  };

  // Layout for expanding text areas require a max height
  // that needs to be defined programmatically

  $scope.getEditTaskDescriptionMaxHeight = function() {
    if ($scope.currentHeight <= 810){
      return $scope.currentHeight - 320;
    }else{
      return 490;
    }
  };

  $scope.getEditNoteContentMaxHeight = function() {
    if ($scope.currentHeight <= 810){
      return $scope.currentHeight - 150;
    }else{
      return 660;
    }
  };

  $scope.getEditSimpleDescriptionMaxHeight = function() {
    if ($scope.currentHeight <= 810){
      return $scope.currentHeight - 180;
    }else{
      return 630;
    }
  };

  // INJECT OTHER CONTENT CONTROLLERS HERE
  // This is done because editX.html and xSlides.html
  // need to be side by side in main.html, and they
  // should both use the same controller

  $controller('TasksController',{$scope: $scope});
  $controller('ListsController',{$scope: $scope});
  $controller('ContextsController',{$scope: $scope});
  $controller('NotesController',{$scope: $scope});
  $controller('ItemsController',{$scope: $scope});
}

MainController.$inject = [
'$controller', '$filter', '$rootScope', '$scope', '$timeout', '$window',
'AccountService', 'UISessionService', 'UserSessionService', 'ItemsService', 'ListsService',
'TagsService', 'TasksService', 'NotesService', 'FilterService', 'OnboardingService', 'SwiperService'
];
angular.module('em.app').controller('MainController', MainController);
