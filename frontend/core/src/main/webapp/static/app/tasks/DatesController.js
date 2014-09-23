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
  var slidePath = 'focus/tasks';

  $scope.daySlides = [
  {
    info: DateService.getTodayYYYYMMDD(),
    referenceDate: DateService.getTodayYYYYMMDD()
  },
  {
    info: DateService.getTomorrowYYYYMMDD(),
    referenceDate: DateService.getTomorrowYYYYMMDD()
  },
  {
    info: DateService.getYesterdayYYYYMMDD(),
    referenceDate: DateService.getYesterdayYYYYMMDD()
  }
  ];

  $scope.dateClicked = function dateClicked(date) {
    // Get reference date from active slide.
    var activeSlideIndex = SwiperService.getActiveSlideIndex('focus/tasks');
    var newActiveDate = new Date(date);

    // http://stackoverflow.com/a/543152
    var offsetBetweenDays = (newActiveDate - new Date($scope.daySlides[activeSlideIndex].referenceDate)) / (1000*60*60*24);

    // Offset between days determines swipe direction. Set new active date to adjacent slide and swipe to that slide.
    if (offsetBetweenDays < 0) {
      // Get adjacent circular array index.
      var previousIndex = (activeSlideIndex - 1 + $scope.daySlides.length) % $scope.daySlides.length;
      $scope.daySlides[previousIndex].info = $scope.daySlides[previousIndex].referenceDate = DateService.getYYYYMMDD(newActiveDate);
      SwiperService.swipePrevious('focus/tasks');
    }
    else if (offsetBetweenDays > 0) {
      // Get adjacent circular array index.
      var nextIndex = (activeSlideIndex + 1 + $scope.daySlides.length) % $scope.daySlides.length;
      $scope.daySlides[nextIndex].info = $scope.daySlides[nextIndex].referenceDate = DateService.getYYYYMMDD(newActiveDate);
      SwiperService.swipeNext('focus/tasks');
    }
  };

  var currentWeek = DateService.generateAndReturnCurrentWeek(new Date());
  $scope.datepickerWeeks = initializeAndReturnDatepickerWeeks(currentWeek);

  function initializeAndReturnDatepickerWeeks(currentWeek) {
    var datepickerWeeks = [];
    var previousWeek = DateService.generateAndReturnPreviousWeek(currentWeek);
    var nextWeek = DateService.generateAndReturnNextWeek(currentWeek);
    datepickerWeeks.push(currentWeek);
    datepickerWeeks.push(nextWeek);
    datepickerWeeks.push(previousWeek);
    return datepickerWeeks;
  }

  var offsetFromOldActiveSlide = 0;
  var datepickerWeeksInfosCleared = false;

  SwiperService.registerSlideChangeStartCallback(datepickerSlideChangeStartCallback, 'datepicker', 'DatesController');
  function datepickerSlideChangeStartCallback(direction) {
    offsetFromOldActiveSlide += direction === 'prev' ? -1 : 1;

    if (Math.abs(offsetFromOldActiveSlide) >= 2) {
      if (!datepickerWeeksInfosCleared) {
        for (var i = 0, len = $scope.datepickerWeeks.length; i < len; i++) {
          for (var j = 0, jLen = $scope.datepickerWeeks[i].length; j < jLen; j++) {
            // FIXME: use displayDate instead of displayDateShort when display format is decided!
            $scope.datepickerWeeks[i][j].displayDateShort = '...';
            if (!$scope.$$phase) $scope.$digest();
          }
        }
      }
    }
  }

  var offsetFromOldActiveDay = 0;
  var daySlidesInfosCleared = false;

  SwiperService.registerSlideChangeStartCallback(slideChangeStartCallback, 'focus/tasks', 'DatesController');
  function slideChangeStartCallback(direction) {
    // Store offset from old active day because slides can be swiped back and forth
    // before slide change end callback is fired.
    offsetFromOldActiveDay += direction === 'prev' ? -1 : 1;

    // Hide dates before values are updated. Only old active date and its next and previous dates are correct.
    if (Math.abs(offsetFromOldActiveDay) >= 2) {
      if (!daySlidesInfosCleared) {
        for (var i = 0, len = $scope.daySlides.length; i < len; i++) {
          $scope.daySlides[i].referenceDate = $scope.daySlides[i].info;
          $scope.daySlides[i].info = '...';
        }
        if (!$scope.$$phase) $scope.$digest();
        daySlidesInfosCleared = true;
      }
    }
  }

  SwiperService.registerSlideChangeCallback(datepickerSlideChangeCallback, 'datepicker', 'DatesController');
  function datepickerSlideChangeCallback(slidePath, activeSlideIndex) {
    var slidesArrayLength = $scope.datepickerWeeks.length;

    var movedOffset = offsetFromOldActiveSlide % slidesArrayLength;
    var oldActiveSlideIndex = (activeSlideIndex - movedOffset + slidesArrayLength) % slidesArrayLength;

    var previousSlideIndex = (activeSlideIndex - 1 + slidesArrayLength) % slidesArrayLength;
    var nextSlideIndex = (activeSlideIndex + 1 + slidesArrayLength) % slidesArrayLength;

    var referenceWeek = $scope.datepickerWeeks[oldActiveSlideIndex];
    var newActiveWeek = DateService.generateAndReturnWeekWithOffset(offsetFromOldActiveSlide, referenceWeek);

    var newPreviousWeek = DateService.generateAndReturnPreviousWeek(newActiveWeek);
    var newNextWeek = DateService.generateAndReturnNextWeek(newActiveWeek);

    $scope.datepickerWeeks[previousSlideIndex] = newPreviousWeek;
    $scope.datepickerWeeks[activeSlideIndex] = newActiveWeek;
    $scope.datepickerWeeks[nextSlideIndex] = newNextWeek;

    if (!$scope.$$phase) $scope.$digest();
    offsetFromOldActiveSlide = 0;
    datepickerWeeksInfosCleared = false;
  }

  /*
  * Register a slide change callback to swiper service.
  */
  SwiperService.registerSlideChangeCallback(slideChangeCallback, slidePath, 'focus/tasks');
  function slideChangeCallback(slidePath, slideIndex) {
    // Swiper is in loop mode so array that stores slide infos is circular.
    var newActiveDate;

    if (daySlidesInfosCleared) {
      // Moved offset is the remainder from total moves divided by slides array length.
      var movedOffset = offsetFromOldActiveDay % $scope.daySlides.length;
      // Old active day is in old active slide index.
      var oldActiveSlideIndex = (slideIndex - movedOffset + $scope.daySlides.length) % $scope.daySlides.length;

      // Update date in active slide: set new active date with offset from old active date.
      var oldActiveDate = new Date($scope.daySlides[oldActiveSlideIndex].referenceDate);
      newActiveDate = DateService.getDateWithOffset(offsetFromOldActiveDay, oldActiveDate);
      $scope.daySlides[slideIndex].info = $scope.daySlides[slideIndex].referenceDate = DateService.getYYYYMMDD(newActiveDate);

    } else {
      // Date in active slide is up to date.
      newActiveDate = new Date($scope.daySlides[slideIndex].referenceDate);
    }

    // Get adjacent new dates and set them to adjacent circular array indexes.
    var previousIndex = (slideIndex - 1 + $scope.daySlides.length) % $scope.daySlides.length;
    var nextIndex = (slideIndex + 1 + $scope.daySlides.length) % $scope.daySlides.length;

    var newPreviousDate = DateService.getDateWithOffset(-1, newActiveDate);
    var newNextDate = DateService.getDateWithOffset(1, newActiveDate);

    $scope.daySlides[previousIndex].info = $scope.daySlides[previousIndex].referenceDate = DateService.getYYYYMMDD(newPreviousDate);
    $scope.daySlides[nextIndex].info = $scope.daySlides[nextIndex].referenceDate = DateService.getYYYYMMDD(newNextDate);

    // Update UI.
    if (!$scope.$$phase) $scope.$digest();

    // Set variables to initial values.
    offsetFromOldActiveDay = 0;
    daySlidesInfosCleared = false;
  }

  // $scope.activeDay = {};
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
  // swipeToStartingDay(undefined, true);

  $scope.detectDayChangeAndReturnWeekdays = function detectDayChangeAndReturnWeekdays() {
    var activeSlide = SwiperService.getActiveSlidePath($scope.getActiveFeature());
    if (activeSlide === slidePath) {
      if (!currentWeek) {
        currentWeek = DateService.generateAndReturnCurrentWeek(new Date());
        $scope.datepickerWeeks = initializeAndReturnDatepickerWeeks(currentWeek);
      } else {
        if (dayChangeLastCheck < (Date.now() - detectDayChangeBuffer)) {
          if (!DateService.isCurrentWeekValid(currentWeek)) {
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
      transientProperties: {
        date: newActiveYYYYMMDD
      }
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
