'use strict';

// Controller for all main slides
// Holds a reference to all the item arrays. There is no sense in limiting
// the arrays because everything is needed anyway to get home and inbox to work,
// which are part of every main slide collection. 
function MainController(
  $scope, $location, $rootScope, $timeout, $window, $filter,
  UserSessionService, BackendClientService, ItemsService, ListsService,
  TagsService, TasksService, NotesService, FilterService, SwiperService,
  TasksSlidesService, NotesSlidesService) {
  // Data arrays 
  $scope.items = ItemsService.getItems(UserSessionService.getActiveUUID());
  $scope.tasks = TasksService.getTasks(UserSessionService.getActiveUUID());
  $scope.notes = NotesService.getNotes(UserSessionService.getActiveUUID());
  $scope.lists = ListsService.getLists(UserSessionService.getActiveUUID());
  $scope.tags = TagsService.getTags(UserSessionService.getActiveUUID());

  $scope.$watch('tags.length', function(newValue, oldValue) {
    $scope.contexts = $filter('filter')($scope.tags, {tagType:'context'});
  });

  $scope.ownerPrefix = UserSessionService.getOwnerPrefix();
  $scope.filterService = FilterService;

  // Backend polling

  var synchronizeItemsTimer;
  var synchronizeItemsDelay = 12 * 1000;
  var itemsSynchronizedThreshold = 10 * 1000; // 10 seconds in milliseconds

  // Start synchronize interval or just start synchronize interval. 
  synchronizeItemsAndSynchronizeItemsDelayed();

  // Global variable bindToFocusEvent specifies if focus event should be wathed. Variable is true by default
  // for browsers, where hidden tab should not poll continuously, false in PhoneGap, because javascript
  // execution is paused anyway when app is not in focus.
  var bindToFocus = (typeof bindToFocusEvent !== 'undefined') ? bindToFocusEvent: true;
  if (bindToFocus) {
    angular.element($window).bind('focus', synchronizeItemsAndSynchronizeItemsDelayed);
    angular.element($window).bind('blur', cancelSynchronizeItemsDelayed);
  }

  function setMobileOrDesktop(width) {
    if (width <= 480) {
      $rootScope.isDesktop = false;
      $rootScope.isMobile = true;
    } else {
      $rootScope.isMobile = false;
      $rootScope.isDesktop = true;
    }
  }
  setMobileOrDesktop($window.innerWidth);

  function windowResized() {
    setMobileOrDesktop($window.innerWidth);
  }

  angular.element($window).bind('resize', windowResized);

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
    angular.element($window).unbind('resize', windowResized);
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
    if ($scope.lists.length > 0){
      if ($scope.feature === 'tasks') {
        SwiperService.swipeTo(TasksSlidesService.LISTS + '/' + $scope.lists[0].uuid);
      }else if ($scope.feature === 'notes') {
        SwiperService.swipeTo(NotesSlidesService.LISTS + '/' + $scope.lists[0].uuid);
      }
    }
  };

  $scope.gotoUncategorized = function() {
    if ($scope.feature === 'tasks') {
      SwiperService.swipeTo(TasksSlidesService.LISTS + '/uncategorized');
    }else if ($scope.feature === 'notes') {
      SwiperService.swipeTo(NotesSlidesService.LISTS + '/uncategorized');
    }
  };

  $scope.gotoContexts = function() {
    if ($scope.feature === 'tasks') {
      // Swipe to the first context
      for (var i=0, len=$scope.tags.length; i<len; i++) {
        if ($scope.tags[i].tagType === 'context'){
          SwiperService.swipeTo(TasksSlidesService.LISTS + '/' + $scope.tags[i].uuid);
          return;
        }
      }
    }
  };
}

MainController.$inject = [
'$scope', '$location', '$rootScope', '$timeout', '$window', '$filter',
'UserSessionService', 'BackendClientService', 'ItemsService', 'ListsService',
'TagsService', 'TasksService', 'NotesService', 'FilterService', 'SwiperService',
'TasksSlidesService', 'NotesSlidesService'
];
angular.module('em.app').controller('MainController', MainController);
