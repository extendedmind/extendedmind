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

 function DatesController($scope, DateService, SwiperService, UISessionService) {
  var slidePath = 'focus/tasks';

  // DAY SLIDES CONSTRUCTOR

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
    info: undefined,
    referenceDate: undefined,
    heading: daySlideHeading()
  }
  ];


  // DATEPICKER SLIDES CONSTRUCTOR

  /*
  * Datepicker weeks.
  *
  * Starting from the week which has date from active day slide.
  * Start from current week if there is no active day slide.
  */
  function initializeDatepickerWeeks() {
    var activeDaySlideIndex = SwiperService.getActiveSlideIndex('focus/tasks');
    var activeDate;
    if (activeDaySlideIndex !== undefined)
      activeDate = new Date($scope.daySlides[activeDaySlideIndex].referenceDate);
    else
      activeDate = new Date();

    var currentWeek = DateService.generateAndReturnCurrentWeek(activeDate);
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
    preventDaySlideChange = false;
    datepickerSlideChangeReseted = false;
  }

  // DAY SLIDES

  var offsetFromOldActiveDaySlide = 0;
  var daySlidesInfosCleared = false;

  SwiperService.registerSlideChangeStartCallback(daySlideChangeStart, 'focus/tasks', 'DatesController');
  function daySlideChangeStart(slideIndex, direction) {

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
      clearDaySlidesInfos();
      if (!$scope.$$phase) $scope.$digest();
      daySlidesInfosCleared = true;
    }
  }

  /*
  * Register a slide change callback to swiper service.
  */
  SwiperService.registerSlideChangeCallback(daySlideChangeEnd, slidePath, 'focus/tasks');
  function daySlideChangeEnd(slidePath, slideIndex) {
    // Swiper is in loop mode so array that stores slide infos is circular.
    var activeDaySlideInfo;

    if (daySlidesInfosCleared) {
      // Moved offset is the remainder from total moves divided by slides array length.
      var movedOffset = offsetFromOldActiveDaySlide % $scope.daySlides.length;
      var oldActiveSlideIndex = (slideIndex - movedOffset +
                                 $scope.daySlides.length) % $scope.daySlides.length;

      activeDaySlideInfo = refreshActiveDaySlideAndReturnInfo(oldActiveSlideIndex, slideIndex,
                                                              offsetFromOldActiveDaySlide);

    } else {
      // Active slide is up to date. Get info.
      activeDaySlideInfo = getActiveDaySlideInfo(slideIndex);
    }

    var previousIndex = (slideIndex - 1 + $scope.daySlides.length) % $scope.daySlides.length;
    var nextIndex = (slideIndex + 1 + $scope.daySlides.length) % $scope.daySlides.length;
    refreshAdjacentDaySlides(previousIndex, nextIndex, activeDaySlideInfo);

    // Update UI.
    if (!$scope.$$phase) $scope.$digest();

    // Set variables to initial values.
    offsetFromOldActiveDaySlide = 0;
    daySlidesInfosCleared = false;
  }

  /*
  * Hide dates before values are updated. Only old active date and its next and previous dates are correct.
  */
  function clearDaySlidesInfos() {
    for (var i = 0, len = $scope.daySlides.length; i < len; i++) {
      $scope.daySlides[i].heading = '&#8230;';
      $scope.daySlides[i].referenceDate = $scope.daySlides[i].info;
      $scope.daySlides[i].info = undefined;
    }
  }

  /*
  * Update date in active slide: set new active date with offset from old active date.
  *
  * Yesterday, 'no date' and today are special cases.
  */
  function refreshActiveDaySlideAndReturnInfo(oldActiveSlideIndex, newActiveSlideIndex, offset) {
    var newActiveDate;

    var referenceDate = $scope.daySlides[oldActiveSlideIndex].referenceDate;
    if (referenceDate) {
      referenceDate = new Date(referenceDate);
      var today = new Date().setHours(0, 0, 0, 0);
      var newActiveDateCandidate = DateService.getDateWithOffset(offset, referenceDate);

      if (referenceDate.setHours(0, 0, 0, 0) < today) { // Past
        if (newActiveDateCandidate.setHours(0, 0, 0, 0) > today) {
          // From past to future, so hopped over 'no date' slide. Go back one day.
          newActiveDateCandidate = DateService.getDateWithOffset(-1, newActiveDateCandidate);
          makeDaySlide(newActiveSlideIndex, newActiveDateCandidate);
          return newActiveDateCandidate;

        } else if (newActiveDateCandidate.setHours(0, 0, 0, 0) === today) {
          // Active slide is a 'no date' slide when new active date candidate is today.
          makeDaySlide(newActiveSlideIndex);
          return;
        }

      } else { // Present or future
        var yesterday = DateService.getYesterdayDate().setHours(0, 0, 0, 0);
        if (newActiveDateCandidate.setHours(0, 0, 0, 0) < yesterday) {
          // From future to past, so hopped over 'no date' slide. Go forward one day.
          newActiveDateCandidate = DateService.getDateWithOffset(1, newActiveDateCandidate);
          makeDaySlide(newActiveSlideIndex, newActiveDateCandidate);
          return newActiveDateCandidate;

        } else if (newActiveDateCandidate.setHours(0, 0, 0, 0) === yesterday) {
          // Active slide is a 'no date' slide when new active date candidate is today.
          makeDaySlide(newActiveSlideIndex);
          return;
        }
      }
    } else {
      // No date slide. Today is the reference when going past, yesterday when future.
      if (offset > 0) { // Going to the future.
        // Subtract offset and then use today as a reference. Result is the same as using original offset and
        // yesterday, but this is easier.
        offset--;
      }
      var slideDate = DateService.getDateWithOffset(offset, new Date());
      makeDaySlide(newActiveSlideIndex, slideDate);
      return slideDate;
    }

    // Old active day is in old active slide index.
    var oldActiveDate = new Date($scope.daySlides[oldActiveSlideIndex].referenceDate);

    newActiveDate = DateService.getDateWithOffset(offset, oldActiveDate);
    $scope.daySlides[newActiveSlideIndex].referenceDate = DateService.getYYYYMMDD(newActiveDate);
    $scope.daySlides[newActiveSlideIndex].info = $scope.daySlides[newActiveSlideIndex].referenceDate;

    // Set heading for active day slide.
    $scope.daySlides[newActiveSlideIndex].heading = daySlideHeading($scope.daySlides[newActiveSlideIndex]
                                                                    .referenceDate);

    return newActiveDate;
  }

  function makeDaySlide(slideIndex, slideDate) {
    var daySlide = $scope.daySlides[slideIndex];
    if (!slideDate) {
      daySlide.referenceDate = daySlide.info = undefined;
    } else {
      daySlide.referenceDate = daySlide.info = DateService.getYYYYMMDD(slideDate);
    }
    daySlide.heading = daySlideHeading(daySlide.referenceDate);
  }

  /*
  * Day slide has either some date or no date which is before today slide and after yesterday.
  */
  function getActiveDaySlideInfo(slideIndex) {
    var referenceDate = $scope.daySlides[slideIndex].referenceDate;
    if (referenceDate) return new Date($scope.daySlides[slideIndex].referenceDate);
    // Slide has no reference date so it is a 'no date' slide.
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
      } else if (activeDate.getTime() === DateService.getYesterdayDate().setHours(0, 0, 0, 0)) {
        // Yesterday slide. Next slide is 'no date' slide.
        previousDate = DateService.getDateWithOffset(-1, activeDate);
      } else {
        // Standard date slide. Get previous and next date.
        previousDate = DateService.getDateWithOffset(-1, activeDate);
        nextDate = DateService.getDateWithOffset(1, activeDate);
      }
    } else {
      // 'No date' slide. Previous date is yesterday and next date is today.
      previousDate = DateService.getYesterdayDate();
      nextDate = new Date();
    }

    // NOTE:  We could check equality between adjacent reference date and new adjacent date without
    //        overwriting them if it has performance gains.

    $scope.daySlides[previousIndex].referenceDate = previousDate ? DateService.getYYYYMMDD(previousDate) :
    undefined;
    $scope.daySlides[previousIndex].info = $scope.daySlides[previousIndex].referenceDate;
    // Set heading for previous slide.
    $scope.daySlides[previousIndex].heading = daySlideHeading($scope.daySlides[previousIndex].referenceDate);

    $scope.daySlides[nextIndex].referenceDate = nextDate ? DateService.getYYYYMMDD(nextDate) : undefined;
    $scope.daySlides[nextIndex].info = $scope.daySlides[nextIndex].referenceDate;
    // Set heading for next slide.
    $scope.daySlides[nextIndex].heading = daySlideHeading($scope.daySlides[nextIndex].referenceDate);
  }


  // DATEPICKER SLIDES

  var offsetFromOldActiveDatepickerSlide = 0;
  var datepickerWeeksInfosCleared = false;
  var previousActiveIndex;
  var preventDaySlideChange;
  var datepickerSlideChangeReseted;

  function datepickerSlideChangeStart(slideIndex, direction) {
    preventDaySlideChange = true;  // prevent clicks when swipe started
    // Make sure last swipe did change slide.
    if (previousActiveIndex === slideIndex) return;

    // Increment offset from active datepicker slide.
    previousActiveIndex = slideIndex;
    offsetFromOldActiveDatepickerSlide += direction === 'prev' ? -1 : 1;

    if (offsetFromOldActiveDatepickerSlide >= 2 || offsetFromOldActiveDatepickerSlide <= -2) {
      if (!datepickerWeeksInfosCleared) {
        clearDatepickerSlidesInfos();
        datepickerWeeksInfosCleared = true;
        if (!$scope.$$phase) $scope.$digest();
      }
    }
  }

  function datepickerSlideReset(activeIndex, previousIndex) {
    datepickerSlideChangeReseted = (activeIndex !== previousIndex);
  }

  function datepickerSlideChangeEnd(slidePath, activeSlideIndex) {
    preventDaySlideChange = false;  // allow clicks when swipe ended
    if (datepickerSlideChangeReseted) {
      datepickerSlideChangeReseted = false;
      offsetFromOldActiveDatepickerSlide = 0;
      previousActiveIndex = undefined;
      return;
    }

    var slidesArrayLength = $scope.datepickerWeeks.length;

    var movedOffset = offsetFromOldActiveDatepickerSlide % slidesArrayLength;
    var oldActiveSlideIndex = (activeSlideIndex - movedOffset + slidesArrayLength) % slidesArrayLength;

    var previousSlideIndex = (activeSlideIndex - 1 + slidesArrayLength) % slidesArrayLength;
    var nextSlideIndex = (activeSlideIndex + 1 + slidesArrayLength) % slidesArrayLength;

    refreshDatepickerSlides(oldActiveSlideIndex, activeSlideIndex, previousSlideIndex, nextSlideIndex,
                            offsetFromOldActiveDatepickerSlide);

    var activeDaySlideInfo = newActiveDaySlideInfo(offsetFromOldActiveDatepickerSlide);
    $scope.changeDaySlide(activeDaySlideInfo);

    if (!$scope.$$phase) $scope.$digest();
    offsetFromOldActiveDatepickerSlide = 0;
    datepickerWeeksInfosCleared = false;
    previousActiveIndex = undefined;
  }

  function clearDatepickerSlidesInfos() {
    for (var i = 0, len = $scope.datepickerWeeks.length; i < len; i++) {
      for (var j = 0, jLen = $scope.datepickerWeeks[i].length; j < jLen; j++) {
        // FIXME: use displayDate instead of displayDateShort when display format is decided!
        $scope.datepickerWeeks[i][j].displayDateShort = '&#8230;';
      }
    }
  }

  function refreshDatepickerSlides(oldActiveIndex, activeIndex, previousIndex, nextIndex, offset) {
    var referenceWeek = $scope.datepickerWeeks[oldActiveIndex];
    var newActiveWeek = DateService.generateAndReturnWeekWithOffset(offset, referenceWeek);

    var newPreviousWeek = DateService.generateAndReturnPreviousWeek(newActiveWeek);
    var newNextWeek = DateService.generateAndReturnNextWeek(newActiveWeek);

    $scope.datepickerWeeks[previousIndex] = newPreviousWeek;
    $scope.datepickerWeeks[activeIndex] = newActiveWeek;
    $scope.datepickerWeeks[nextIndex] = newNextWeek;
  }

  function newActiveDaySlideInfo(weeksOffset) {
    var oldActiveDaySlideIndex = SwiperService.getActiveSlideIndex('focus/tasks');
    // http://stackoverflow.com/a/543152
    var oldActiveDate = new Date($scope.daySlides[oldActiveDaySlideIndex].referenceDate);
    var daysOffset = weeksOffset * 7;
    return DateService.setOffsetDate(daysOffset, oldActiveDate).getYYYYMMDD(oldActiveDate);
  }

  /*
  * Construct a heading for day slide.
  *
  * Date can be shown like:
  *   - no date
  *   - today
  *   - fri 10 oct
  */
  function daySlideHeading(day) {
    return day ? day : 'no date';
  }

  $scope.getNewDayTask = function(daySlidesIndex){
    return {transientProperties: {date: $scope.daySlides[daySlidesIndex].info, completed: false}};
  };

  $scope.toggleDatepicker = function(startingDateYYYYMMDD) {
    if (!$scope.datepickerVisible) {
      if (startingDateYYYYMMDD) {
        // TODO: start from date
      } else {
        // TODO: no date slide, start from today
      }
      initializeDatepickerWeeks();
      $scope.datepickerVisible = true;
    }
    else {
      $scope.datepickerVisible = false;
      resetDatepickerState();
      $scope.datepickerWeeks = undefined;
    }
  };

  $scope.changeDaySlide = function(date) {
    if (preventDaySlideChange) return;

    // Get reference date from active slide.
    var activeSlideIndex = SwiperService.getActiveSlideIndex('focus/tasks');
    var newActiveDate = new Date(date);

    // http://stackoverflow.com/a/543152
    var offsetBetweenDays = (newActiveDate -
                             new Date($scope.daySlides[activeSlideIndex].referenceDate)) / (1000*60*60*24);

    // Offset between days determines swipe direction.
    // Set new active date to adjacent slide and swipe to that slide.
    if (offsetBetweenDays < 0) {
      // Get adjacent circular array index.
      var previousIndex = (activeSlideIndex - 1 + $scope.daySlides.length) % $scope.daySlides.length;
      $scope.daySlides[previousIndex].referenceDate = DateService.getYYYYMMDD(newActiveDate);
      $scope.daySlides[previousIndex].info = $scope.daySlides[previousIndex].referenceDate;
      // Set heading for active day slide
      $scope.daySlides[previousIndex].heading = daySlideHeading($scope.daySlides[previousIndex]
                                                                .referenceDate);

      SwiperService.swipePrevious('focus/tasks');
    }
    else if (offsetBetweenDays > 0) {
      // Get adjacent circular array index.
      var nextIndex = (activeSlideIndex + 1 + $scope.daySlides.length) % $scope.daySlides.length;
      $scope.daySlides[nextIndex].referenceDate = DateService.getYYYYMMDD(newActiveDate);
      $scope.daySlides[nextIndex].info = $scope.daySlides[nextIndex].referenceDate;
      // Set heading for active day slide
      $scope.daySlides[nextIndex].heading = daySlideHeading($scope.daySlides[nextIndex].referenceDate);

      SwiperService.swipeNext('focus/tasks');
    }
  };
}

DatesController['$inject'] = ['$scope', 'DateService', 'SwiperService', 'UISessionService'];
angular.module('em.focus').controller('DatesController', DatesController);
