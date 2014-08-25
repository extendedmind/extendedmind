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
 'use strict';

 function ArchiveController($scope, ListsService, NotesService, SwiperService, TasksService, SynchronizeService, UISessionService) {
  $scope.archiveSlides = [];

  function setCompletedTaskLimit(fullCompleteTasksSize) {
    if (fullCompleteTasksSize < 25) {
      $scope.completedTasksLimit = fullCompleteTasksSize;
    }
  }
  $scope.createFullCompletedTasks(setCompletedTaskLimit, 'ArchiveController');

  $scope.slides = {
    leftSlide: {
      slideName: 'completed',
      slideIndex: 0
    },
    centerSlide: {
      slideName: 'lists',
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
  $scope.isCompletedAndArchivedLoading = true;
  $scope.completedTasksLimit = 0;

  SynchronizeService.synchronizeCompletedAndArchived(UISessionService.getActiveUUID()).then(function() {
    $scope.isCompletedAndArchivedLoading = false;
  });

  $scope.getCompletedTasksLimit = function getCompletedTasksLimit() {
    return $scope.completedTasksLimit;
  };

  $scope.addMoreCompleted = function addMoreCompleted() {
    if ($scope.completedTasksLimit !== $scope.fullCompletedTasks.length) {
      // There is still more to add, add in batches of 25
      if ($scope.completedTasksLimit + 25 < $scope.fullCompletedTasks.length) {
        $scope.completedTasksLimit += 25;
      } else {
        $scope.completedTasksLimit = $scope.fullCompletedTasks.length;
      }
    }
  };

  function getTodayMidnight() {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  function getPreviousDay(numberOfDays) {
    var today = getTodayMidnight();
    return new Date(today.setDate(today.getDate() - numberOfDays));
  }

  function getMondayThisWeek() {
    var today = getTodayMidnight();
    var day = today.getDay();
    var diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(today.setDate(diff));
  }

  function getFirstOfPreviousMonth(numberOfMonths) {
    var today = getTodayMidnight();
    if (!numberOfMonths) numberOfMonths = 0;
    return new Date(today.getFullYear(), today.getMonth() - numberOfMonths, 1);
  }

  function getFirstOfThisYear() {
    var today = getTodayMidnight();
    return new Date(today.getFullYear(), 0, 1);
  }


  var todayShown = false;
  $scope.showToday = function(completedTask, first) {
    if (first) todayShown = false;
    if (!todayShown) {
      if (completedTask.completed > getTodayMidnight().getTime()) {
        todayShown = true;
        return true;
      }
    }
  };

  var yesterdayShown = false;
  $scope.showYesterday = function showYesterday(completedTask, first) {
    if (first) yesterdayShown = false;
    if (!yesterdayShown) {
      // Today is the upper border
      if (completedTask.completed < getTodayMidnight().getTime()) {
        if (completedTask.completed > getPreviousDay(1).getTime()) {
          yesterdayShown = true;
          return true;
        }
      }
    }
  };


  var thisWeekShown = false;
  $scope.showThisWeek = function showThisWeek(completedTask, first) {
    if (first) thisWeekShown = false;
    if (!thisWeekShown) {
      // Yesterday is the upper border
      if (completedTask.completed < getPreviousDay(1).getTime()) {
        // Get Monday of this week as the other border
        if (completedTask.completed > getMondayThisWeek().getTime()) {
          thisWeekShown = true;
          return true;
        }
      }
    }
  };

  var thisMonthShown = false;
  $scope.showThisMonth = function showThisMonth(completedTask, first) {
    if (first) thisMonthShown = false;
    if (!thisMonthShown) {
      // Get Monday of this week as the lower border
      if (completedTask.completed < getMondayThisWeek().getTime()) {
        // Get Monday of this week as the other border
        if (completedTask.completed > getFirstOfPreviousMonth().getTime()) {
          thisMonthShown = true;
          return true;
        }
      }
    }
  };

  var lastMonthShown = false;
  $scope.showLastMonth = function showLastMonth(completedTask, first) {
    if (first) lastMonthShown = false;
    if (!lastMonthShown) {
      if (completedTask.completed < getFirstOfPreviousMonth().getTime()) {
        if (completedTask.completed > getFirstOfPreviousMonth(1).getTime()) {
          lastMonthShown = true;
          return true;
        }
      }
    }
  };

  var thisYearShown = false;
  $scope.showThisYear = function showThisYear(completedTask, first) {
    if (first) thisYearShown = false;
    if (!thisYearShown) {
      if (completedTask.completed < getFirstOfPreviousMonth(1).getTime()) {
        if (completedTask.completed > getFirstOfThisYear().getTime()) {
          thisYearShown = true;
          return true;
        }
      }
    }
  };


  var lastYearShown = false;
  $scope.showLastYear = function showLastYear(completedTask, first) {
    if (first) lastYearShown = false;
    if (!lastYearShown) {
      if (completedTask.completed < getFirstOfThisYear().getTime()) {
        lastYearShown = true;
        return true;
      }
    }
  };

  $scope.getFirstShown = function getFirstShown() {
    if (todayShown) return 'today';
    if (yesterdayShown) return 'yesterday';
    if (thisWeekShown) return 'thisWeek';
    if (thisMonthShown) return 'thisMonth';
    if (lastMonthShown) return 'lastMonth';
    if (thisYearShown) return 'thisYear';
    if (lastYearShown) return 'lastYear';
  };

  function swiperCreatedCallback() {
    // push rest of the horizontal slides to archiveSlides
    if ($scope.archiveSlides.length === 1) {
      for (var slide in $scope.slides) {
        if ($scope.slides.hasOwnProperty(slide)) {
          if ($scope.archiveSlides.indexOf($scope.slides[slide]) === -1) $scope.archiveSlides.push($scope.slides[slide]);
        }
      }
    }
  }
  SwiperService.registerSwiperCreatedCallback(swiperCreatedCallback, 'archive', 'ArchiveController');

  // Navigation

  $scope.showArchivedListDetails = function showArchivedListDetails(selectedList) {
    $scope.archivedList = selectedList;
    SwiperService.swipeTo('archive/details');
  };

  $scope.deleteListAndShowArchivedLists = function deleteListAndShowArchivedLists(list) {
    SwiperService.swipeTo('archive/lists');
    $scope.deleteList(list);
    $scope.archivedList = undefined;
  };
}

ArchiveController['$inject'] = ['$scope', 'ListsService', 'NotesService', 'SwiperService', 'TasksService', 'SynchronizeService', 'UISessionService'];
angular.module('em.archive').controller('ArchiveController', ArchiveController);
