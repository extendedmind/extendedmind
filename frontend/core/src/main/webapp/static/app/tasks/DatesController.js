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
  $scope.activeDay = {};
  $scope.weekdays = DateService.activeWeek();
  $scope.datepickerWeeks = DateService.getDatepickerWeeks();
  $rootScope.isDatepickerVisible = false;

  DateService.registerDayChangedCallback(dayChangeCallback);
  function dayChangeCallback(weekChanged) {
    if (weekChanged) {
      $scope.weekdays = DateService.activeWeek();
      $scope.datepickerWeeks = DateService.getDatepickerWeeks();
    }
    swipeToStartingDay();
  }
  $scope.$on('$destroy', function() {
    DateService.removeDayChangedCallback();
  });

  function getDateSlidePath(activeDay) {
    return 'tasks/home/' + activeDay.weekday;
  }

  // This function is intended to be called from datepicker directive.
  $scope.changeActiveWeek = function changeActiveWeek(direction, cb) {
    var weekdayIndex = $scope.activeDay.weekdayIndex;
    $scope.datepickerWeeks = DateService.changeDatePickerWeeks(direction);
    cb().then($scope.$digest()).then(function() {
      if (direction === 'prev') {
        $scope.weekdays = DateService.generateAndReturnPreviousWeek();
      } else if (direction === 'next') {
        $scope.weekdays = DateService.generateAndReturnNextWeek();
      }
      var newActiveDay = $scope.weekdays[weekdayIndex];
      swipeToStartingDay(newActiveDay);
    });
  };

  // Pull to refresh previous/next week callbacks
  SwiperService.registerNegativeResistancePullToRefreshCallback(
    negativeResistancePullToRefreshCallback,
    'tasks/home',
    DatesController);
  SwiperService.registerPositiveResistancePullToRefreshCallback(
    positiveResistancePullToRefreshCallback,
    'tasks/home',
    DatesController);

  function negativeResistancePullToRefreshCallback() {
    $scope.weekdays = DateService.generateAndReturnPreviousWeek();
    $scope.datepickerWeeks = DateService.changeDatePickerWeeks('prev');
    var newActiveDay = $scope.weekdays[6];
    swipeToStartingDay(newActiveDay);
  }
  function positiveResistancePullToRefreshCallback() {
    $scope.weekdays = DateService.generateAndReturnNextWeek();
    $scope.datepickerWeeks = DateService.changeDatePickerWeeks('next');
    var newActiveDay = $scope.weekdays[0];
    swipeToStartingDay(newActiveDay);
  }

  // Register a slide change callback to swiper service
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'tasks/home', 'DatesController');
  function slideChangeCallback(activeSlidePath) {
    if (!activeSlidePath.endsWith($scope.activeDay.weekday)) {
      for (var i = 0, len = $scope.weekdays.length; i < len; i++) {
        if (activeSlidePath.endsWith($scope.weekdays[i].weekday)) {
          $scope.activeDay = $scope.weekdays[i];
          // Run digest to change only date picker when swiping to new location
          if (!$scope.$$phase) $scope.$digest();
          return;
        }
      }
    }
  }

  // Invoke function during compile and $scope.$apply();
  // Set initial swiper slide path to staring day or swipe to active day.
  function swipeToStartingDay(startingDay, init) {
    $scope.activeDay = startingDay || DateService.getTodayDate() || DateService.getMondayDate();
    $q.when(
      SwiperService.setInitialSlidePath(
        'tasks/home',
        getDateSlidePath($scope.activeDay)))
    .then(function() {
      if (!init) {
        // Need additional swiping if setting initial slide path fails to work
        SwiperService.swipeTo(getDateSlidePath($scope.activeDay));
      }
    });
  }
  swipeToStartingDay(DateService.getInitialDate(), true);

  $scope.previousWeek = function previousWeek() {
    var weekdayIndex = $scope.activeDay.weekdayIndex;
    $scope.weekdays = DateService.generateAndReturnPreviousWeek();
    $scope.datepickerWeeks = DateService.changeDatePickerWeeks('prev');
    var newActiveDay = $scope.weekdays[weekdayIndex];
    swipeToStartingDay(newActiveDay);
  };

  $scope.nextWeek = function nextWeek() {
    var weekdayIndex = $scope.activeDay.weekdayIndex;
    $scope.weekdays = DateService.generateAndReturnNextWeek();
    $scope.datepickerWeeks = DateService.changeDatePickerWeeks('next');
    var newActiveDay = $scope.weekdays[weekdayIndex];
    swipeToStartingDay(newActiveDay);
  };

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
    return (date.yyyymmdd === $scope.activeDay.yyyymmdd) ? date.monthName : date.weekday.substring(0,1);
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
    if (!DateService.getTodayDate()) {
      $scope.weekdays = DateService.generateAndSetCurrentWeekActive();
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
angular.module('em.app').controller('DatesController', DatesController);
