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
                        UserService, AnalyticsService, ArrayService, DrawerService, ItemsService,
                        ListsService, NotesService, SwiperService, SynchronizeService, TagsService,
                        TasksService, UISessionService, UserSessionService, packaging) {

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
    trash: {
      heading: 'trash'
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
  $scope.openEditor = function openEditor(type, item, mode) {

    // Check for existing edit locks and resolve them first.
    var deferredEditorClose = UISessionService.getDeferredAction('editorClose');
    if (deferredEditorClose) deferredEditorClose.resolve();

    var promise = UISessionService.deferAction('editorClose');

    if (DrawerService.isOpen('left')) {
      DrawerService.close('left');
      openEditorAfterMenuClosed = {type: type, item: item, mode: mode};
      openMenuAfterEditorClosed = true;
    } else {
      DrawerService.open('right');
      executeEditorAboutToOpenCallbacks(type, item, mode);
    }

    return promise;
  };

  $scope.closeEditor = function closeEditor() {
    DrawerService.close('right');
    executeAboutToCloseCallbacks();
  };

  $scope.toggleMenu = function() {
    DrawerService.toggle('left');
  };

  $scope.closeMenu = function() {
    DrawerService.close('left');
  };

  $scope.openMenu = function() {
    if (!$scope.isMenuVisible()){
      DrawerService.open('left');
    }
  };

  $scope.isEditorVisible = function isEditorVisible() {
    return DrawerService.isOpen('right');
  };

  $scope.isMenuVisible = function isMenuVisible() {
    return DrawerService.isOpen('left');
  };

  $scope.isFooterNavigationHidden = function(){
    return $scope.onboardingInProgress || UserSessionService.getUIPreference('hideFooter');
  }

  $scope.isVibrationDisabled = function(){
    return UserSessionService.getUIPreference('hideFooter');
  }

  // FEATURE CHANGING

  var featurePendingOpen;
  $scope.changeFeature = function(feature, data, toggleMenu, pending){
    var currentFeature = UISessionService.getCurrentFeatureName();
    var currentData = UISessionService.getFeatureData();

    if (!(currentFeature === feature && currentData === data)) {
      if (!$scope.isMenuVisible() && toggleMenu){
        // Open only after menu has been opened
        featurePendingOpen = {
          feature: feature,
          data: data
        };
        $scope.openMenu();
      }else {

        if (!$scope.features[feature].loaded) $scope.features[feature].loaded = true;

        // issue a 500ms lock to prevent leave animation to prevent items from fading
        // on list change
        UISessionService.lock('leaveAnimation', 500);

        var state = UISessionService.getFeatureState(feature);

        UISessionService.changeFeature(feature, data, state);
        if (!$scope.$$phase && !$rootScope.$$phase){
          $scope.$digest();
        }
        if (toggleMenu && pending){
          $timeout(function(){
            $scope.closeMenu();
          }, 300);
        }
      }

      AnalyticsService.visit(feature);
    }
    // Run special case focus callbacks because drawer-handle directive does not re-register itself when
    // feature changes to focus.
    if (feature === 'focus' && typeof focusActiveCallback === 'function')
      focusActiveCallback();
  };

  $scope.isFeatureLoaded = function(feature){
    return $rootScope.syncState !== 'active' && $scope.features[feature].loaded;
  };

  $scope.getActiveFeature = function getActiveFeature() {
    return UISessionService.getCurrentFeatureName();
  };

  $scope.isFeatureActive = function isFeatureActive(feature) {
    return $rootScope.syncState !== 'active' && $scope.getActiveFeature() === feature;
  };

  $scope.getFeatureMap = function(feature){
    return $scope.features[feature];
  };

  var focusActiveCallback;
  $scope.registerFocusActivateCallback = function(activateFn) {
    focusActiveCallback = activateFn;
  };

  // ONBOARDING

  $scope.onboardingInProgress = false;
  var onboardingPhase;
  var userPreferences = UserSessionService.getPreferences();
  if (!userPreferences || (userPreferences && !userPreferences.onboarded)) {
    $scope.onboardingInProgress = true;
    onboardingPhase = 'new';
  }

  function isOnboardingItemCreated(feature){
    if (feature === 'tasks'){
      // Tasks onboarding is not ready if there are no tasks
      if ($scope.allActiveTasks && $scope.allActiveTasks.length === 0){
        return false;
      }
    }else if (feature === 'notes'){
      // Notes onboarding is not ready if there are no notes
      if ($scope.allNotes && $scope.allNotes.length === 0){
        return false;
      }
    }else if (feature === 'lists'){
      // Lists onboarding is not ready if there are no lists
      if ($scope.allLists && $scope.allLists.length === 0){
        return false;
      }
    }
    return true;
  }

  var listOnboardingMap = {};
  $scope.checkListOnboardingLock = function(feature, status){
    return listOnboardingMap[feature] && listOnboardingMap[feature].lock === status;
  };

  $scope.turnOffListOnboardingLock = function(param){
    var feature = param;

    if (angular.isObject(param)){
      for (var featureKey in listOnboardingMap){
        if (listOnboardingMap[featureKey] === param){
          feature = featureKey;
          break;
        }
      }
    }
    if (listOnboardingMap[feature] && listOnboardingMap[feature].lock === 'on'){
      listOnboardingMap[feature].lock = 'off';
      AnalyticsService.do(feature + 'Onboarded');
    }
  };

  $scope.isOnboardingNotReady = function(feature){
    if (!$scope.onboardingInProgress) return false;
    return !listOnboardingMap[feature] ||
                    !listOnboardingMap[feature].lock ||
                    listOnboardingMap[feature].lock === 'on';
  };

  $scope.isListOnboardingLockedOrReleased = function(feature){
    return listOnboardingMap[feature] && (listOnboardingMap[feature].lock === 'on' ||
           listOnboardingMap[feature].lock === 'released');
  };

  $scope.isOnboarded = function(feature){
    if ($scope.onboardingInProgress && $scope.checkListOnboardingLock(feature, undefined)){
      return isOnboardingItemCreated(feature);
    }else if (!$scope.onboardingInProgress){
      return true;
    }
  };

  $scope.completeOnboarding = function(){
    $scope.onboardingInProgress = false;
    UserSessionService.setPreference('onboarded', packaging);
    UserService.saveAccountPreferences();
    AnalyticsService.do('onboarded');
  };

  $scope.setListOnboarding = function (feature, listOnboarding) {
    listOnboardingMap[feature] = listOnboarding;
  };

  // Start from tasks on onboarding, or later on, from focus
  if (!$scope.onboardingInProgress){
    $scope.changeFeature('focus');
  }else{
    $scope.changeFeature('tasks');
  }

  // DATA ARRAYS

  $scope.items = ItemsService.getItems(UISessionService.getActiveUUID());
  $scope.tasks = TasksService.getTasks(UISessionService.getActiveUUID());
  $scope.archivedTasks = TasksService.getArchivedTasks(UISessionService.getActiveUUID());
  $scope.notes = NotesService.getNotes(UISessionService.getActiveUUID());
  $scope.archivedNotes = NotesService.getArchivedNotes(UISessionService.getActiveUUID());
  $scope.lists = ListsService.getLists(UISessionService.getActiveUUID());
  $scope.archivedLists = ListsService.getArchivedLists(UISessionService.getActiveUUID());
  $scope.tags = TagsService.getTags(UISessionService.getActiveUUID());
  $scope.deletedItems = ItemsService.getDeletedItems(UISessionService.getActiveUUID());
  $scope.deletedTasks = TasksService.getDeletedTasks(UISessionService.getActiveUUID());
  $scope.deletedNotes = NotesService.getDeletedNotes(UISessionService.getActiveUUID());
  $scope.deletedLists = ListsService.getDeletedLists(UISessionService.getActiveUUID());
  $scope.deletedTags = TagsService.getDeletedTags(UISessionService.getActiveUUID());

  $scope.$watch('tags.length', function(/*newValue, oldValue*/) {
    $scope.contexts = $filter('filter')($scope.tags, {tagType: 'context'});
    $scope.keywords = $filter('filter')($scope.tags, {tagType: 'keyword'});
  });

  function combineListsArrays() {
    if ($scope.archivedLists.length && $scope.lists.length) {
      $scope.allLists = $scope.lists.concat($scope.archivedLists);
    } else if ($scope.lists.length && !$scope.archivedLists.length) {
      $scope.allLists = $scope.lists;
    } else if ($scope.archivedLists.length && !$scope.lists.length) {
      $scope.allLists = $scope.archivedLists;
    } else {
      $scope.allLists = [];
    }
    $scope.refreshFavoriteLists();
  }

  $scope.$watch('lists.length', function(/*newValue, oldValue*/) {
    combineListsArrays();
  });
  $scope.$watch('archivedLists.length', function(/*newValue, oldValue*/) {
    combineListsArrays();
  });

  $scope.refreshFavoriteLists = function(){
    // Can not refresh if allLists array has not been created yet
    if ($scope.allLists && $rootScope.synced){
      $scope.favoriteLists = [];
      var favoriteListUuids = UserSessionService.getUIPreference('favoriteLists');
      if (favoriteListUuids){
        var len = favoriteListUuids.length;
        var deleted = false;
        while (len--) {
          var favoriteList = $scope.allLists.findFirstObjectByKeyValue('uuid', favoriteListUuids[len]);
          if (favoriteList){
            $scope.favoriteLists.unshift(favoriteList);
          }else{
            // Favorite list is not among all lists, splice it from the array
            favoriteListUuids.splice(len, 1);
            deleted = true;
          }
        }
        if (deleted){
          UserSessionService.setUIPreference('favoriteLists', favoriteListUuids);
          UserService.saveAccountPreferences();
        }
      }
    }
  };

  $scope.isFavoriteList = function (list) {
    if ($scope.favoriteLists && $scope.favoriteLists.length &&
        $scope.favoriteLists.indexOf(list) !== -1){
      return true;
    }
  };

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
  }

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

  // Deleted items
  function combineDeletedArrays(/*changedArray*/) {
    var allNotesAndTasks = ArrayService.combineArrays($scope.deletedNotes,
                                                      $scope.deletedTasks, 'deleted', true);
    var allNotesAndTasksAndLists = ArrayService.combineArrays(allNotesAndTasks,
                                                              $scope.deletedLists, 'deleted', true);
    var allNotesAndTasksAndListsAndItems = ArrayService.combineArrays(allNotesAndTasksAndLists,
                                                    $scope.deletedItems, 'deleted', true);
    $scope.allDeleted = ArrayService.combineArrays(allNotesAndTasksAndListsAndItems,
                                                    $scope.deletedTags, 'deleted', true);
  }
  $scope.$watch('deletedItems.length', function(/*newValue, oldValue*/) {
    combineDeletedArrays($scope.deletedItems);
  });
  $scope.$watch('deletedTasks.length', function(/*newValue, oldValue*/) {
    combineDeletedArrays($scope.deletedTasks);
  });
  $scope.$watch('deletedNotes.length', function(/*newValue, oldValue*/) {
    combineDeletedArrays($scope.deletedNotes);
  });
  $scope.$watch('deletedLists.length', function(/*newValue, oldValue*/) {
    combineDeletedArrays($scope.deletedLists);
  });
  $scope.$watch('deletedTags.length', function(/*newValue, oldValue*/) {
    combineDeletedArrays($scope.deletedTags);
  });

  // BACKEND POLLING

  var synchronizeItemsTimer;
  var synchronizeItemsDelay = 12 * 1000;
  var itemsSynchronizedThreshold = 10 * 1000; // 10 seconds in milliseconds
  var itemsSynchronizeCounter = 0; // count the number of syncs in this session
  var userSyncCounterTreshold = 5; // sync user every fifth sync
  var userSyncTimeTreshold = 60000; // sync user if there has been a minute of non-syncing


  // Start synchronize interval or just start synchronize interval.
  synchronizeItemsAndSynchronizeItemsDelayed();

  // Global variable bindToFocusEvent specifies if focus event should be listened to. Variable is true
  // by default for browsers, where hidden tab should not poll continuously, false in Cordova where
  // javascript execution is paused anyway when app is not in focus.
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

  function updateItemsSyncronized(activeUUID){
    var timestamp = Date.now();
    UserSessionService.setItemsSynchronized(timestamp, activeUUID);
    $rootScope.synced = timestamp;
    $rootScope.syncState = 'ready';
    $scope.refreshFavoriteLists();
  }

  // Synchronize items if not already synchronizing and interval reached.

  function synchronizeItems() {
    $scope.registerActivity();
    var activeUUID = UISessionService.getActiveUUID();
    // First check that the user has login
    if ((!$rootScope.syncState || $rootScope.syncState === 'ready' ||
        $rootScope.syncState === 'error') && activeUUID) {

      // User has logged in, now set when user was last synchronized
    $rootScope.synced = UserSessionService.getItemsSynchronized(activeUUID);
    var sinceLastItemsSynchronized = Date.now() - UserSessionService.getItemsSynchronized(activeUUID);
    if (isNaN(sinceLastItemsSynchronized) || sinceLastItemsSynchronized > itemsSynchronizedThreshold) {
      $scope.$evalAsync(function() {
        if (!$rootScope.synced){
            // This is the first load for the user
            $rootScope.syncState = 'active';
          }else{
            $rootScope.syncState = 'modified';
          }
        });

      SynchronizeService.synchronize(activeUUID).then(function(firstSync) {
        if (firstSync){
          // Also immediately after first sync add completed and archived to the mix
          $rootScope.syncState = 'completedAndArchived';
          SynchronizeService.addCompletedAndArchived(activeUUID).then(function(){
            updateItemsSyncronized(activeUUID);
          }, function(){
            $rootScope.syncState = 'error';
          });
        }else{
          updateItemsSyncronized(activeUUID);
        }

        // If there has been a long enough time from last sync, update account preferences as well
        if (itemsSynchronizeCounter === 0 ||
            itemsSynchronizeCounter%userSyncCounterTreshold === 0 ||
            sinceLastItemsSynchronized > userSyncTimeTreshold){
            SynchronizeService.synchronizeUser(activeUUID).then(function(){
              $scope.refreshFavoriteLists();
            });
          }
          itemsSynchronizeCounter++;
        }, function(){
          $rootScope.syncState = 'error';
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

  $scope.registerEditorAboutToCloseCallback = function(callback, id) {
    editorAboutToCloseCallbacks[id] = callback;
  };
  $scope.unregisterEditorAboutToCloseCallback = function(id) {
    if (editorAboutToCloseCallbacks[id]) delete editorAboutToCloseCallbacks[id];
  };

  $scope.registerEditorClosedCallback = function(callback, id) {
    editorClosedCallbacks[id] = callback;
  };
  $scope.unregisterEditorClosedCallback = function(id) {
    if (editorClosedCallbacks[id]) delete editorClosedCallbacks[id];
  };

  // register drawer callbacks to DrawerService

  function executeEditorAboutToOpenCallbacks(editorType, item, mode) {
    for (var id in editorAboutToOpenCallbacks)
      editorAboutToOpenCallbacks[id](editorType, item, mode);
  }

  DrawerService.registerOpenedCallback('right', editorOpened, 'MainController');
  function editorOpened() {
    for (var id in editorOpenedCallbacks) {
      editorOpenedCallbacks[id]();
    }
  }

  function executeAboutToCloseCallbacks() {
    for (var id in editorAboutToCloseCallbacks) {
      editorAboutToCloseCallbacks[id]();
    }
  }

  DrawerService.registerAboutToCloseCallback('right', editorAboutToClose, 'MainController');
  function editorAboutToClose() {
    executeAboutToCloseCallbacks();
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
      $scope.changeFeature(featurePendingOpen.feature,
                           featurePendingOpen.data,
                           true,
                           true);
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
        executeEditorAboutToOpenCallbacks(openEditorAfterMenuClosed.type,
                                          openEditorAfterMenuClosed.item,
                                          openEditorAfterMenuClosed.mode);
        openEditorAfterMenuClosed = undefined;
        DrawerService.open('right');
      });
    }
  }

  // UI FUNCTIONS

  $scope.customToolbar = undefined;
  $scope.isCustomToolbar = function(){
    return $scope.customToolbar;
  };

  $scope.swapToCustomToolbar = function(toolbar){
    $scope.customToolbar = toolbar;
  };

  $scope.resetToDefaultToolbar = function(){
    $scope.customToolbar = undefined;
  };

  // INJECT OTHER CONTENT CONTROLLERS HERE

  $controller('TasksController',{$scope: $scope});
  $controller('ListsController',{$scope: $scope});
  $controller('TagsController',{$scope: $scope});
  $controller('NotesController',{$scope: $scope});
  $controller('ItemsController',{$scope: $scope});
  $controller('UserController',{$scope: $scope});
}

MainController['$inject'] = [
'$controller', '$filter', '$rootScope', '$scope', '$timeout', '$window',
'UserService', 'AnalyticsService', 'ArrayService', 'DrawerService', 'ItemsService', 'ListsService',
'NotesService', 'SwiperService', 'SynchronizeService','TagsService', 'TasksService',
'UISessionService', 'UserSessionService', 'packaging'
];
angular.module('em.main').controller('MainController', MainController);
