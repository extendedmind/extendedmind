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

 function DatesController($filter, $rootScope, $scope, $timeout,
                          DateService, SwiperService, UISessionService, UserSessionService, packaging) {
  var slidePath = 'focus/tasks';

  // DAY SLIDES CONSTRUCTOR

  /*
  * Initial day slides state.
  *
  * Reference to 'no date' slide with null.
  */
  $scope.daySlides = [
  {
    referenceDate: DateService.getTodayYYYYMMDD()
  },
  {
    referenceDate: DateService.getTomorrowYYYYMMDD()
  },
  {
    referenceDate: DateService.getYesterdayYYYYMMDD()
  }
  ];
  $scope.daySlides[0].info = $scope.daySlides[0].referenceDate;
  $scope.daySlides[0].heading = daySlideHeading($scope.daySlides[0].info);

  $scope.daySlides[1].info = $scope.daySlides[1].referenceDate;
  $scope.daySlides[1].heading = daySlideHeading($scope.daySlides[1].referenceDate);

  $scope.daySlides[2].info = $scope.daySlides[2].referenceDate;
  $scope.daySlides[2].pastDate = $scope.daySlides[2].referenceDate;
  $scope.daySlides[2].heading = daySlideHeading($scope.daySlides[2].referenceDate);

  if (angular.isFunction($scope.registerFeatureActivateCallback))
    $scope.registerFeatureActivateCallback(focusActive, 'focus', 'DatesController');

  function focusActive(featureChanged) {
    if (featureChanged) {
      // Swipe to today without animation before next repaint when feature changes,
      // ng-show is evaluated and the DOM is rendered.
      // NOTE: use setTimeout(callback, 0) if requestAnimationFrame is not working.
      window.requestAnimationFrame(function() {
        $scope.changeDaySlide(DateService.getTodayYYYYMMDD(), 0);
      });

      if (UserSessionService.getUIPreference('showAgendaCalendar')) {
        var savedCalendars = UserSessionService.getUIPreference('calendars');
        if (savedCalendars) listCalendars(savedCalendars);
      }
    }
    else {
      // Swipe to today slide immediately.
      $scope.changeDaySlide(DateService.getTodayYYYYMMDD(), 0);
    }
  }

  if (angular.isFunction($scope.registerSynchronizeCallback))
    $scope.registerSynchronizeCallback(detectDayChange, 'DatesController');

  var today = DateService.getTodayDateWithoutTime();  // Today (date only, without time) for reference.

  function detectDayChange() {
    var newToday = DateService.getTodayDateWithoutTime();

    if (today !== newToday) {
      // Day has changed.
      today = newToday;
      var activeDaySlideIndex = SwiperService.getActiveSlideIndex('focus/tasks');
      var activeDaySlide;
      if (activeDaySlideIndex !== undefined) {
        activeDaySlide = $scope.daySlides[activeDaySlideIndex];
      }
      if (activeDaySlide && activeDaySlide.heading === 'today') {
        if (angular.isFunction($scope.getCachedTasks)) {
          var ownerUUID = UISessionService.getActiveUUID();
          var cachedTasks = $scope.getCachedTasks(ownerUUID);
          if (cachedTasks && angular.isFunction($scope.invalidateDateTasks)) {
            // Tasks needs to be invalidated so that they will be updated into new today slide.
            $scope.invalidateDateTasks(cachedTasks, ownerUUID);
          }
        }
        // Try to change from old today to new today slide.
        // NOTE: See focusActive above if this is not working.
        $scope.changeDaySlide(DateService.getTodayYYYYMMDD(), 0);
      }
    }

    if ($scope.getActiveFeature() === 'focus' && UserSessionService.getUIPreference('showAgendaCalendar')) {
      var savedCalendars = UserSessionService.getUIPreference('calendars');
      if (savedCalendars) listCalendars(savedCalendars);
    }
  }


  // DATEPICKER SLIDES CONSTRUCTOR

  /*
  * Datepicker weeks.
  *
  * Starting from the week which has the starting date.
  * Start from current week if there is no starting date.
  */
  function initializeDatepickerWeeks(startingDateYYYYMMDD) {
    var startingDate;
    if (!startingDateYYYYMMDD) {
      // FIXME: initialize to correct date when 'no date'
      startingDate = new Date();
    }
    else {
      startingDate = startingDateYYYYMMDD.yyyymmddToNoonDate();
    }

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
  $scope.daySlidesInfosCleared = false;

  SwiperService.registerSlideChangeStartCallback(daySlideChangeStart, 'focus/tasks', 'DatesController');
  function daySlideChangeStart(activeIndex, direction) {

    // Store offset from old active day because slides can be swiped back and forth
    // before slide change end callback is fired.
    offsetFromOldActiveDaySlide += direction === 'prev' ? -1 : 1;

    // Infos will be cleared when absolute value of offset from old active day slide is >= 2.
    // We are in slide change start callback and it is potentially fired many times, so check that infos are
    // cleared before comparing the absolute value.
    if (!$scope.daySlidesInfosCleared &&
        (offsetFromOldActiveDaySlide >= 2 || offsetFromOldActiveDaySlide <= -2))
    {
      $scope.daySlidesInfosCleared = true;
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

    if ($scope.daySlidesInfosCleared) {
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

    // Set to initial value before UI update.
    $scope.daySlidesInfosCleared = false;

    // Update UI.
    if (!$scope.$$phase && !$rootScope.$$phase) $scope.$digest();

    // Set to initial value.
    offsetFromOldActiveDaySlide = 0;
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
  * 'no date' is a special case.
  */
  function refreshActiveDaySlideAndReturnInfo(oldActiveIndex, newActiveIndex, offset) {
    var newActiveDate;
    var referenceDate = $scope.daySlides[oldActiveIndex].referenceDate;
    if (referenceDate === null) {
      // 'no date' slide. Next day is the reference when going past, previous day when future.
      if (offset > 0) { // Going to the future.
        oldActiveIndex = (oldActiveIndex - 1 + $scope.daySlides.length) % $scope.daySlides.length;
      } else if (offset < 0) {  // Going to the past.
        oldActiveIndex = (oldActiveIndex + 1 + $scope.daySlides.length) % $scope.daySlides.length;
      }
    }

    // Old active day is in old active slide index.
    var oldActiveDate = $scope.daySlides[oldActiveIndex].referenceDate.yyyymmddToNoonDate();
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
    if (referenceDate) return $scope.daySlides[slideIndex].referenceDate.yyyymmddToNoonDate();
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
      // Standard date slide. Get previous and next date.
      previousDate = DateService.getDateWithOffset(-1, activeDate);
      nextDate = DateService.getDateWithOffset(1, activeDate);
    }
    else if (activeDate === null) {
      // 'no date' slide. Next date is in next index and previous date is date before next.
      nextDate = $scope.daySlides[nextIndex].referenceDate.yyyymmddToNoonDate();
      previousDate = DateService.getDateWithOffset(-1, nextDate);
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
        offsetFromOldActiveDatepickerSlide >= 2 || offsetFromOldActiveDatepickerSlide <= -2))
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
    if (UserSessionService.getUIPreference('showAgendaCalendar')) {
      var savedCalendars = UserSessionService.getUIPreference('calendars');
      if (savedCalendars) listCalendars(savedCalendars);
    }
  }

  function clearDatepickerSlidesInfos() {
    setDayActive(undefined);  // Clear active day.
    for (var i = 0, len = $scope.datepickerWeeks.length; i < len; i++) {
      for (var j = 0, jLen = $scope.datepickerWeeks[i].length; j < jLen; j++) {
        $scope.datepickerWeeks[i][j].displayDate = '\u2026';
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
    var refDate = $scope.daySlides[oldActiveDaySlideIndex].referenceDate;
    if (refDate === null) {
      // 'no date'. Old active date is in the next index.
      oldActiveDaySlideIndex = (oldActiveDaySlideIndex + 1 + $scope.daySlides.length
                                ) % $scope.daySlides.length;
    }
    var oldActiveDate = $scope.daySlides[oldActiveDaySlideIndex].referenceDate.yyyymmddToNoonDate();
    var daysOffset = weeksOffset * 7;
    return DateService.setOffsetDate(daysOffset, oldActiveDate).getYYYYMMDD(oldActiveDate);
  }


  // UI

  $scope.getNewDayTask = function(daySlidesIndex){
    return $scope.getNewTask({due: $scope.daySlides[daySlidesIndex].info});
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
  $scope.getIsDayActiveClass = function(dateYYYYMMDD) {
    if (activeDateYYYYMMDD === dateYYYYMMDD) return 'active';
  };

  function getActiveDay() {
    return activeDateYYYYMMDD;
  }

  function setDayActive(dateYYYYMMDD) {
    if (dateYYYYMMDD && dateYYYYMMDD !== null) {
      // Make sure dateYYYYMMDD is set. Rapid week changing will sometimes cause it to be undefined.
      // Not 'no date'. Set date active.
      activeDateYYYYMMDD = dateYYYYMMDD;
    }
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
    $scope.changeDaySlide(DateService.getTodayYYYYMMDD());
    $scope.closeDatepicker();
    if (UserSessionService.getUIPreference('showAgendaCalendar')) {
      var savedCalendars = UserSessionService.getUIPreference('calendars');
      if (savedCalendars) listCalendars(savedCalendars);
    }
  }
  function gotoNoDate() {
    $scope.changeDaySlide(null);
    $scope.closeDatepicker();
  }

  /*
  * Set info for new day slide.
  *
  * NOTE: Offset between days is set to -1 or 1 when moving from/to 'no date' slide because offset is only
  *       used to determine swipe direction. Change implementation to one found here:
  *       http://stackoverflow.com/a/543152 if needed for something.
  */
  $scope.changeDaySlide = function(newDateYYYYMMDD, speed) {
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
      // Came from 'no date'. Reference next day as an old active date and compare it with new active date.
      newActiveDate = newDateYYYYMMDD.yyyymmddToNoonDate();
      var activeDayIndex = (activeSlideIndex + 1 + $scope.daySlides.length) % $scope.daySlides.length;
      oldActiveDate = $scope.daySlides[activeDayIndex].referenceDate.yyyymmddToNoonDate();
      offsetBetweenDays = ((newActiveDate.setHours(0, 0, 0, 0)) - (oldActiveDate.setHours(0, 0, 0, 0))
                           ) / (1000*60*60*24);
      if (offsetBetweenDays === 0) {
        // Going to same day.
        offsetBetweenDays++;
      }
    } else if (newDateYYYYMMDD === null) {
      // Going to 'no date'.
      newActiveDate = null; // 'no date'
      offsetBetweenDays = -1;
    } else {
      // Default.
      newActiveDate = newDateYYYYMMDD.yyyymmddToNoonDate();
      oldActiveDate = $scope.daySlides[activeSlideIndex].referenceDate.yyyymmddToNoonDate();
      // http://stackoverflow.com/a/543152
      offsetBetweenDays = (newActiveDate - oldActiveDate) / (1000*60*60*24);
    }

    // Offset between days determines swipe direction.
    // Set new active date to adjacent slide and swipe to that slide.
    // Slide did not change when offset between days is zero.
    if (offsetBetweenDays < 0) {
      // Get adjacent circular array index.
      var previousIndex = (activeSlideIndex - 1 + $scope.daySlides.length) % $scope.daySlides.length;
      makeDaySlide(previousIndex, newActiveDate);
      SwiperService.swipePrevious('focus/tasks', speed);
    }
    else if (offsetBetweenDays > 0) {
      // Get adjacent circular array index.
      var nextIndex = (activeSlideIndex + 1 + $scope.daySlides.length) % $scope.daySlides.length;
      makeDaySlide(nextIndex, newActiveDate);
      SwiperService.swipeNext('focus/tasks', speed);
    } else {
      // The current day clicked, close week picker
      $scope.closeDatepicker();
    }
  };

  $scope.swipeDatepickerLeft = function(){
    SwiperService.swipePrevious('datepicker');
  };

  $scope.swipeDatepickerRight = function(){
    SwiperService.swipeNext('datepicker');
  };

  if (UserSessionService.getUIPreference('showAgendaCalendar')) {
    var savedCalendars = UserSessionService.getUIPreference('calendars');
    if (savedCalendars) {
      if (!window.plugins || !window.plugins.calendar) {
        document.addEventListener('deviceready', function() {
          if (window.plugins && window.plugins.calendar) {
            listCalendars(savedCalendars);
          }
        });
      } else {
        listCalendars(savedCalendars);
      }
    }
  }

  UserSessionService.registerUIPreferenceChangedCallback(agendaVisibilityChanged, 'showAgendaCalendar',
                                                         'DatesController');
  UserSessionService.registerUIPreferenceChangedCallback(agendaCalendarsChangedCallback, 'calendars',
                                                         'DatesController');

  function agendaVisibilityChanged() {
    if (UserSessionService.getUIPreference('showAgendaCalendar')) {
      var savedCalendars = UserSessionService.getUIPreference('calendars');
      if (savedCalendars) listCalendars(savedCalendars);
    } else {
      // Agenda disabled.
      $scope.showAgenda = false;        // Remove agenda from DOM.
      cachedEventInstances = undefined; // Clear cache.
    }
  }

  function agendaCalendarsChangedCallback() {
    var savedCalendars = UserSessionService.getUIPreference('calendars');
    if (savedCalendars) listCalendars(savedCalendars);
  }

  function listCalendars(savedCalendars) {
    if (window.plugins && window.plugins.calendar) {
      window.plugins.calendar.listCalendars(function(calendarsList) {
        processEnabledCalendars(calendarsList, savedCalendars);
      }, listCalendarsError);
    }
  }

  function processEnabledCalendars(calendarsList, savedCalendars) {
    if (calendarsList && calendarsList.length) {
      var calendarIds = [], savedCalendar;
      for (var i = 0; i < calendarsList.length; i++) {

        savedCalendar = savedCalendars.findFirstObjectByKeyValue('id', calendarsList[i].id);
        if (savedCalendar && savedCalendar.enabled) {
          calendarIds.push(savedCalendar.id);
        }
      }

      if (calendarIds.length === 0) {
        // No enabled calendars in app.
        cachedEventInstances = undefined;
        $scope.showAgenda = true;
      } else {
        // Process enabled calendars.
        var startDate, endDate;

        var activeDaySlideIndex = SwiperService.getActiveSlideIndex('focus/tasks');
        if (activeDaySlideIndex !== undefined) {
          var activeDaySlide = $scope.daySlides[activeDaySlideIndex];
          if (activeDaySlide) {
            var referenceDate = activeDaySlide.referenceDate;
            if (referenceDate === null) {
              // 'no date'. Get active date from the next index.
              var nextDaySlideIndex = (activeDaySlideIndex + 1 + $scope.daySlides.length
                                       ) % $scope.daySlides.length;

              referenceDate = $scope.daySlides[nextDaySlideIndex].referenceDate;
            }
            startDate = referenceDate.yyyymmddToNoonDate();
            endDate = referenceDate.yyyymmddToNoonDate();
          }
        }

        if (!startDate && !endDate) {
          startDate = new Date();
          endDate = new Date();
        }

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        DateService.setFirstDateOfTheWeek(startDate).setOffsetDate(-7, startDate);
        DateService.setDateToFirstDayOfFortNight(endDate);

        window.plugins.calendar.listEventInstances(calendarIds, startDate, endDate,
                                                   function(eventInstances) {
                                                    listEventInstancesSuccess(eventInstances, savedCalendars);
                                                  }, listEventInstancesError);
      }
    } else {
      // No enabled calendars in device's calendar app.
      cachedEventInstances = undefined;
      $scope.showAgenda = true;
    }
  }

  function listCalendarsError(/*error*/) {
  }

  var cachedEventInstances;
  function listEventInstancesSuccess(eventInstances, savedCalendars) {
    cachedEventInstances = {
      all: []
    };

    if (eventInstances && eventInstances.length) {
      var attachGetCalendarNameByIdFn = function(eventInstance, savedCalendars) {
        eventInstance.getCalendarName = function() {
          var calendar = savedCalendars.findFirstObjectByKeyValue('id', eventInstance.calendar_id);
          if (calendar) return calendar.name;
        };
      };

      for (var i = 0; i < eventInstances.length; i++) {
        attachGetCalendarNameByIdFn(eventInstances[i], savedCalendars);
        cachedEventInstances['all'].push(eventInstances[i]);
      }
    }
    // Show agenda and update UI.
    $scope.showAgenda = true;
    if (!$scope.$$phase && !$rootScope.$$phase) $scope.$digest();
  }

  function listEventInstancesError(/*error*/) {
  }

  $scope.getEventInstances = function(yyyymmdd) {
    if (!cachedEventInstances || !cachedEventInstances['all'] || yyyymmdd === null || yyyymmdd === undefined)
    {
      // Agenda events not loaded, in the middle of fast slide changing or in 'no date' slide.
      return;
    }
    if (!cachedEventInstances[yyyymmdd]) {
      cachedEventInstances[yyyymmdd] = [];
      var noonDate = yyyymmdd.yyyymmddToNoonDate();
      var startTimeStamp = new Date(noonDate).setHours(0, 0, 0, 0);
      var endTimeStamp = new Date(noonDate);
      endTimeStamp.setDate(endTimeStamp.getDate() + 1);
      endTimeStamp.setHours(0, 0, 0, 0);
      endTimeStamp = endTimeStamp.getTime();

      generateAgendaEvents(cachedEventInstances['all'], cachedEventInstances[yyyymmdd], yyyymmdd,
                           startTimeStamp, endTimeStamp);
    }
    return cachedEventInstances[yyyymmdd];
  };

  $scope.openCalendar = function(yyyymmdd) {
    if (window.plugins && window.plugins.calendar)
      window.plugins.calendar.openCalendar(yyyymmdd.yyyymmddToNoonDate(), null, null);
  };

  function generateAgendaEvents(eventInstances, yyyymmddEventInstances, yyyymmdd, startTimeStamp,
                                endTimeStamp) {
    var isAllDayEventInRangeFn;

    if (packaging === 'android-cordova') {
      isAllDayEventInRangeFn = function(yyyymmdd, startTimeStamp, endTimeStamp, eventInstance) {
        // All-day calendar events are in UTC time

        var eventInstaceStartYYYYMMDD = DateService.dateToUTCyyyymmdd(new Date(eventInstance.begin));

        var eventInstanceEndDate = new Date(eventInstance.end);
        // All-day calendar events suffer from timezone issue turning 1-day events into 2-day events
        // https://code.google.com/p/android/issues/detail?id=14051
        DateService.setUTCOffsetDate(-1, eventInstanceEndDate);
        var eventInstaceEndYYYYMMDD = DateService.dateToUTCyyyymmdd(eventInstanceEndDate);

        return eventInstaceStartYYYYMMDD <= yyyymmdd && eventInstaceEndYYYYMMDD >= yyyymmdd;
      };
    } else if (packaging === 'ios-cordova') {
      isAllDayEventInRangeFn = function(yyyymmdd, startTimeStamp, endTimeStamp, eventInstance) {
        return eventInstance.begin < endTimeStamp && eventInstance.end > startTimeStamp;
      };
    }

    for (var i = 0; i < eventInstances.length; i++) {
      generateAgendaEvent(yyyymmddEventInstances, yyyymmdd, startTimeStamp, endTimeStamp, eventInstances[i],
                          isAllDayEventInRangeFn);
    }
  }

  /*
  * title or 'untitled'
  * start time, end time or all day
  * location
  * calendar name
  */
  function generateAgendaEvent(yyyymmddEventInstances, yyyymmdd, startTimeStamp, endTimeStamp, eventInstance,
                               isAllDayEventInRangeFn) {

    var agendaEvent;

    if (eventInstance.allDay) {
      if (isAllDayEventInRangeFn(yyyymmdd, startTimeStamp, endTimeStamp, eventInstance)) {
        agendaEvent = {
          allDay: true
        };
      }
    }

    else if (eventInstance.begin < startTimeStamp && eventInstance.end >= endTimeStamp) {
      // Start of the event is before start time.
      // End of the event equals or is after end time.
      agendaEvent = {
        allDay: true
      };
    }

    else if (eventInstance.begin > startTimeStamp && eventInstance.begin < endTimeStamp &&
             eventInstance.end > endTimeStamp)
    {
      // Start of the event is between start time and end time.
      // End of the event is after the end time.
      agendaEvent = {
        begin: $filter('date')(eventInstance.begin, 'HH:mm'),
        end: 'starts'
        // 9:00
        // starts
      };
    }

    else if (eventInstance.begin < startTimeStamp && eventInstance.end > startTimeStamp &&
             eventInstance.end < endTimeStamp)
    {
      // Start of the event is before the start time.
      // End of the event is between start time and end time.
      agendaEvent = {
        begin: 'ends',
        end: $filter('date')(eventInstance.end, 'HH:mm')
        // ends
        // 9:00
      };
    }

    else if (eventInstance.begin < endTimeStamp && eventInstance.end > startTimeStamp) {
      // Event is between start and end time.
      agendaEvent = {
        begin: $filter('date')(eventInstance.begin, 'HH:mm'),
        end: $filter('date')(eventInstance.end, 'HH:mm')
        // 9:00
        // 12:45
      };
    }

    if (agendaEvent) {
      agendaEvent.title = eventInstance.title || 'untitled';
      agendaEvent.calendarName = eventInstance.getCalendarName();
      if (eventInstance.eventLocation) {
        agendaEvent.eventLocation = eventInstance.eventLocation;
      }
      if (eventInstance.rrule) {
        agendaEvent.rrule = true;
      }
      agendaEvent.event_id = eventInstance.event_id;

      yyyymmddEventInstances.push(agendaEvent);
    }
  }

  $scope.$on('$destroy', function() {
    if (angular.isFunction($scope.unregisterSynchronizeCallback))
      $scope.unregisterSynchronizeCallback('DatesController');
  });

  $scope.showAgenda = true;
  $scope.showAgenda = true;
  packaging = 'ios-cordova';

  cachedEventInstances = {
    all: [{
      event_id: '644',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '6',
      eventLocation: '',
      title: 'JP Portugalissa',
      allDay: 1,
      end: 1425427200000,
      begin: 1424995200000
    },
    {
      event_id: '514',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '5',
      eventLocation: 'Kulttuuritehdas Korjaamo, Töölonkatu 51 a-b, 00250 Helsinki, Suomi',
      title: 'Sisun päivän juhla',
      allDay: 0,
      end: 1425159000000,
      begin: 1425135600000
    },
    {
      calendar_id: '5',
      eventLocation: 'Bulevardi',
      title: 'FA viikon kickoff',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;UNTIL=20150628T235959Z;INTERVAL=1;WKST=MO',
      event_id: '346',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1425290400000,
      begin: 1425286800000
    },
    {
      calendar_id: '5',
      eventLocation: '',
      title: 'SKYPE',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;UNTIL=20150628T235959Z;INTERVAL=1;WKST=MO',
      event_id: '538',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1425287700000,
      begin: 1425286800000
    },
    {
      calendar_id: '6',
      eventLocation: '',
      title: 'EM Kickoff',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;WKST=MO;BYDAY=MO',
      event_id: '403',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1425288600000,
      begin: 1425286800000
    },
    {
      calendar_id: '5',
      eventLocation: '',
      title: 'FA yhteislounas',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;UNTIL=20150628T235959Z;INTERVAL=1;WKST=MO;BYDAY=MO',
      event_id: '347',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1425294000000,
      begin: 1425290400000
    },
    {
      calendar_id: '5',
      eventLocation: '',
      title: 'Myynnin Kick-Off',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;WKST=MO;BYDAY=MO',
      event_id: '544',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1425297600000,
      begin: 1425294000000
    },
    {
      event_id: '642',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '2',
      eventLocation: '',
      title: 'Ideointi muutosvoima -hanke',
      allDay: 0,
      end: 1425304800000,
      begin: 1425297600000
    },
    {
      event_id: '555',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '3',
      eventLocation: 'Toimistolla',
      title: 'Myynnin seurannan järkevöittäminen Sonjan kanssa',
      allDay: 0,
      end: 1425301200000,
      begin: 1425297600000
    },
    {
      event_id: '575',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '5',
      eventLocation: '',
      title: 'Ideointisessio Muutosvoima -hanke',
      allDay: 0,
      end: 1425304800000,
      begin: 1425297600000
    },
    {
      calendar_id: '3',
      eventLocation: 'Byroo',
      title: 'Soittoaamu',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;COUNT=10;WKST=MO;BYDAY=TU',
      event_id: '84',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1425366600000,
      begin: 1425363000000
    },
    {
      calendar_id: '2',
      eventLocation: '',
      title: 'FA myyntisessiot',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;INTERVAL=1;WKST=MO',
      event_id: '599',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1425380400000,
      begin: 1425366000000
    },
    {
      calendar_id: '3',
      eventLocation: 'Bulsa/joku lähiravintola',
      title: 'hallitusten kokous',
      allDay: 0,
      rrule: 'FREQ=MONTHLY;UNTIL=20160802T130000Z;WKST=MO;BYDAY=1TU',
      event_id: '69',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1425394800000,
      begin: 1425391200000
    },
    {
      event_id: '676',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '1',
      eventLocation: '',
      title: '',
      allDay: 0,
      end: 1425461400000,
      begin: 1425420000000
    },
    {
      event_id: '658',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '2',
      eventLocation: '',
      title: 'Siivous',
      allDay: 0,
      end: 1425488400000,
      begin: 1425477600000
    },
    {
      calendar_id: '3',
      eventLocation: 'Byroo',
      title: 'Soittoaamu',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;COUNT=10;WKST=MO;BYDAY=TH',
      event_id: '85',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1425539400000,
      begin: 1425535800000
    },
    {
      event_id: '344',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '5',
      eventLocation: '',
      title: 'FA:n mökkiviikonloppu',
      allDay: 0,
      end: 1425823200000,
      begin: 1425636000000
    },
    {
      event_id: '522',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '6',
      eventLocation: '',
      title: 'FA mökkiviikonloppu',
      allDay: 0,
      end: 1425816000000,
      begin: 1425639600000
    },
    {
      event_id: '420',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '8',
      eventLocation: '',
      title: 'Tuomas Saarelas birthday',
      allDay: 1,
      end: 1425945600000,
      begin: 1425859200000
    },
    {
      event_id: '261',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '5',
      eventLocation: '',
      title: 'Strategia/TUKE: TARJOUSPOHJATALKOOT',
      allDay: 0,
      end: 1425891600000,
      begin: 1425886200000
    },
    {
      calendar_id: '5',
      eventLocation: 'Bulevardi',
      title: 'FA viikon kickoff',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;UNTIL=20150628T235959Z;INTERVAL=1;WKST=MO',
      event_id: '346',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1425895200000,
      begin: 1425891600000
    },
    {
      calendar_id: '5',
      eventLocation: '',
      title: 'SKYPE',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;UNTIL=20150628T235959Z;INTERVAL=1;WKST=MO',
      event_id: '538',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1425892500000,
      begin: 1425891600000
    },
    {
      calendar_id: '6',
      eventLocation: '',
      title: 'EM Kickoff',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;WKST=MO;BYDAY=MO',
      event_id: '403',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1425893400000,
      begin: 1425891600000
    },
    {
      calendar_id: '5',
      eventLocation: '',
      title: 'FA yhteislounas',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;UNTIL=20150628T235959Z;INTERVAL=1;WKST=MO;BYDAY=MO',
      event_id: '347',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1425898800000,
      begin: 1425895200000
    },
    {
      calendar_id: '5',
      eventLocation: '',
      title: 'Myynnin Kick-Off',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;WKST=MO;BYDAY=MO',
      event_id: '544',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1425902400000,
      begin: 1425898800000
    },
    {
      event_id: '662',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '5',
      eventLocation: 'Toimistolla',
      title: 'FA:n ulkoisen viestinnän kehittäminen',
      allDay: 0,
      end: 1425906000000,
      begin: 1425902400000
    },
    {
      event_id: '688',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '1',
      eventLocation: '',
      title: 'Asd',
      allDay: 0,
      end: 1425924000000,
      begin: 1425920400000
    },
    {
      calendar_id: '2',
      eventLocation: '',
      title: 'FA myyntisessiot',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;INTERVAL=1;WKST=MO',
      event_id: '599',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1425985200000,
      begin: 1425970800000
    },
    {
      event_id: '670',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '3',
      eventLocation: '',
      title: 'Lounas /w markus',
      allDay: 0,
      end: 1425985200000,
      begin: 1425981600000
    },
    {
      event_id: '689',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '1',
      eventLocation: '',
      title: 'Keskeisiä suora  Dkdkdjdjkdk ekeie djdjdjdj ekeie ekeie ejkee e-kirjat rikkeen djdjdjdj',
      allDay: 0,
      end: 1426010400000,
      begin: 1426006800000
    },
    {
      event_id: '666',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '3',
      eventLocation: '',
      title: 'Parturi',
      allDay: 0,
      end: 1426060800000,
      begin: 1426057200000
    },
    {
      event_id: '570',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '3',
      eventLocation: '',
      title: 'Leading Passion tapaaminen FA toimistolla',
      allDay: 0,
      end: 1426082400000,
      begin: 1426075200000
    },
    {
      event_id: '657',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '1',
      eventLocation: 'täälläpäsks',
      title: 'neljä kertaa',
      allDay: 0,
      end: 1426082400000,
      begin: 1426078800000
    },
    {
      calendar_id: '2',
      eventLocation: '',
      title: 'Siivous',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;WKST=MO',
      event_id: '619',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1426093200000,
      begin: 1426082400000
    },
    {
      calendar_id: '3',
      eventLocation: '',
      title: 'Soittoaamupäivä',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;WKST=MO;BYDAY=TH',
      event_id: '682',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1426154400000,
      begin: 1426140000000
    },
    {
      event_id: '528',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '5',
      eventLocation: 'Käytännön järjestelyt (Sonja)',
      title: 'Fasilitointitaitojen sisäinen valmennus',
      allDay: 0,
      end: 1426255200000,
      begin: 1426251600000
    },
    {
      event_id: '638',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '2',
      eventLocation: '',
      title: 'Puhujakoulu',
      allDay: 0,
      end: 1426432200000,
      begin: 1426316400000
    },
    {
      event_id: '687',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '1',
      eventLocation: '',
      title: 'Se',
      allDay: 0,
      end: 1426352400000,
      begin: 1426348800000
    },
    {
      calendar_id: '5',
      eventLocation: 'Bulevardi',
      title: 'FA viikon kickoff',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;UNTIL=20150628T235959Z;INTERVAL=1;WKST=MO',
      event_id: '346',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1426500000000,
      begin: 1426496400000
    },
    {
      calendar_id: '5',
      eventLocation: '',
      title: 'SKYPE',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;UNTIL=20150628T235959Z;INTERVAL=1;WKST=MO',
      event_id: '538',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1426497300000,
      begin: 1426496400000
    },
    {
      calendar_id: '6',
      eventLocation: '',
      title: 'EM Kickoff',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;WKST=MO;BYDAY=MO',
      event_id: '403',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1426498200000,
      begin: 1426496400000
    },
    {
      calendar_id: '5',
      eventLocation: '',
      title: 'FA yhteislounas',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;UNTIL=20150628T235959Z;INTERVAL=1;WKST=MO;BYDAY=MO',
      event_id: '347',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1426503600000,
      begin: 1426500000000
    },
    {
      calendar_id: '5',
      eventLocation: '',
      title: 'Myynnin Kick-Off',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;WKST=MO;BYDAY=MO',
      event_id: '544',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1426507200000,
      begin: 1426503600000
    },
    {
      event_id: '660',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '5',
      eventLocation: 'Lönnrotinkatu 5, 00120 Helsinki, Suomi',
      title: 'Excu Fondialla',
      allDay: 0,
      end: 1426510800000,
      begin: 1426507200000
    },
    {
      event_id: '311',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '5',
      eventLocation: '',
      title: 'Tutkijasemma:  Lauri Järvilehto',
      allDay: 0,
      end: 1426521600000,
      begin: 1426514400000
    },
    {
      calendar_id: '2',
      eventLocation: '',
      title: 'FA myyntisessiot',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;INTERVAL=1;WKST=MO',
      event_id: '599',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1426590000000,
      begin: 1426575600000
    },
    {
      event_id: '546',
      getCalendarName: function() {
        return 'calendar';
      },
      calendar_id: '3',
      eventLocation: 'Luoteisrinne 4, 02270 Espoo, Suomi',
      title: 'Tapaaminen / Alfa Laval Vantaa Oy / Benny Lillqvist',
      allDay: 0,
      end: 1426593600000,
      begin: 1426590000000
    },
    {
      calendar_id: '1',
      eventLocation: 'täälläpäsks',
      title: 'neljä kertaa',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;COUNT=4;WKST=MO;BYDAY=WE',
      event_id: '643',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1426685400000,
      begin: 1426681800000
    },
    {
      calendar_id: '2',
      eventLocation: '',
      title: 'Siivous',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;WKST=MO',
      event_id: '619',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1426698000000,
      begin: 1426687200000
    },
    {
      calendar_id: '3',
      eventLocation: '',
      title: 'Soittoaamupäivä',
      allDay: 0,
      rrule: 'FREQ=WEEKLY;WKST=MO;BYDAY=TH',
      event_id: '682',
      getCalendarName: function() {
        return 'calendar';
      },
      end: 1426759200000,
      begin: 1426744800000
    }, ]
  };
}

DatesController['$inject'] = ['$filter', '$rootScope', '$scope', '$timeout',
'DateService', 'SwiperService', 'UISessionService', 'UserSessionService', 'packaging'];
angular.module('em.focus').controller('DatesController', DatesController);
