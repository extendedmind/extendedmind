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
    info: DateService.getYesterdayYYYYMMDD(),
    referenceDate: DateService.getYesterdayYYYYMMDD(),
    heading: daySlideHeading(DateService.getYesterdayYYYYMMDD())
  }
  ];


  // DATEPICKER SLIDES CONSTRUCTOR

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


  // DAY SLIDES

  var offsetFromOldActiveDaySlide = 0;
  var daySlidesInfosCleared = false;

  SwiperService.registerSlideChangeStartCallback(daySlideChangeStart, 'focus/tasks', 'DatesController');
  function daySlideChangeStart(direction) {

    // issue a 500ms lock to prevent leave animation for this digest cycle
    // see listItemDirective => animation
    UISessionService.lock('leaveAnimation', 500);

    // Store offset from old active day because slides can be swiped back and forth
    // before slide change end callback is fired.
    offsetFromOldActiveDaySlide += direction === 'prev' ? -1 : 1;

    // Hide dates before values are updated. Only old active date and its next and previous dates are correct.
    if (Math.abs(offsetFromOldActiveDaySlide) >= 2) {
      if (!daySlidesInfosCleared) {
        for (var i = 0, len = $scope.daySlides.length; i < len; i++) {
          $scope.daySlides[i].referenceDate = $scope.daySlides[i].info;
          $scope.daySlides[i].heading = '...';
          $scope.daySlides[i].info = undefined;
        }
        if (!$scope.$$phase) $scope.$digest();
        daySlidesInfosCleared = true;
      }
    }
  }

  /*
  * Register a slide change callback to swiper service.
  */
  SwiperService.registerSlideChangeCallback(daySlideChangeEnd, slidePath, 'focus/tasks');
  function daySlideChangeEnd(slidePath, slideIndex) {
    // Swiper is in loop mode so array that stores slide infos is circular.
    var newActiveDate;

    if (daySlidesInfosCleared) {
      // Moved offset is the remainder from total moves divided by slides array length.
      var movedOffset = offsetFromOldActiveDaySlide % $scope.daySlides.length;
      // Old active day is in old active slide index.
      var oldActiveSlideIndex = (slideIndex - movedOffset +
                                 $scope.daySlides.length) % $scope.daySlides.length;

      // Update date in active slide: set new active date with offset from old active date.
      var oldActiveDate = new Date($scope.daySlides[oldActiveSlideIndex].referenceDate);
      newActiveDate = DateService.getDateWithOffset(offsetFromOldActiveDaySlide, oldActiveDate);
      $scope.daySlides[slideIndex].referenceDate = DateService.getYYYYMMDD(newActiveDate);
      $scope.daySlides[slideIndex].info = $scope.daySlides[slideIndex].referenceDate;

      // Set heading for active day slide.
      $scope.daySlides[slideIndex].heading = daySlideHeading($scope.daySlides[slideIndex].referenceDate);

    } else {
      // Date in active slide is up to date.
      newActiveDate = new Date($scope.daySlides[slideIndex].referenceDate);
    }

    // Get adjacent new dates and set them to adjacent circular array indexes.
    var previousIndex = (slideIndex - 1 + $scope.daySlides.length) % $scope.daySlides.length;
    var nextIndex = (slideIndex + 1 + $scope.daySlides.length) % $scope.daySlides.length;

    var newPreviousDate = DateService.getDateWithOffset(-1, newActiveDate);
    var newNextDate = DateService.getDateWithOffset(1, newActiveDate);

    $scope.daySlides[previousIndex].referenceDate = DateService.getYYYYMMDD(newPreviousDate);
    $scope.daySlides[previousIndex].info = $scope.daySlides[previousIndex].referenceDate;
    // Set heading for previous slide.
    $scope.daySlides[previousIndex].heading = daySlideHeading($scope.daySlides[previousIndex].referenceDate);

    $scope.daySlides[nextIndex].referenceDate = DateService.getYYYYMMDD(newNextDate);
    $scope.daySlides[nextIndex].info = $scope.daySlides[nextIndex].referenceDate;
    // Set heading for next slide.
    $scope.daySlides[nextIndex].heading = daySlideHeading($scope.daySlides[nextIndex].referenceDate);

    // Update UI.
    if (!$scope.$$phase) $scope.$digest();

    // Set variables to initial values.
    offsetFromOldActiveDaySlide = 0;
    daySlidesInfosCleared = false;
  }


  // DATEPICKER SLIDES

  var offsetFromOldActiveDatepickerSlide = 0;
  var datepickerWeeksInfosCleared = false;

  SwiperService.registerSlideChangeStartCallback(datepickerSlideChangeStart, 'datepicker', 'DatesController');
  function datepickerSlideChangeStart(direction) {
    offsetFromOldActiveDatepickerSlide += direction === 'prev' ? -1 : 1;

    if (Math.abs(offsetFromOldActiveDatepickerSlide) >= 2) {
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

  SwiperService.registerSlideChangeCallback(datepickerSlideChangeEnd, 'datepicker', 'DatesController');
  function datepickerSlideChangeEnd(slidePath, activeSlideIndex) {
    var slidesArrayLength = $scope.datepickerWeeks.length;

    var movedOffset = offsetFromOldActiveDatepickerSlide % slidesArrayLength;
    var oldActiveSlideIndex = (activeSlideIndex - movedOffset + slidesArrayLength) % slidesArrayLength;

    var previousSlideIndex = (activeSlideIndex - 1 + slidesArrayLength) % slidesArrayLength;
    var nextSlideIndex = (activeSlideIndex + 1 + slidesArrayLength) % slidesArrayLength;

    var referenceWeek = $scope.datepickerWeeks[oldActiveSlideIndex];
    var newActiveWeek = DateService.generateAndReturnWeekWithOffset(offsetFromOldActiveDatepickerSlide,
                                                                    referenceWeek);

    var newPreviousWeek = DateService.generateAndReturnPreviousWeek(newActiveWeek);
    var newNextWeek = DateService.generateAndReturnNextWeek(newActiveWeek);

    $scope.datepickerWeeks[previousSlideIndex] = newPreviousWeek;
    $scope.datepickerWeeks[activeSlideIndex] = newActiveWeek;
    $scope.datepickerWeeks[nextSlideIndex] = newNextWeek;

    var oldActiveDaySlideIndex = SwiperService.getActiveSlideIndex('focus/tasks');

    // http://stackoverflow.com/a/543152
    var oldActiveDate = new Date($scope.daySlides[oldActiveDaySlideIndex].referenceDate);
    var offsetFromOldActiveDaySlide = offsetFromOldActiveDatepickerSlide * 7;
    var newActiveYYYYMMDD = DateService.setOffsetDate(offsetFromOldActiveDaySlide, oldActiveDate)
    .getYYYYMMDD(oldActiveDate);

    $scope.dateClicked(newActiveYYYYMMDD);

    if (!$scope.$$phase) $scope.$digest();
    offsetFromOldActiveDatepickerSlide = 0;
    datepickerWeeksInfosCleared = false;
  }

  /*
  * Construct a heading for day slide.
  */
  function daySlideHeading(day) {
    return day;
  }

  $scope.getNewDayTask = function(daySlidesIndex){
    return {transientProperties: {date: $scope.daySlides[daySlidesIndex].info, completed: false}};
  };

  $scope.dateClicked = function(date) {
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
      $scope.daySlides[nextIndex].heading = daySlideHeading($scope.daySlides[nextIndex]
                                                            .referenceDate);

      SwiperService.swipeNext('focus/tasks');
    }
  };
}

DatesController['$inject'] = ['$scope', 'DateService', 'SwiperService', 'UISessionService'];
angular.module('em.focus').controller('DatesController', DatesController);
