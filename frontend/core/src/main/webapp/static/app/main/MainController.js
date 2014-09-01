/* Copyright 2013-2014 Extended Mind Technologies Oy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /* global bindToFocusEvent */
 'use strict';

// Controller for all main slides
// Holds a reference to all the item arrays. There is no sense in limiting
// the arrays because everything is needed anyway to get home and inbox to work,
// which are part of every main slide collection.
function MainController(
  $controller, $filter, $rootScope, $scope, $timeout, $window,
  AccountService, AnalyticsService, ArrayService, DrawerService, ItemsService, ListsService,
  NotesService, SwiperService, SynchronizeService, TagsService, TasksService,
  UISessionService, UserSessionService, UUIDService) {

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
    if (onboardingPhase === 'itemAdded') {
      // End right after first item added
      UserSessionService.setPreference('onboarded', $rootScope.packaging);
      AccountService.updateAccountPreferences();
      $scope.onboardingInProgress = false;
      AnalyticsService.do('firstItemAdded');
    } else if (onboardingPhase === 'secondItemAdded') {
      AnalyticsService.do('secondItemAdded');
    } else if (onboardingPhase === 'sortingStarted') {
      AnalyticsService.do('sortingStarted');
    }
  };
  $scope.getOnboardingPhase = function getOnboardingPhase() {
    return onboardingPhase;
  };

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


  function combineListsArrays() {
    if ($scope.archivedLists.length && $scope.lists.length) {
      $scope.listsSelectOptions = $scope.lists.slice(0);  // http://davidwalsh.name/javascript-clone-array
      // Push a fake list as archived list delimiter
      $scope.listsSelectOptions.push({uuid: UUIDService.generateFakeUUID(), title: '--------', delimiter: true});
      $scope.listsSelectOptions = $scope.listsSelectOptions.concat($scope.archivedLists);
    } else if ($scope.lists.length && !$scope.archivedLists.length) {
      $scope.listsSelectOptions = $scope.lists.slice(0);  // http://davidwalsh.name/javascript-clone-array
    } else if ($scope.archivedLists.length && !$scope.lists.length) {
      $scope.listsSelectOptions = $scope.archivedLists.slice(0);
    } else {
      $scope.listsSelectOptions = [];
    }
    $scope.listsSelectOptions.unshift({
      uuid: UUIDService.generateFakeUUID(),
      title: 'add list...',
      isAddNewItem: true
    });
  }

  $scope.$watch('lists.length', function(/*newValue, oldValue*/) {
    combineListsArrays();
  });
  $scope.$watch('archivedLists.length', function(/*newValue, oldValue*/) {
    combineListsArrays();
  });

  var allNotesUpdatedCallbacks = {};
  function combineNotesArrays() {
    if ($scope.notes.length && $scope.archivedNotes.length) {
      $scope.allNotes = $scope.notes.concat($scope.archivedNotes);
    } else if ($scope.notes.length && !$scope.archivedNotes.length) {
      $scope.allNotes = $scope.notes;
    } else if ($scope.archivedNotes.length && !$scope.notes.length) {
      $scope.allNotes = $scope.archivedNotes;
    } else {
      $scope.allNotes = [];
    }

    for (var id in allNotesUpdatedCallbacks) {
      allNotesUpdatedCallbacks[id]($scope.allNotes.length);
    }
  }
  $scope.registerAllNotesUpdatedCallback = function registerAllNotesUpdatedCallback(callback, id) {
    allNotesUpdatedCallbacks[id] = callback;
  };

  $scope.$watch('notes.length', function(/*newValue, oldValue*/) {
    combineNotesArrays();
  });
  $scope.$watch('archivedNotes.length', function(/*newValue, oldValue*/) {
    combineNotesArrays();
  });

  function combineTasksArrays() {
    var activeArchivedTasks = [];
    var i = 0;
    while ($scope.archivedTasks[i]) {
      if ($scope.archivedTasks[i].completed === undefined) {
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
  $scope.createFullCompletedTasks = function createFullCompletedTasks(callback, id) {
    function combineCompletedTasksArrays() {
      var completedArchivedTasks = [];
      var i = 0;
      while ($scope.archivedTasks[i]) {
        if ($scope.archivedTasks[i].completed !== undefined) {
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

    if (!watchingFullCompleted) {
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
        if (UserSessionService.getLatestModified(activeUUID) === undefined) {
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

  $scope.cancelEdit = function cancelEdit() {
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

  var editorAboutToOpenCallbacks = {};
  var editorOpenedCallbacks = {};
  var editorAboutToCloseCallbacks = {};
  var editorClosedCallbacks = {};

  // register editor callbacks
  $scope.registerEditorAboutToOpenCallback = function registerEditorAboutToOpenCallback(callback, id) {
    editorAboutToOpenCallbacks[id] = callback;
  };

  $scope.registerEditorOpenedCallback = function(callback, id) {
    editorOpenedCallbacks[id] = callback;
  };

  $scope.registerEditorAboutToClose = function(callback, id) {
    editorAboutToCloseCallbacks[id] = callback;
  };

  $scope.registerEditorClosedCallback = function(callback, id) {
    editorClosedCallbacks[id] = callback;
  };

  // register drawer callbacks to DrawerService

  function executeEditorAboutToOpenCallbacks(editorType, item) {
    for (var id in editorAboutToOpenCallbacks)
      editorAboutToOpenCallbacks[id](editorType, item);
  }

  DrawerService.registerOpenedCallback(editorOpened, 'right', 'MainController');
  function editorOpened() {
    for (var id in editorOpenedCallbacks) {
      editorOpenedCallbacks[id]();
    }
  }

  /*
  function executeEditorAboutToCloseCallbacks(editorType, item) {
    for (var id in editorAboutToCloseCallbacks)
      editorAboutToCloseCallbacks[id](editorType, item);
  }
  */

  DrawerService.registerClosedCallback(editorClosed, 'right', 'MainController');
  function editorClosed() {
    for (var id in editorClosedCallbacks)
      editorClosedCallbacks[id]();
  }

  $scope.isEditorVisible = function isEditorVisible() {
    return DrawerService.isRightDrawerOpen();
  };

  $scope.isMenuVisible = function isMenuVisible() {
    return DrawerService.isLeftDrawerOpen();
  };

  // NAVIGATION

  // TODO analytics visit omnibar
  $scope.openOmnibarDrawer = function openOmnibarDrawer() {
    executeEditorAboutToOpenCallbacks('omnibar');
    $scope.setIsWebkitScrolling(false);
    DrawerService.toggle('right');
  };

  $scope.closeOmnibarDrawer = function closeOmnibarDrawer() {
    $scope.setIsWebkitScrolling(true);
    DrawerService.toggle('right');
  };

  $scope.editTask = function editTask(task) {
    executeEditorAboutToOpenCallbacks('task', task);
    $scope.setIsWebkitScrolling(false);
    DrawerService.toggle('right');
  };


  // INJECT OTHER CONTENT CONTROLLERS HERE

  $controller('TasksController',{$scope: $scope});
  $controller('ListsController',{$scope: $scope});
  $controller('ContextsController',{$scope: $scope});
  $controller('KeywordsController',{$scope: $scope});
  $controller('NotesController',{$scope: $scope});
  $controller('ItemsController',{$scope: $scope});
}

MainController['$inject'] = [
'$controller', '$filter', '$rootScope', '$scope', '$timeout', '$window',
'AccountService', 'AnalyticsService', 'ArrayService', 'DrawerService', 'ItemsService', 'ListsService',
'NotesService', 'SwiperService', 'SynchronizeService','TagsService', 'TasksService',
'UISessionService', 'UserSessionService', 'UUIDService'
];
angular.module('em.main').controller('MainController', MainController);
