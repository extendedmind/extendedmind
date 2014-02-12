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

  var itemsSynchronizeTimer;
  var itemsSynchronizedThreshold = 10 * 1000; // 10 seconds in milliseconds
  itemsSynchronize();
  angular.element($window).bind('focus', itemsSynchronize);

  // https://developer.mozilla.org/en/docs/Web/API/window.setInterval
  (function itemsSynchronizeLoop() {
    itemsSynchronizeTimer = $timeout(function() {
      itemsSynchronize();
      itemsSynchronizeLoop();
    }, itemsSynchronizedThreshold);
  })();

  // Synchronize items if not already synchronizing and interval reached
  function itemsSynchronize() {
    if (!UserSessionService.isItemsSynchronizing(UserSessionService.getActiveUUID())) {
      var itemsSynchronized = Date.now() - UserSessionService.getItemsSynchronized(UserSessionService.getActiveUUID());
      
      if (isNaN(itemsSynchronized) || itemsSynchronized > itemsSynchronizedThreshold) {
        UserSessionService.setItemsSynchronizing(UserSessionService.getActiveUUID());

        ItemsService.synchronize(UserSessionService.getActiveUUID()).then(function() {
          UserSessionService.setItemsSynchronized(UserSessionService.getActiveUUID());
        }, function() {
          // TODO Don't start timer and don't bind again.
          angular.element($window).unbind('focus', itemsSynchronize);
          $timeout.cancel(itemsSynchronizeTimer);
        });
      }
    }
  }
  $scope.$on('$destroy', function() {
    angular.element($window).unbind('focus', itemsSynchronize);
    // http://www.bennadel.com/blog/2548-Don-t-Forget-To-Cancel-timeout-Timers-In-Your-destroy-Events-In-AngularJS.htm
    $timeout.cancel(itemsSynchronizeTimer);
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
                             'FilterService', 'SwiperService', 'TasksSlidesService', 'NotesSlidesService'
                            ];
angular.module('em.app').controller('MainController', MainController);
