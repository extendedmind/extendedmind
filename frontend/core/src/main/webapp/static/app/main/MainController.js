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
  UserService, AnalyticsService, ArrayService, DrawerService, ItemsService, ListsService,
  NotesService, SwiperService, SynchronizeService, TagsService, TasksService,
  UISessionService, UserSessionService, UUIDService) {

  // MAP OF ALL FEATURES

  $scope.features = {
    user: {
      heading: undefined,
      slides: {
        left: {
          path: 'user/home',
          heading: 'home'
        },
        right: {
          path: 'user/details',
          heading: undefined
        }
      }
    },
    focus: {
      heading: 'focus',
      slides: {
        left: {
          path: 'focus/tasks',
          heading: 'tasks'
        },
        right: {
          path: 'focus/notes',
          heading: 'notes'
        }
      }
    },
    inbox: {
      heading: 'inbox'
    },
    tasks: {
      heading: 'tasks',
      slides: {
        left: {
          path: 'tasks/recent',
          heading: 'recent'
        },
        middle: {
          path: 'tasks/contexts',
          heading: 'contexts',
        },
        right: {
          path: 'tasks/context',
          heading: 'no context',
        }
      }
    },
    notes: {
      heading: 'notes'
    },
    lists: {
      heading: 'lists',
      slides: {
        left: {
          path: 'lists/active',
          heading: 'active'
        },
        right: {
          path: 'lists/archived',
          heading: 'archived'
        }
      }
    },
    list: {
      heading: undefined,
      slides: {
        left: {
          path: 'list/tasks',
          heading: 'tasks'
        },
        right: {
          path: 'list/notes',
          heading: 'notes'
        }
      }
    },
    admin: {
      heading: 'admin'
    }
  };

  // NAVIGATION

  var openEditorAfterMenuClosed;
  var openMenuAfterEditorClosed = false;

  /*
  * Open editor.
  *
  * Set openEditorAfterMenuClosed and openMenuAFterEditorClosed flags to:
  *   i.  open editor in menu's close callback
  *   ii. open menu in editor's close callback
  *
  * TODO: analytics visit omnibar
  */
  $scope.openEditor = function openEditor(type, item) {

    // Check for existing edit locks and resolve them first.
    var deferredEditorClose = UISessionService.getDeferredAction('editorClose');
    if (deferredEditorClose) deferredEditorClose.resolve();

    var promise = UISessionService.deferAction('editorClose');

    if (DrawerService.isOpen('left')) {
      DrawerService.close('left');
      openEditorAfterMenuClosed = {type: type, item: item};
      openMenuAfterEditorClosed = true;
    } else {
      DrawerService.open('right');
      executeEditorAboutToOpenCallbacks(type, item);
    }

    return promise;
  };

  $scope.closeEditor = function closeEditor() {
    DrawerService.close('right');
  };

  $scope.toggleMenu = function toggleMenu() {
    DrawerService.toggle('left');
  };

  $scope.isEditorVisible = function isEditorVisible() {
    return DrawerService.isOpen('right');
  };

  $scope.isMenuVisible = function isMenuVisible() {
    return DrawerService.isOpen('left');
  };

  // FEATURE CHANGING

  var featurePendingOpen;
  $scope.changeFeature = function(feature, data, initial){

    var currentFeature = UISessionService.getCurrentFeatureName();
    var currentData = UISessionService.getFeatureData();

    if (!(currentFeature === feature && currentData === data)) {
      if (!$scope.features[feature].loaded) $scope.features[feature].loaded = true;

      if (!$scope.isMenuVisible() && !initial){
        // Open only after menu has been opened
        featurePendingOpen = {
          feature: feature,
          data: data
        };
        $scope.toggleMenu();
      }else{

        // issue a 500ms lock to prevent leave animation to prevent items from fading
        // on list change
        UISessionService.lock('leaveAnimation', 500);

        var state = UISessionService.getFeatureState(feature);
        if (!$scope.$$phase && !$rootScope.$$phase){
          UISessionService.changeFeature(feature, data, state);
          $scope.$digest();
        }else{
          UISessionService.changeFeature(feature, data, state);
        }
        AnalyticsService.visit(feature);
      }
    }
  };

  $scope.isFeatureLoaded = function(feature){
    return $scope.features[feature].loaded;
  };

  $scope.getActiveFeature = function getActiveFeature() {
    return UISessionService.getCurrentFeatureName();
  };

  $scope.isFeatureActive = function isFeatureActive(feature) {
    return $scope.getActiveFeature() === feature;
  };

  $scope.getFeatureMap = function(feature){
    return $scope.features[feature];
  }

  // Start from tasks
  $scope.changeFeature('tasks', undefined, true);

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
      UserService.updateAccountPreferences();
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
      $scope.listsSelectOptions = $scope.lists.clone();  // http://davidwalsh.name/javascript-clone-array
      // Push a fake list as archived list delimiter
      $scope.listsSelectOptions.push({uuid: UUIDService.generateFakeUUID(), title: '--------', delimiter: true});
      $scope.listsSelectOptions = $scope.listsSelectOptions.concat($scope.archivedLists);
    } else if ($scope.lists.length && !$scope.archivedLists.length) {
      $scope.listsSelectOptions = $scope.lists.clone();  // http://davidwalsh.name/javascript-clone-array
    } else if ($scope.archivedLists.length && !$scope.lists.length) {
      $scope.listsSelectOptions = $scope.archivedLists.clone();
    } else {
      $scope.listsSelectOptions = [];
    }
    $scope.listsSelectOptions.unshift({
      uuid: UUIDService.generateFakeUUID(),
      title: 'add list&#8230;',
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

  $rootScope.loading = false;
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
            $rootScope.loading = true;
          });
        }
        SynchronizeService.synchronize(activeUUID).then(function(firstSync) {
          UserSessionService.setItemsSynchronized(activeUUID);
          $rootScope.loading = false;
          if (firstSync){
            // Also immediately after first sync start syncing all others
            $rootScope.isCompletedAndArchivedLoading = true;
            SynchronizeService.synchronizeCompletedAndArchived(activeUUID).then(function(){
              $rootScope.isCompletedAndArchivedLoading = false;
            });
          }
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


  // CALLBACKS

  var editorAboutToOpenCallbacks = {};
  var editorOpenedCallbacks = {};
  var editorAboutToCloseCallbacks = {};
  var editorClosedCallbacks = {};

  // register editor callbacks
  $scope.registerEditorAboutToOpenCallback = function (callback, id) {
    editorAboutToOpenCallbacks[id] = callback;
  };
  $scope.unregisterEditorAboutToOpenCallback = function (callback, id) {
    if (editorAboutToOpenCallbacks[id]) delete editorAboutToOpenCallbacks[id];
  };

  $scope.registerEditorOpenedCallback = function(callback, id) {
    editorOpenedCallbacks[id] = callback;
  };
  $scope.unregisterEditorOpenedCallback = function(id) {
    if (editorOpenedCallbacks[id]) delete editorOpenedCallbacks[id];
  };

  $scope.registerEditorAboutToClose = function(callback, id) {
    editorAboutToCloseCallbacks[id] = callback;
  };

  $scope.registerEditorClosedCallback = function(callback, id) {
    editorClosedCallbacks[id] = callback;
  };
  $scope.unregisterEditorClosedCallback = function(id) {
    if (editorClosedCallbacks[id]) delete editorClosedCallbacks[id];
  };

  // register drawer callbacks to DrawerService

  function executeEditorAboutToOpenCallbacks(editorType, item) {
    for (var id in editorAboutToOpenCallbacks)
      editorAboutToOpenCallbacks[id](editorType, item);
  }

  DrawerService.registerOpenedCallback('right', editorOpened, 'MainController');
  function editorOpened() {
    for (var id in editorOpenedCallbacks) {
      editorOpenedCallbacks[id]();
    }
  }

  DrawerService.registerClosedCallback('right', editorClosed, 'MainController');
  function editorClosed() {
    if (openMenuAfterEditorClosed) {
      // Snap.js clears transition style from drawer aisle element and executes closed (animated) callback.
      // Wait until DOM manipulation is ready before opening editor
      // to have correct transition style in drawer aisle element.
      setTimeout(function() {
        DrawerService.open('left');
        openMenuAfterEditorClosed = false;
      }, 0);
    }
    for (var id in editorClosedCallbacks)
      editorClosedCallbacks[id]();

    // Don't remove list items from list before editor has been closed.
    // See: listItemLeaveAnimation in listItemDirective.
    UISessionService.resolveDeferredActions('editorClose');
  }

  DrawerService.registerOpenedCallback('left', menuOpened, 'MainController');
  function menuOpened() {
    if (featurePendingOpen){
      $scope.changeFeature(featurePendingOpen.feature, featurePendingOpen.data);
      featurePendingOpen = undefined;
    }
  }

  DrawerService.registerClosedCallback('left', menuClosed, 'MainController');
  function menuClosed() {
    if (openEditorAfterMenuClosed) {
      // Snap.js clears transition style from drawer aisle element and executes closed (animated) callback.
      // Wait until DOM manipulation is ready before opening editor
      // to have correct transition style in drawer aisle element.
      $timeout(function() {
        executeEditorAboutToOpenCallbacks(openEditorAfterMenuClosed.type, openEditorAfterMenuClosed.item);
        openEditorAfterMenuClosed = undefined;
        DrawerService.open('right');
      });
    }
  }

  // UI FUNCTIONS

  var hideToolbar = false;
  $scope.isToolbarHidden = function(){
    return hideToolbar;
  }

  $scope.hideToolbar = function(){
    hideToolbar = true;
  }
  $scope.showToolbar = function(){
    hideToolbar = false;
  }

  // INJECT OTHER CONTENT CONTROLLERS HERE

  $controller('TasksController',{$scope: $scope});
  $controller('ListsController',{$scope: $scope});
  $controller('TagsController',{$scope: $scope});
  $controller('NotesController',{$scope: $scope});
  $controller('ItemsController',{$scope: $scope});
}

MainController['$inject'] = [
'$controller', '$filter', '$rootScope', '$scope', '$timeout', '$window',
'UserService', 'AnalyticsService', 'ArrayService', 'DrawerService', 'ItemsService', 'ListsService',
'NotesService', 'SwiperService', 'SynchronizeService','TagsService', 'TasksService',
'UISessionService', 'UserSessionService', 'UUIDService'
];
angular.module('em.main').controller('MainController', MainController);
