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

  var offsetFromOldActiveDay = 0;
  var daySlideInfoCleared = false;

  SwiperService.registerSlideChangeStartCallback(slideChangeStartCallback, slidePath, '/focus/tasks');
  function slideChangeStartCallback(direction) {
    // Store offset from old active day because slides can be swiped back and forth
    // before slide change end callback is fired.
    offsetFromOldActiveDay += direction === 'prev' ? -1 : 1;

    // Hide dates before values are updated. Only old active date and its next and previous dates are correct.
    if (Math.abs(offsetFromOldActiveDay) >= 2) {
      if (!daySlideInfoCleared) {
        for (var i = 0, len = $scope.daySlides.length; i < len; i++) {
          $scope.daySlides[i].referenceDate = $scope.daySlides[i].info;
          $scope.daySlides[i].info = '...';
        }
        if (!$scope.$$phase) $scope.$digest();
        daySlideInfoCleared = true;
      }
    }
  }

  /*
  * Register a slide change callback to swiper service.
  */
  SwiperService.registerSlideChangeCallback(slideChangeCallback, slidePath, 'focus/tasks');
  function slideChangeCallback(slidePath, slideIndex) {
    // Swiper is in loop mode so array that stores slide infos is circular.

    // Moved offset is a remainder from total moves divided by slides array length.
    // Used later to set offset date from reference day.
    var movedOffset = offsetFromOldActiveDay % $scope.daySlides.length;
    var oldActiveSlideIndex = (slideIndex - movedOffset + $scope.daySlides.length) % $scope.daySlides.length;

    // Adjacent circular array indexes.
    var previousIndex = (slideIndex - 1 + $scope.daySlides.length) % $scope.daySlides.length;
    var nextIndex = (slideIndex + 1 + $scope.daySlides.length) % $scope.daySlides.length;

    // Set new active day with offset from old active day.
    var referenceDate = new Date($scope.daySlides[oldActiveSlideIndex].referenceDate);
    var newActiveDay = DateService.getDateWithOffset(offsetFromOldActiveDay, referenceDate);

    // Set adjacent days.
    var newPreviousDay = DateService.getDateWithOffset(-1, newActiveDay);
    var newNextDay = DateService.getDateWithOffset(1, newActiveDay);

    $scope.daySlides[previousIndex].info = $scope.daySlides[previousIndex].referenceDate = DateService.getYYYYMMDD(newPreviousDay);
    $scope.daySlides[slideIndex].info = $scope.daySlides[slideIndex].referenceDate = DateService.getYYYYMMDD(newActiveDay);
    $scope.daySlides[nextIndex].info = $scope.daySlides[nextIndex].referenceDate = DateService.getYYYYMMDD(newNextDay);


    // (index - 1 + array.length) % array.length

    // get old active index
    // if (direction === 'prev') {
      // var offset = direction === 'prev' ? -1 : 1;

    // var previousIndex = (slideIndex + movedOffset + $scope.daySlides.length) % $scope.daySlides.length;
    // var nextIndex = (slideIndex - movedOffset + $scope.daySlides.length) % $scope.daySlides.length;

    // var oldActiveSlideIndex = direction === 'prev' ? previousIndex : nextIndex;

    // console.log('moved offset: ' + movedOffset);
    // console.log(offsetFromOldActiveDay);

    // console.log('old active index: ' + (slideIndex + movedOffset + $scope.daySlides.length) % $scope.daySlides.length);

    // // TODO rename!

    // if (offsetFromOldActiveDay >= 2) {


    //   var referenceDate = new Date($scope.daySlides[oldActiveSlideIndex].referenceDate);
    //   var offsetDays = direction === 'prev' ? -offsetFromOldActiveDay : offsetFromOldActiveDay;
    //   var offsetDay = DateService.getDateWithOffset(referenceDate, offsetDays);

    //   $scope.daySlides[slideIndex].info = $scope.daySlides[slideIndex].referenceDate = DateService.getYYYYMMDD(offsetDay);

    //   var previousSlide, nextSlide;
    //   if (slideIndex === 0) {
    //     previousSlide = $scope.daySlides[$scope.daySlides.length - 1];
    //     nextSlide = $scope.daySlides[slideIndex + 1];
    //   }
    //   else if (slideIndex === $scope.daySlides.length - 1) {
    //     nextSlide = $scope.daySlides[0];
    //     previousSlide = $scope.daySlides[slideIndex - 1];
    //   }
    //   else {
    //     previousSlide = $scope.daySlides[slideIndex - 1];
    //     nextSlide = $scope.daySlides[slideIndex + 1];
    //   }

    //   var previousDay = DateService.getDateWithOffset(offsetDay, -1);
    //   var nextDay = DateService.getDateWithOffset(offsetDay, 1);

    //   previousSlide.info = previousSlide.referenceDate = DateService.getYYYYMMDD(previousDay);
    //   nextSlide.info = nextSlide.referenceDate = DateService.getYYYYMMDD(nextDay);
    // }

    // else {
    //   var d = new Date($scope.daySlides[slideIndex].referenceDate);


    //   if (direction === 'prev') {

    //     var offsetDate = DateService.setOffsetDate(-offsetFromOldActiveDay, d).getYYYYMMDD(d);
    //     // update previous slide


    //     if (slideIndex === 0) {
    //       $scope.daySlides[$scope.daySlides.length - 1].info = offsetDate;

    //     } else {
    //       $scope.daySlides[slideIndex - 1].info = offsetDate;
    //     }

    //   } else if (direction === 'next') {

    //     var offsetDate = DateService.setOffsetDate(offsetFromOldActiveDay, d).getYYYYMMDD(d);

    //     // update next slide
    //     if (slideIndex === $scope.daySlides.length - 1) {
    //       $scope.daySlides[0].info = offsetDate;
    //     } else {
    //       $scope.daySlides[slideIndex + 1].info = offsetDate;
    //     }
    //   }
    // }

    if (!$scope.$$phase) $scope.$digest();

    offsetFromOldActiveDay = 0;
    daySlideInfoCleared = false;
  }

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
