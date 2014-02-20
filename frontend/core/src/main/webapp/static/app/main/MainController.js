'use strict';

// Controller for all main slides
// Holds a reference to all the item arrays. There is no sense in limiting
// the arrays because everything is needed anyway to get home and inbox to work,
// which are part of every main slide collection. 
function MainController($scope, $location, $timeout, $window, UserSessionService, ItemsService, ListsService, TagsService, TasksService, NotesService, FilterService, SwiperService, TasksSlidesService, NotesSlidesService) {
  $scope.items = ItemsService.getItems(UserSessionService.getActiveUUID());
  $scope.tasks = TasksService.getTasks(UserSessionService.getActiveUUID());
  $scope.notes = NotesService.getNotes(UserSessionService.getActiveUUID());
  $scope.lists = ListsService.getLists(UserSessionService.getActiveUUID());
  $scope.tags = TagsService.getTags(UserSessionService.getActiveUUID());
  $scope.ownerPrefix = UserSessionService.getOwnerPrefix();
  $scope.filterService = FilterService;

  var synchronizeItemsTimer;
  var synchronizeItemsDelay = 12 * 1000;
  var itemsSynchronizedThreshold = 10 * 1000; // 10 seconds in milliseconds
  var bindToFocus = (typeof bindToFocusEvent !== 'undefined') ? bindToFocusEvent: true;
  synchronizeItemsAndSynchronizeItemsDelayed();

  // Use bindToFocus to check is the app running in browser (true) or in PhoneGap (false).
  // Attach synchronize handler to focus and start synchronize interval or just start synchronize interval. 
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
    var activeUUID = UserSessionService.getActiveUUID();
    if (!UserSessionService.isItemsSynchronizing(activeUUID)) {
      var itemsSynchronized = Date.now() - UserSessionService.getItemsSynchronized(activeUUID);
      
      if (isNaN(itemsSynchronized) || itemsSynchronized > itemsSynchronizedThreshold) {
        UserSessionService.setItemsSynchronizing(activeUUID);
        ItemsService.synchronize(activeUUID).then(function() {
          UserSessionService.setItemsSynchronized(activeUUID);
        });
      }
    }
  }

  // Unbind window focus/blur events and stop timer and remove synchronize handler functions.
  $scope.$on('$destroy', function() {
    // http://www.bennadel.com/blog/2548-Don-t-Forget-To-Cancel-timeout-Timers-In-Your-destroy-Events-In-AngularJS.htm
    $timeout.cancel(synchronizeItemsTimer);

    if (bindToFocus) {
      angular.element($window).unbind('focus', synchronizeItemsAndSynchronizeItemsDelayed);
      angular.element($window).unbind('blur', cancelSynchronizeItemsDelayed);
    }
  });

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
      $location.path($scope.ownerPrefix + '/tasks');
    }
  };

  $scope.gotoNotes = function() {
    if ($scope.feature === 'tasks') {
      $location.path($scope.ownerPrefix + '/notes');
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

MainController['$inject'] = ['$scope', '$location', '$timeout', '$window',
                             'UserSessionService', 'ItemsService', 'ListsService',
                             'TagsService', 'TasksService', 'NotesService',
                             'FilterService', 'SwiperService', 'TasksSlidesService',
                             'NotesSlidesService'
                            ];
angular.module('em.app').controller('MainController', MainController);
