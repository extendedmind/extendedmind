/* global bindToFocusEvent */

'use strict';

// Controller for all main slides
// Holds a reference to all the item arrays. There is no sense in limiting
// the arrays because everything is needed anyway to get home and inbox to work,
// which are part of every main slide collection.
function MainController(
  $controller, $filter, $rootScope, $scope, $timeout, $window,
  AccountService, UISessionService, UserSessionService, ItemsService, ListsService,
  TagsService, TasksService, NotesService, SynchronizeService,
  SwiperService, ArrayService, UUIDService, AnalyticsService) {

  // ONBOARDING

  $scope.onboardingInProgress = false;
  var onboardingPhase;
  var userPreferences = UserSessionService.getPreferences();
  if (!userPreferences || (userPreferences && !userPreferences.onboarded)) {
    $scope.onboardingInProgress = true;
    onboardingPhase = 'new';
  }
  $scope.setOnboardingPhase = function setOnboardingPhase(phase) {
    onboardingPhase = phase;
    if (onboardingPhase === 'itemAdded'){
      // End right after first item added
      UserSessionService.setPreference('onboarded', $rootScope.packaging);
      AccountService.updateAccountPreferences();
      $scope.onboardingInProgress = false;
      AnalyticsService.do('firstItemAdded');
    }else if (onboardingPhase === 'secondItemAdded'){
      AnalyticsService.do('secondItemAdded');
    }else if (onboardingPhase === 'sortingStarted'){
      AnalyticsService.do('sortingStarted');
    }
  }
  $scope.getOnboardingPhase = function getOnboardingPhase() {
    return onboardingPhase;
  }

  // DATA ARRAYS
  $scope.items = ItemsService.getItems(UISessionService.getActiveUUID());
  $scope.tasks = TasksService.getTasks(UISessionService.getActiveUUID());
  $scope.completedTasks = TasksService.getCompletedTasks(UISessionService.getActiveUUID());
  $scope.archivedTasks = TasksService.getArchivedTasks(UISessionService.getActiveUUID());
  $scope.notes = NotesService.getNotes(UISessionService.getActiveUUID());
  $scope.archivedNotes = NotesService.getArchivedNotes(UISessionService.getActiveUUID());
  $scope.lists = ListsService.getLists(UISessionService.getActiveUUID());
  $scope.archivedLists = ListsService.getArchivedLists(UISessionService.getActiveUUID());
  $scope.tags = TagsService.getTags(UISessionService.getActiveUUID());

  $scope.$watch('tags.length', function(/*newValue, oldValue*/) {
    $scope.contexts = $filter('filter')($scope.tags, {tagType: 'context'});
    $scope.keywords = $filter('filter')($scope.tags, {tagType: 'keyword'});
  });


  function combineListsArrays(){
    if ($scope.archivedLists.length && $scope.lists.length){
      $scope.listsSelectOptions = $scope.lists.slice(0);
      // Push a fake list as archived list delimiter
      $scope.listsSelectOptions.push({uuid: UUIDService.generateFakeUUID(), title: '--------', delimiter: true});
      $scope.listsSelectOptions = $scope.listsSelectOptions.concat($scope.archivedLists);
    }else if ($scope.lists.length && !$scope.archivedLists.length){
      $scope.listsSelectOptions = $scope.lists;
    }else if ($scope.archivedLists.length && !$scope.lists.length){
      $scope.listsSelectOptions = $scope.archivedLists;
    }else{
      $scope.listsSelectOptions = [];
    }
    // TODO: Create list option
  }

  $scope.$watch('lists.length', function(/*newValue, oldValue*/) {
    combineListsArrays();
  });
  $scope.$watch('archivedLists.length', function(/*newValue, oldValue*/) {
    combineListsArrays();
  });

  var allNotesUpdatedCallbacks = {};
  function combineNotesArrays(){
    if ($scope.notes.length && $scope.archivedNotes.length){
      $scope.allNotes = $scope.notes.concat($scope.archivedNotes);
    }else if ($scope.notes.length && !$scope.archivedNotes.length){
      $scope.allNotes = $scope.notes;
    }else if ($scope.archivedNotes.length && !$scope.notes.length){
      $scope.allNotes = $scope.archivedNotes;
    }else{
      $scope.allNotes = [];
    }

    for (var id in allNotesUpdatedCallbacks) {
      allNotesUpdatedCallbacks[id]($scope.allNotes.length);
    }
  }
  $scope.registerAllNotesUpdatedCallback = function(callback, id){
    allNotesUpdatedCallbacks[id] = callback;
  };

  $scope.$watch('notes.length', function(/*newValue, oldValue*/) {
    combineNotesArrays();
  });
  $scope.$watch('archivedNotes.length', function(/*newValue, oldValue*/) {
    combineNotesArrays();
  });

  function combineTasksArrays(){
    var activeArchivedTasks = [];
    var i = 0;
    while ($scope.archivedTasks[i]) {
      if ($scope.archivedTasks[i].completed === undefined){
        activeArchivedTasks.push($scope.archivedTasks[i]);
      }
      i++;
    }
    $scope.allActiveTasks =
    ArrayService.combineArrays(
      activeArchivedTasks,
      $scope.tasks, 'created', true);
  }

  $scope.$watch('tasks.length', function(/*newValue, oldValue*/) {
    combineTasksArrays();
  });
  $scope.$watchCollection('archivedTasks', function(/*newValue, oldValue*/) {
    combineTasksArrays();
  });


  var completedArrayCallbacks = {};
  var watchingFullCompleted = false;
  $scope.createFullCompletedTasks = function createFullCompletedTasks(callback, id){
    function combineCompletedTasksArrays(){
      var completedArchivedTasks = [];
      var i = 0;
      while ($scope.archivedTasks[i]) {
        if ($scope.archivedTasks[i].completed !== undefined){
          completedArchivedTasks.push($scope.archivedTasks[i]);
        }
        i++;
      }
      $scope.fullCompletedTasks = ArrayService.combineArrays(
        completedArchivedTasks,
        $scope.completedTasks, 'completed', true);

      for (var id in completedArrayCallbacks) {
        completedArrayCallbacks[id]($scope.fullCompletedTasks.length);
      }
    }

    if (callback) completedArrayCallbacks[id] = callback;

    if (!watchingFullCompleted){
      watchingFullCompleted = true;
      $scope.$watchCollection('archivedTasks', function(/*newValue, oldValue*/) {
        combineCompletedTasksArrays();
      });
      $scope.$watch('completedTasks.length', function(/*newValue, oldValue*/) {
        combineCompletedTasksArrays();
      });
    }
  };

  $scope.ownerPrefix = UISessionService.getOwnerPrefix();

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
        SynchronizeService.synchronize(activeUUID).then(function() {
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


  // INJECT OTHER CONTENT CONTROLLERS HERE
  // This is done because editX.html and xSlides.html
  // need to be side by side in main.html, and they
  // should both use the same controller

  $controller('TasksController',{$scope: $scope});
  $controller('ListsController',{$scope: $scope});
  $controller('ContextsController',{$scope: $scope});
  $controller('KeywordsController',{$scope: $scope});
  $controller('NotesController',{$scope: $scope});
  $controller('ItemsController',{$scope: $scope});
  $controller('OmnibarController',{$scope: $scope});
}

MainController.$inject = [
'$controller', '$filter', '$rootScope', '$scope', '$timeout', '$window',
'AccountService', 'UISessionService', 'UserSessionService', 'ItemsService', 'ListsService',
'TagsService', 'TasksService', 'NotesService', 'SynchronizeService',
'SwiperService', 'ArrayService', 'UUIDService', 'AnalyticsService'
];
angular.module('em.app').controller('MainController', MainController);
