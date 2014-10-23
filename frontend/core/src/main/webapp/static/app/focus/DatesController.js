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

 function DatesController($filter, $rootScope, $scope, DateService, SwiperService, UISessionService) {
  var slidePath = 'focus/tasks';

  // DAY SLIDES CONSTRUCTOR

  /*
  * Initial day slides state.
  *
  * Reference to 'no date' slide with null.
  */
  $scope.daySlides = [
  {
    info: DateService.getTodayYYYYMMDD(),
    referenceDate: DateService.getTodayYYYYMMDD(),
    heading: daySlideHeading(DateService.getTodayYYYYMMDD())
  },
  {
    info: DateService.getTomorrowYYYYMMDD(),
    referenceDate: DateService.getTomorrowYYYYMMDD(),
    heading: daySlideHeading(DateService.getTomorrowYYYYMMDD())
  },
  {
    // 'no date' slide
    info: null,
    referenceDate: null,
    heading: daySlideHeading(null)
  }
  ];


  // DATEPICKER SLIDES CONSTRUCTOR

  /*
  * Datepicker weeks.
  *
  * Starting from the week which has the starting date.
  * Start from current week if there is no starting date.
  */
  function initializeDatepickerWeeks(startingDateYYYYMMDD) {
    var startingDate;
    if (!startingDateYYYYMMDD)
      startingDate = new Date();
    else
      startingDate = new Date(startingDateYYYYMMDD);

    var currentWeek = DateService.generateAndReturnCurrentWeek(startingDate);
    $scope.datepickerWeeks = [];
    var previousWeek = DateService.generateAndReturnPreviousWeek(currentWeek);
    var nextWeek = DateService.generateAndReturnNextWeek(currentWeek);
    $scope.datepickerWeeks.push(currentWeek);
    $scope.datepickerWeeks.push(nextWeek);
    $scope.datepickerWeeks.push(previousWeek);
    SwiperService.registerSlideChangeStartCallback(datepickerSlideChangeStart, 'datepicker',
                                                   'DatesController');
    SwiperService.registerSlideChangeCallback(datepickerSlideChangeEnd, 'datepicker', 'DatesController');
    SwiperService.registerSlideResetCallback(datepickerSlideReset, 'datepicker', 'DatesController');
  }

  /*
  * Restore datepicker state variables to default values.
  */
  function resetDatepickerState() {
    offsetFromOldActiveDatepickerSlide = 0;
    datepickerWeeksInfosCleared = false;
    previousActiveIndex = undefined;
    preventDaySlideClicking = false;
    preventDaySlideChange = false;
    datepickerSlideChangeReseted = false;
  }

  // DAY SLIDES

  var offsetFromOldActiveDaySlide = 0;
  var daySlidesInfosCleared = false;

  SwiperService.registerSlideChangeStartCallback(daySlideChangeStart, 'focus/tasks', 'DatesController');
  function daySlideChangeStart(activeIndex, direction) {

    // issue a 500ms lock to prevent leave animation for this digest cycle
    // see listItemDirective => animation
    UISessionService.lock('leaveAnimation', 500);

    // Store offset from old active day because slides can be swiped back and forth
    // before slide change end callback is fired.
    offsetFromOldActiveDaySlide += direction === 'prev' ? -1 : 1;

    // Infos will be cleared when absolute value of offset from old active day slide is >= 2.
    // We are in slide change start callback and it is potentially fired many times, so check that infos are
    // cleared before comparing the absolute value.
    if (!daySlidesInfosCleared && (offsetFromOldActiveDaySlide >= 2 || offsetFromOldActiveDaySlide <= -2)) {
      daySlidesInfosCleared = true;
      clearDaySlidesInfos();
      if (!$scope.$$phase && !$rootScope.$$phase) $scope.$digest();
    }
  }

  /*
  * Register a slide change callback to swiper service.
  */
  SwiperService.registerSlideChangeCallback(daySlideChangeEnd, slidePath, 'focus/tasks');
  function daySlideChangeEnd(slidePath, newActiveIndex) {
    // Swiper is in loop mode so array that stores slide infos is circular.
    var activeDaySlideInfo;

    if (daySlidesInfosCleared) {
      // Moved offset is the remainder from total moves divided by slides array length.
      var movedOffset = offsetFromOldActiveDaySlide % $scope.daySlides.length;
      var oldActiveIndex = (newActiveIndex - movedOffset + $scope.daySlides.length) % $scope.daySlides.length;

      activeDaySlideInfo = refreshActiveDaySlideAndReturnInfo(oldActiveIndex, newActiveIndex,
                                                              offsetFromOldActiveDaySlide);

    } else {
      // Active slide is up to date. Get info.
      activeDaySlideInfo = getActiveDaySlideInfo(newActiveIndex);
    }

    var previousIndex = (newActiveIndex - 1 + $scope.daySlides.length) % $scope.daySlides.length;
    var nextIndex = (newActiveIndex + 1 + $scope.daySlides.length) % $scope.daySlides.length;
    refreshAdjacentDaySlides(previousIndex, nextIndex, activeDaySlideInfo);

    // Update UI.
    if (!$scope.$$phase && !$rootScope.$$phase) $scope.$digest();

    // Set variables to initial values.
    offsetFromOldActiveDaySlide = 0;
    daySlidesInfosCleared = false;
  }

  /*
  * Hide dates before values are updated. Only old active date and its next and previous dates are correct.
  */
  function clearDaySlidesInfos() {
    for (var i = 0, len = $scope.daySlides.length; i < len; i++) {
      $scope.daySlides[i].heading = '\u2026';
      $scope.daySlides[i].referenceDate = $scope.daySlides[i].info;
      $scope.daySlides[i].info = undefined;
    }
  }

  /*
  * Update date in active slide: set new active date with offset from old active date.
  *
  * Yesterday, 'no date' and today are special cases.
  */
  function refreshActiveDaySlideAndReturnInfo(oldActiveIndex, newActiveIndex, offset) {
    var newActiveDate;

    var referenceDate = $scope.daySlides[oldActiveIndex].referenceDate;
    if (referenceDate) {
      referenceDate = new Date(referenceDate);
      var today = new Date().setHours(0, 0, 0, 0);
      var newActiveDateCandidate = DateService.getDateWithOffset(offset, referenceDate);

      if (referenceDate.setHours(0, 0, 0, 0) < today) { // Past
        if (newActiveDateCandidate.setHours(0, 0, 0, 0) > today) {
          // From past to future, so hopped over 'no date' slide. Go back one day.
          newActiveDateCandidate = DateService.getDateWithOffset(-1, newActiveDateCandidate);
          makeDaySlide(newActiveIndex, newActiveDateCandidate);
          return newActiveDateCandidate;

        } else if (newActiveDateCandidate.setHours(0, 0, 0, 0) === today) {
          // Active slide is a 'no date' slide when new active date candidate is today.
          makeDaySlide(newActiveIndex, null);
          return;
        }

      } else { // Present or future
        var yesterday = DateService.getYesterdayDate().setHours(0, 0, 0, 0);
        if (newActiveDateCandidate.setHours(0, 0, 0, 0) < yesterday) {
          // From future to past, so hopped over 'no date' slide. Go forward one day.
          newActiveDateCandidate = DateService.getDateWithOffset(1, newActiveDateCandidate);
          makeDaySlide(newActiveIndex, newActiveDateCandidate);
          return newActiveDateCandidate;

        } else if (newActiveDateCandidate.setHours(0, 0, 0, 0) === yesterday) {
          // Active slide is a 'no date' slide when new active date candidate is today.
          makeDaySlide(newActiveIndex, null);
          return;
        }
      }
    } else if (referenceDate === null) {
      // 'no date' slide. Today is the reference when going past, yesterday when future.
      if (offset > 0) { // Going to the future.
        // Subtract offset and then use today as a reference. Result is the same as using original offset and
        // yesterday, but this is easier.
        offset--;
      }
      var slideDate = DateService.getDateWithOffset(offset, new Date());
      makeDaySlide(newActiveIndex, slideDate);
      return slideDate;
    }

    // Old active day is in old active slide index.
    var oldActiveDate = new Date($scope.daySlides[oldActiveIndex].referenceDate);
    newActiveDate = DateService.getDateWithOffset(offset, oldActiveDate);
    makeDaySlide(newActiveIndex, newActiveDate);

    return newActiveDate;
  }

  function makeDaySlide(slideIndex, slideDate) {
    var daySlide = $scope.daySlides[slideIndex];

    if (slideDate) {
      daySlide.referenceDate = daySlide.info = DateService.getYYYYMMDD(slideDate);
      if (slideDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0))
        daySlide.pastDate = daySlide.referenceDate;

      else
        daySlide.pastDate = undefined;

    } else if (slideDate === null) {
      // 'no date' slide.
      daySlide.referenceDate = daySlide.info = daySlide.pastDate = null;
    }
    // Set heading for active day slide.
    daySlide.heading = daySlideHeading(daySlide.referenceDate);
  }

  /*
  * Day slide has either some date or 'no date' which is before today slide and after yesterday.
  */
  function getActiveDaySlideInfo(slideIndex) {
    var referenceDate = $scope.daySlides[slideIndex].referenceDate;
    if (referenceDate) return new Date($scope.daySlides[slideIndex].referenceDate);
    else if (referenceDate === null) {
      // Slide's reference date is null so it is a 'no date' slide.
      return null;
    }
  }

  /*
  * Get new adjacent dates and set them to adjacent circular array indexes.
  */
  function refreshAdjacentDaySlides(previousIndex, nextIndex, activeDate) {
    var previousDate, nextDate;
    // Detect type of active day slide.
    if (activeDate) {
      // Clear the time from date for comparison between dates. See http://stackoverflow.com/a/6202196
      activeDate.setHours(0, 0, 0, 0);

      if (activeDate.getTime() === new Date().setHours(0, 0, 0, 0)) {
        // Today slide. Previous slide is 'no date' slide.
        nextDate = DateService.getTomorrowDate();
        previousDate = null;
      } else if (activeDate.getTime() === DateService.getYesterdayDate().setHours(0, 0, 0, 0)) {
        // Yesterday slide. Next slide is 'no date' slide.
        previousDate = DateService.getDateWithOffset(-1, activeDate);
        nextDate = null;
      } else {
        // Standard date slide. Get previous and next date.
        previousDate = DateService.getDateWithOffset(-1, activeDate);
        nextDate = DateService.getDateWithOffset(1, activeDate);
      }
    } else if (activeDate === null) {
      // 'No date' slide. Previous date is yesterday and next date is today.
      previousDate = DateService.getYesterdayDate();
      nextDate = new Date();
    }

    // NOTE:  We could check equality between adjacent reference date and new adjacent date without
    //        overwriting them if it has performance gains.
    makeDaySlide(previousIndex, previousDate);
    makeDaySlide(nextIndex, nextDate);
  }


  // DATEPICKER SLIDES

  var offsetFromOldActiveDatepickerSlide = 0;
  var datepickerWeeksInfosCleared = false;
  var previousActiveIndex;
  var preventDaySlideClicking;
  var datepickerSlideChangeReseted;
  var preventDaySlideChange;

  function datepickerSlideChangeStart(activeIndex, direction) {
    preventDaySlideClicking = true;  // prevent clicks when swipe started
    // Make sure last swipe did change slide.
    if (previousActiveIndex === activeIndex) return;

    // Increment offset from active datepicker slide.
    previousActiveIndex = activeIndex;
    offsetFromOldActiveDatepickerSlide += direction === 'prev' ? -1 : 1;

    if (!datepickerWeeksInfosCleared && (
        offsetFromOldActiveDatepickerSlide >= 2 || offsetFromOldActiveDatepickerSlide <= -2))
    {
      datepickerWeeksInfosCleared = true;
      clearDatepickerSlidesInfos();
      if (!$scope.$$phase && !$rootScope.$$phase) $scope.$digest();
    }
  }

  function datepickerSlideReset(activeIndex, previousIndex) {
    datepickerSlideChangeReseted = (activeIndex !== previousIndex);
  }

  function datepickerSlideChangeEnd(slidePath, newActiveIndex) {
    preventDaySlideClicking = false;  // allow clicks when swipe ended
    if (datepickerSlideChangeReseted) {
      datepickerSlideChangeReseted = false;
      offsetFromOldActiveDatepickerSlide = 0;
      previousActiveIndex = undefined;
      preventDaySlideChange = false;
      return;
    }

    var activeDatepickerSlideInfo, slidesArrayLength = $scope.datepickerWeeks.length;

    if (datepickerWeeksInfosCleared) {
      // Refresh datepicker slides and return active slide info.
      // Moved offset is the remainder from total moves divided by slides array length.
      var movedOffset = offsetFromOldActiveDatepickerSlide % slidesArrayLength;
      var oldActiveIndex = (newActiveIndex - movedOffset + slidesArrayLength) % slidesArrayLength;
      activeDatepickerSlideInfo =
      refreshActiveDatepickerSlideAndReturnInfo(oldActiveIndex, newActiveIndex,
                                                offsetFromOldActiveDatepickerSlide);
    } else {
      // Active slide is up to date. Get info.
      activeDatepickerSlideInfo = getActiveDatepickerSlideInfo(newActiveIndex);
    }

    var previousSlideIndex = (newActiveIndex - 1 + slidesArrayLength) % slidesArrayLength;
    var nextSlideIndex = (newActiveIndex + 1 + slidesArrayLength) % slidesArrayLength;

    refreshAdjacentDatepickerSlides(previousSlideIndex, nextSlideIndex, activeDatepickerSlideInfo);

    if (!preventDaySlideChange) {
      var activeDaySlideInfo = newActiveDaySlideInfo(offsetFromOldActiveDatepickerSlide);
      $scope.changeDaySlide(activeDaySlideInfo);
    }

    if (!$scope.$$phase && !$rootScope.$$phase) $scope.$digest();
    offsetFromOldActiveDatepickerSlide = 0;
    datepickerWeeksInfosCleared = false;
    previousActiveIndex = undefined;
    preventDaySlideChange = false;
  }

  function clearDatepickerSlidesInfos() {
    setDayActive(undefined);  // Clear active day.
    for (var i = 0, len = $scope.datepickerWeeks.length; i < len; i++) {
      for (var j = 0, jLen = $scope.datepickerWeeks[i].length; j < jLen; j++) {
        // FIXME: use displayDate instead of displayDateShort when display format is decided!
        $scope.datepickerWeeks[i][j].displayDateShort = '\u2026';
      }
    }
  }

  function refreshActiveDatepickerSlideAndReturnInfo(oldActiveIndex, newActiveIndex, offset) {
    var referenceWeek = $scope.datepickerWeeks[oldActiveIndex];
    var newActiveWeek = DateService.generateAndReturnWeekWithOffset(offset, referenceWeek);
    $scope.datepickerWeeks[newActiveIndex] = newActiveWeek;
    return newActiveWeek;
  }

  function getActiveDatepickerSlideInfo(activeIndex) {
    return $scope.datepickerWeeks[activeIndex];
  }

  function refreshAdjacentDatepickerSlides(previousIndex, nextIndex, activeWeek) {
    var previousWeek = DateService.generateAndReturnPreviousWeek(activeWeek);
    var nextWeek = DateService.generateAndReturnNextWeek(activeWeek);

    $scope.datepickerWeeks[previousIndex] = previousWeek;
    $scope.datepickerWeeks[nextIndex] = nextWeek;
  }

  function newActiveDaySlideInfo(weeksOffset) {
    var oldActiveDaySlideIndex = SwiperService.getActiveSlideIndex('focus/tasks');
    // http://stackoverflow.com/a/543152
    // Pass today if we are in 'no date' slide.
    var oldActiveDate = new Date($scope.daySlides[oldActiveDaySlideIndex].referenceDate || new Date());
    var daysOffset = weeksOffset * 7;
    return DateService.setOffsetDate(daysOffset, oldActiveDate).getYYYYMMDD(oldActiveDate);
  }


  // UI

  $scope.getNewDayTask = function(daySlidesIndex){
    return {
      transientProperties: {
        date: $scope.daySlides[daySlidesIndex].info,
        completed: false,
        itemType: 'task'
      }
    };
  };

  /*
  * Construct a heading for day slide.
  *
  * Date can be shown like:
  *   - no date
  *   - today
  *   - fri 10 oct
  */
  function daySlideHeading(day) {
    if (day === null) return 'no date';

    if (day === DateService.getTodayYYYYMMDD()) return 'today';
    else
      return $filter('date')(day, 'EEE d MMM').toLowerCase(); // e.g. fri 10 oct
  }

  var activeDateYYYYMMDD;
  $scope.isDayActive = function(dateYYYYMMDD) {
    return activeDateYYYYMMDD === dateYYYYMMDD;
  };

  function getActiveDay() {
    return activeDateYYYYMMDD;
  }

  function setDayActive(dateYYYYMMDD) {
    if (dateYYYYMMDD === null) {
      // 'no date'. Set today active.
      dateYYYYMMDD = DateService.getTodayYYYYMMDD();
    }
    activeDateYYYYMMDD = dateYYYYMMDD;
  }

  function datepickerHeading() {
    var activeDateYYYYMMDD = getActiveDay();
    return $filter('date')(activeDateYYYYMMDD, 'MMMM yyyy').toLowerCase();
  }

  $scope.closeDatepicker = function() {
    $scope.datepickerVisible = false;
    resetDatepickerState();
    $scope.datepickerWeeks = undefined;
    $scope.resetToDefaultToolbar();
  };

  $scope.openDatepicker = function(startingDateYYYYMMDD) {
    initializeDatepickerWeeks(startingDateYYYYMMDD);
    setDayActive(startingDateYYYYMMDD);
    $scope.datepickerVisible = true;

    $scope.swapToCustomToolbar({
      leftActionName: 'today',
      leftActionFn: gotoToday,
      getMiddleActionName: datepickerHeading,
      rightActionName: 'no date',
      rightActionFn: gotoNoDate
    });
  };

  function gotoToday() {
    $scope.changeDaySlide(DateService.getTodayYYYYMMDD(), true);
  }
  function gotoNoDate() {
    $scope.changeDaySlide(null, true);
  }

  /*
  * Set info for new day slide.
  *
  * NOTE: Offset between days is set to -1 or 1 when moving from/to 'no date' slide because offset is only
  *       used to determine swipe direction. Change implementation to one found here:
  *       http://stackoverflow.com/a/543152 if needed for something.
  */
  $scope.changeDaySlide = function(newDateYYYYMMDD, calculateWeekOffset) {
    if (preventDaySlideClicking) return;
    setDayActive(newDateYYYYMMDD);

    // Get reference date from active slide.
    var activeSlideIndex = SwiperService.getActiveSlideIndex('focus/tasks');
    var oldDateYYYYMMDD = $scope.daySlides[activeSlideIndex].referenceDate;

    var oldActiveDate, newActiveDate, offsetBetweenDays;

    if (oldDateYYYYMMDD === null && newDateYYYYMMDD === null) {
      // Came from 'no date'. Going to 'no date'. Do nothing.
      return;
    } else if (oldDateYYYYMMDD === null) {
      // Came from 'no date'. Reference today as an old active date and compare it with new active date.
      newActiveDate = new Date(newDateYYYYMMDD);
      offsetBetweenDays = (newActiveDate.setHours(0, 0, 0, 0) -
                           new Date().setHours(0, 0, 0, 0)) / (1000*60*60*24);
      if (offsetBetweenDays === 0) {
        // Going to today
        offsetBetweenDays++;
      }
    } else if (newDateYYYYMMDD === null) {
      // Going to 'no date'. Reference today as a new active date and compare it with old active date.
      oldActiveDate = new Date(oldDateYYYYMMDD);
      offsetBetweenDays = (new Date().setHours(0, 0, 0, 0) -
                           oldActiveDate.setHours(0, 0, 0, 0)) / (1000*60*60*24);
      newActiveDate = null; // 'no date'

      if (offsetBetweenDays === 0) {
        // Came from today.
        offsetBetweenDays--;
      }
    } else {
      // Default.
      newActiveDate = new Date(newDateYYYYMMDD);
      oldActiveDate = new Date($scope.daySlides[activeSlideIndex].referenceDate);
      // http://stackoverflow.com/a/543152
      offsetBetweenDays = (newActiveDate - oldActiveDate) / (1000*60*60*24);
    }

    var oldWeekNumber, newWeekNumber, offsetBetweenWeeks, activeDatepickerSlideIndex, currentWeek;

    // Offset between days determines swipe direction.
    // Set new active date to adjacent slide and swipe to that slide.
    // Slide did not change when offset between days is zero.
    if (offsetBetweenDays < 0) {
      // Get adjacent circular array index.
      var previousIndex = (activeSlideIndex - 1 + $scope.daySlides.length) % $scope.daySlides.length;
      makeDaySlide(previousIndex, newActiveDate);
      SwiperService.swipePrevious('focus/tasks');

      if (calculateWeekOffset) {
        oldWeekNumber = DateService.getWeekNumber(oldActiveDate || new Date());
        newWeekNumber = DateService.getWeekNumber(newActiveDate || new Date());
        offsetBetweenWeeks = newWeekNumber - oldWeekNumber;

        if (offsetBetweenWeeks < 0) {
         activeDatepickerSlideIndex = SwiperService.getActiveSlideIndex('datepicker');
         var previousDatepickerSlideIndex = (activeDatepickerSlideIndex - 1 +
                                             $scope.datepickerWeeks.length) % $scope.datepickerWeeks.length;

         currentWeek = DateService.generateAndReturnCurrentWeek(newActiveDate || new Date());
         $scope.datepickerWeeks[previousDatepickerSlideIndex] = currentWeek;
         preventDaySlideChange = true;
         SwiperService.swipePrevious('datepicker');
       }
     }
   }
   else if (offsetBetweenDays > 0) {
      // Get adjacent circular array index.
      var nextIndex = (activeSlideIndex + 1 + $scope.daySlides.length) % $scope.daySlides.length;
      makeDaySlide(nextIndex, newActiveDate);
      SwiperService.swipeNext('focus/tasks');

      if (calculateWeekOffset) {
        oldWeekNumber = DateService.getWeekNumber(oldActiveDate || new Date());
        newWeekNumber = DateService.getWeekNumber(newActiveDate || new Date());
        offsetBetweenWeeks = newWeekNumber - oldWeekNumber;

        if (offsetBetweenWeeks > 0) {
          activeDatepickerSlideIndex = SwiperService.getActiveSlideIndex('datepicker');
          var nextDatepickerSlideIndex = (activeDatepickerSlideIndex + 1 +
                                          $scope.datepickerWeeks.length) % $scope.datepickerWeeks.length;

          currentWeek = DateService.generateAndReturnCurrentWeek(newActiveDate || new Date());
          $scope.datepickerWeeks[nextDatepickerSlideIndex] = currentWeek;
          preventDaySlideChange = true;
          SwiperService.swipeNext('datepicker');
        }
      }
    }
  };
}

DatesController['$inject'] = ['$filter', '$rootScope', '$scope', 'DateService', 'SwiperService',
'UISessionService'];
angular.module('em.focus').controller('DatesController', DatesController);
