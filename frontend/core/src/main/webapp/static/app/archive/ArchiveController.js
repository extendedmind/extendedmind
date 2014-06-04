'use strict';

function ArchiveController($scope, ListsService, NotesService, SwiperService, TasksService, SynchronizeService, UISessionService, ArrayService) {
  $scope.archiveSlides = [];
  $scope.completedTasks = TasksService.getCompletedTasks(UISessionService.getActiveUUID());
  $scope.archivedTasks = TasksService.getArchivedTasks(UISessionService.getActiveUUID());
  $scope.archivedNotes = NotesService.getArchivedNotes(UISessionService.getActiveUUID());
  $scope.archivedLists = ListsService.getArchivedLists(UISessionService.getActiveUUID());

  function combineCompletedArrays(){
    var filteredArchivedTasks = [];
    var i = 0;
    while ($scope.archivedTasks[i]) {
      if ($scope.archivedTasks[i].completed !== undefined){
        filteredArchivedTasks.push($scope.archivedTasks[i]);
      }
      i++;
    }
    $scope.fullCompletedTasks =
      ArrayService.combineArrays(
        filteredArchivedTasks,
        $scope.completedTasks, 'completed', true);
    if ($scope.fullCompletedTasks.length < 25){
      $scope.completedTasksLimit = $scope.fullCompletedTasks.length;
    }
  }
  $scope.$watchCollection('archivedTasks', function(/*newValue, oldValue*/) {
    combineCompletedArrays();
  });
  $scope.$watchCollection('completedTasks', function(/*newValue, oldValue*/) {
    combineCompletedArrays();
  });

  $scope.slides = {
    leftSlide: {
      slideName: 'completed',
      slideIndex: 0
    },
    centerSlide: {
      slideName: 'overview',
      slideIndex: 1
    },
    rightSlide: {
      slideName: 'details',
      slideIndex: 2
    }
  };
  // push first horizontal slide to archiveSlides
  $scope.archiveSlides.push($scope.slides.leftSlide);

  // synchronize completed right away
  $scope.isCompletedLoading = true;
  $scope.completedTasksLimit = 0;
  $scope.isArchivedLoading = true;

  SynchronizeService.synchronizeCompleted(UISessionService.getActiveUUID()).then(function(){
    $scope.isCompletedLoading = false;
  });

  $scope.getCompletedTasksLimit = function(){
    return $scope.completedTasksLimit;
  };

  $scope.addMoreCompleted = function(){
    if ($scope.completedTasksLimit !== $scope.fullCompletedTasks.length){
      // There is still more to add, add in batches of 25
      if ($scope.completedTasksLimit + 25 < $scope.fullCompletedTasks.length){
        $scope.completedTasksLimit += 25;
      }else{
        $scope.completedTasksLimit = $scope.fullCompletedTasks.length;
      }
    }
  };

  function getTodayMidnight(){
    var today = new Date();
    today.setHours(0,0,0,0);
    return today;
  }

  function getPreviousDay(numberOfDays){
    var today = getTodayMidnight();
    return new Date(today.setDate(today.getDate()-numberOfDays));
  }

  function getMondayThisWeek(){
    var today = getTodayMidnight();
    var day = today.getDay();
    var diff = today.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    return new Date(today.setDate(diff));
  }

  function getFirstOfPreviousMonth(numberOfMonths){
    var today = getTodayMidnight();
    if (!numberOfMonths) numberOfMonths = 0;
    return new Date(today.getFullYear(), today.getMonth() - numberOfMonths, 1);
  }

  function getFirstOfThisYear(){
    var today = getTodayMidnight();
    return new Date(today.getFullYear(), 0, 1);
  }


  var todayShown = false;
  $scope.showToday = function(completedTask, first){
    if (first) todayShown = false;
    if (!todayShown){
      if (completedTask.completed > getTodayMidnight().getTime()){
        todayShown = true;
        return true;
      }
    }
  };

  var yesterdayShown = false;
  $scope.showYesterday = function(completedTask, first){
    if (first) yesterdayShown = false;
    if (!yesterdayShown){
      // Today is the upper border
      if (completedTask.completed < getTodayMidnight().getTime()){
        if (completedTask.completed > getPreviousDay(1).getTime()){
          yesterdayShown = true;
          return true;
        }
      }
    }
  };


  var thisWeekShown = false;
  $scope.showThisWeek = function(completedTask, first){
    if (first) thisWeekShown = false;
    if (!thisWeekShown){
      // Yesterday is the upper border
      if (completedTask.completed < getPreviousDay(1).getTime()){
        // Get Monday of this week as the other border
        if (completedTask.completed > getMondayThisWeek().getTime()){
          thisWeekShown = true;
          return true;
        }
      }
    }
  };

  var thisMonthShown = false;
  $scope.showThisMonth = function(completedTask, first){
    if (first) thisMonthShown = false;
    if (!thisMonthShown){
      // Get Monday of this week as the lower border
      if (completedTask.completed < getMondayThisWeek().getTime()){
        // Get Monday of this week as the other border
        if (completedTask.completed > getFirstOfPreviousMonth().getTime()){
          thisMonthShown = true;
          return true;
        }
      }
    }
  };

  var lastMonthShown = false;
  $scope.showLastMonth = function(completedTask, first){
    if (first) lastMonthShown = false;
    if (!lastMonthShown){
      if (completedTask.completed < getFirstOfPreviousMonth().getTime()){
        if (completedTask.completed > getFirstOfPreviousMonth(1).getTime()){
          lastMonthShown = true;
          return true;
        }
      }
    }
  };

  var thisYearShown = false;
  $scope.showThisYear = function(completedTask, first){
    if (first) thisYearShown = false;
    if (!thisYearShown){
      if (completedTask.completed < getFirstOfPreviousMonth(1).getTime()){
        if (completedTask.completed > getFirstOfThisYear().getTime()){
          thisYearShown = true;
          return true;
        }
      }
    }
  };


  var lastYearShown = false;
  $scope.showLastYear = function(completedTask, first){
    if (first) lastYearShown = false;
    if (!lastYearShown){
      if (completedTask.completed < getFirstOfThisYear().getTime()){
        lastYearShown = true;
        return true;
      }
    }
  };

  $scope.getFirstShown = function(){
    if (todayShown) return 'today';
    if (yesterdayShown) return 'yesterday';
    if (thisWeekShown) return 'thisWeek';
    if (thisMonthShown) return 'thisMonth';
    if (lastMonthShown) return 'lastMonth';
    if (thisYearShown) return 'thisYear';
    if (lastYearShown) return 'lastYear';
  }


  function swiperCreatedCallback() {
    // push rest of the horizontal slides to archiveSlides
    if ($scope.archiveSlides.length === 1) {
      for (var slide in $scope.slides) {
        if ($scope.slides.hasOwnProperty(slide)) {
          if ($scope.archiveSlides.indexOf($scope.slides[slide]) === -1) $scope.archiveSlides.push($scope.slides[slide]);
        }
      }
    }

    // synchronize archived after completed has been loaded
    SynchronizeService.synchronizeArchived(UISessionService.getActiveUUID()).then(function(){
      $scope.isArchivedLoading = false;
    });
  }
  SwiperService.registerSwiperCreatedCallback(swiperCreatedCallback, 'archive', 'ArchiveController');
}

ArchiveController['$inject'] = ['$scope', 'ListsService', 'NotesService', 'SwiperService', 'TasksService', 'SynchronizeService', 'UISessionService', 'ArrayService'];
angular.module('em.app').controller('ArchiveController', ArchiveController);
