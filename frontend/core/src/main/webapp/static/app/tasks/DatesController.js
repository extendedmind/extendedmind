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

 function DatesController($q, $rootScope, $scope, DateService, SwiperService) {
  var detectDayChangeBuffer = 1000;
  var dayChangeLastCheck;
  var slidePath = 'tasks/home';

  var currentWeek = DateService.generateAndReturnCurrentWeek(new Date());
  $scope.datepickerWeeks = initializeAndReturnDatepickerWeeks(currentWeek);

  $scope.activeDay = {};
  $rootScope.isDatepickerVisible = false;

  // Invoke function during compile and $scope.$apply();
  // Set initial swiper slide path to staring day or swipe to active day.
  function swipeToStartingDay(startingDay, init) {
    $scope.activeDay = startingDay || DateService.getTodayDate(currentWeek) || DateService.getMondayDate();

    $q.when(SwiperService.setInitialSlidePath(slidePath, getDateSlidePath($scope.activeDay)))
    .then(function() {
      if (!init) {
        // Need additional swiping if setting initial slide path fails to work
        SwiperService.swipeTo(getDateSlidePath($scope.activeDay));
      }
    });
  }
  swipeToStartingDay(undefined, true);

  $scope.detectDayChangeAndReturnWeekdays = function detectDayChangeAndReturnWeekdays() {
    var activeSlide = SwiperService.getActiveSlidePath($scope.getActiveFeature());
    if (activeSlide === slidePath) {
      if (!currentWeek) {
        currentWeek = DateService.generateAndReturnCurrentWeek(new Date());
        $scope.datepickerWeeks = initializeAndReturnDatepickerWeeks(currentWeek);
      } else {
        if (dayChangeLastCheck < (Date.now() - detectDayChangeBuffer)) {
          if (!DateService.isWeekValid(currentWeek)) {
            currentWeek = DateService.generateAndReturnCurrentWeek(new Date());
            $scope.datepickerWeeks = initializeAndReturnDatepickerWeeks(currentWeek);
            swipeToStartingDay();
          }
        }
      }
      dayChangeLastCheck = Date.now();
    }
    return currentWeek;
  };

  function getDateSlidePath(activeDay) {
    return slidePath + '/' + activeDay.weekday;
  }

  function initializeAndReturnDatepickerWeeks(currentWeek) {
    var datepickerWeeks = [];
    var previousWeek = DateService.generateAndReturnPreviousWeek(currentWeek);
    var nextWeek = DateService.generateAndReturnNextWeek(currentWeek);
    datepickerWeeks.push(previousWeek);
    datepickerWeeks.push(currentWeek);
    datepickerWeeks.push(nextWeek);
    return datepickerWeeks;
  }

  /**
   * @description
   * Previous, current and next week with datepicker dates.
   *
   * Either adds previous week to first and removes last week
   * or adds next week to last and removes first week.
   *
   * @param {string} direction Previous or next week.
   * @param {Array} currentWeek Current week.
   */
   function changeDatePickerWeeks(direction, currentWeek) {
    if (direction === 'previous') {
      var previousWeek = DateService.generateAndReturnPreviousWeek(currentWeek);
      $scope.datepickerWeeks.splice(($scope.datepickerWeeks.length - 1), 1);
      $scope.datepickerWeeks.unshift(previousWeek);
    } else if (direction === 'next') {
      var nextWeek = DateService.generateAndReturnNextWeek(currentWeek);
      $scope.datepickerWeeks.splice(0, 1);
      $scope.datepickerWeeks.push(nextWeek);
    }
  }

  // This function is intended to be called from datepicker directive.
  $scope.changeActiveWeek = function changeActiveWeek(direction, gotoScrollerMiddlePageCallback) {
    if (direction === 'previous') {
      $scope.changeToPreviousWeek();
    } else if (direction === 'next') {
      $scope.changeToNextWeek();
    }
    // digest is needed to remove flicker from UI
    gotoScrollerMiddlePageCallback().then($scope.$digest());
  };

  $scope.changeToPreviousWeek = function changeToPreviousWeek() {
    var weekdayIndex = $scope.activeDay.weekdayIndex;
    currentWeek = DateService.generateAndReturnPreviousWeek(currentWeek);
    changeDatePickerWeeks('previous', currentWeek);
    var newActiveDay = currentWeek[weekdayIndex];
    swipeToStartingDay(newActiveDay);
  };

  $scope.changeToNextWeek = function changeToNextWeek() {
    var weekdayIndex = $scope.activeDay.weekdayIndex;
    currentWeek = DateService.generateAndReturnNextWeek(currentWeek);
    changeDatePickerWeeks('next', currentWeek);
    var newActiveDay = currentWeek[weekdayIndex];
    swipeToStartingDay(newActiveDay);
  };

  // Register a slide change callback to swiper service
  SwiperService.registerSlideChangeCallback(slideChangeCallback, slidePath, 'DatesController');
  function slideChangeCallback(activeSlidePath) {
    if (!activeSlidePath.endsWith($scope.activeDay.weekday)) {
      for (var i = 0, len = currentWeek.length; i < len; i++) {
        if (activeSlidePath.endsWith(currentWeek[i].weekday)) {
          $scope.activeDay = currentWeek[i];
          return;
        }
      }
    }
  }

  // Pull to refresh previous/next week callbacks
  SwiperService.registerNegativeResistancePullToRefreshCallback(
    negativeResistancePullToRefreshCallback,
    slidePath,
    'DatesController');
  SwiperService.registerPositiveResistancePullToRefreshCallback(
    positiveResistancePullToRefreshCallback,
    slidePath,
    'DatesController');

  function negativeResistancePullToRefreshCallback() {
    currentWeek = DateService.generateAndReturnPreviousWeek(currentWeek);
    changeDatePickerWeeks('previous', currentWeek);
    var newActiveDay = currentWeek[6];
    swipeToStartingDay(newActiveDay);
  }
  function positiveResistancePullToRefreshCallback() {
    currentWeek = DateService.generateAndReturnNextWeek(currentWeek);
    changeDatePickerWeeks('next', currentWeek);
    var newActiveDay = currentWeek[0];
    swipeToStartingDay(newActiveDay);
  }

  $scope.dateClicked = function dateClicked(date) {
    $scope.activeDay = date;
    SwiperService.swipeTo(getDateSlidePath(date));
  };

  $scope.getDateClass = function getDateClass(date) {
    var todayYYYYMMDD = DateService.getTodayYYYYMMDD();
    var status = 'date';

    if (date.yyyymmdd === $scope.activeDay.yyyymmdd) {
      status += '-active';
    }

    if (date.yyyymmdd < todayYYYYMMDD && DateService.isDateBeforeCurrentWeek(date)) {
      status += '-past';
    } else if (date.yyyymmdd === todayYYYYMMDD) {
      status += '-today';
    }
    return status;
  };

  $scope.visibleDateFormat = function visibleDateFormat(date) {
    return (date.yyyymmdd === $scope.activeDay.yyyymmdd) ? date.month.name : date.weekday.substring(0, 1);
  };

  $scope.$watch('activeDay.yyyymmdd', function(newActiveYYYYMMDD) {
    if ($scope.subtask) {
      delete $scope.subtask;
    }
    $scope.subtask = {
      date: newActiveYYYYMMDD
    };
    if (newActiveYYYYMMDD === DateService.getTodayYYYYMMDD()) {
      $rootScope.isTodayActive = true;
    } else {
      $rootScope.isTodayActive = false;
    }
  });

  $scope.setDatepickerVisible = function setDatepickerVisible() {
    $rootScope.isDatepickerVisible = true;
    bindElsewhereThanDatepickerEvents();
  };

  var elsewhereThanDatepickerEventsBound = false;

  function bindElsewhereThanDatepickerEvents() {
    if (!elsewhereThanDatepickerEventsBound) {
      document.addEventListener('click', elseWhereThanDatepickerCallback, true);
      document.addEventListener('touchmove', elseWhereThanDatepickerCallback, true);
      elsewhereThanDatepickerEventsBound = true;
    }
  }

  function gotoToday() {
    if (!DateService.getTodayDate(currentWeek)) {
      currentWeek = DateService.generateAndReturnCurrentWeek(new Date());
      $scope.datepickerWeeks = initializeAndReturnDatepickerWeeks(currentWeek);
    }
    swipeToStartingDay();
  }

  function elseWhereThanDatepickerCallback(event) {
    var element = event.target;
    if (element.id === 'datepicker') {
      return;
    } else if (element.id === 'today-link') {
      event.stopPropagation();
      gotoToday();
    }
    if (element.id !== 'datepicker' || element.id !== 'today-link') {
      while (element.parentNode) {
        element = element.parentNode;
        if (element.id === 'datepicker') {
          return;
        } else if (element.id === 'today-link') {
          event.stopPropagation();
          gotoToday();
        }
      }
    }
    if (event.type === 'click') {
      event.preventDefault();
      event.stopPropagation();
    }
    $scope.$apply(function() {
      $rootScope.isDatepickerVisible = false;
      unbindElsewhereThanDatepickerEvents();
    });
  }

  function unbindElsewhereThanDatepickerEvents() {
    if (elsewhereThanDatepickerEventsBound) {
      document.removeEventListener('click', elseWhereThanDatepickerCallback, true);
      document.removeEventListener('touchmove', elseWhereThanDatepickerCallback, true);
      elsewhereThanDatepickerEventsBound = false;
    }
  }
}

DatesController['$inject'] = ['$q', '$rootScope', '$scope', 'DateService', 'SwiperService'];
angular.module('em.tasks').controller('DatesController', DatesController);
