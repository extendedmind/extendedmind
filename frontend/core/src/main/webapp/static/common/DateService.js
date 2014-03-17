'use strict';

function DateService($timeout) {

  var monthNames = [
  'jan', 'feb', 'mar', 'apr',
  'may', 'jun', 'jul', 'aug',
  'sep', 'oct', 'nov', 'dec'
  ];
  var weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  var activeWeek;
  var daysFromActiveWeekToNext = 7;
  var daysFromActiveWeekToPrevious = -daysFromActiveWeekToNext;

  var dayChangeCallback;

  function Today() {
    this.date = new Date();
    this.yyyymmdd = yyyymmdd(this.date);
    setNextDayTimer(this.date);
  }

  // Start timer timer for tomorrow.
  // http://stackoverflow.com/a/5294766
  var nextDayTimer;
  function setNextDayTimer(date) {
    stopNextDayTimer();
    var tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    nextDayTimer = $timeout(function() {
      dayChanged();
    }, tomorrow - date);
  }

  // Update today. Change week if today is Monday.
  // This function is executed after timeout or interval for next day has reached its delay.
  function dayChanged() {
    today = new Today();
    var firstDay = getFirstDayOfTheWeek(new Date());
    weekDaysStartingFrom(firstDay);
    dayChangeCallback();
  }
  var today = new Today();

  function stopNextDayTimer() {
    if (angular.isDefined(nextDayTimer)) {
      $timeout.cancel(nextDayTimer);
    }
  }

  var datepickerWeeks = [];
  function initializeDatepickerWeeks() {
    var datepickerDay = getFirstDayOfTheWeek(new Date());
    datepickerDay.setDate(datepickerDay.getDate() - 7);
    var firstDayOfPreviousWeek = getFirstDayOfTheWeek(datepickerDay);

    datepickerDay = getFirstDayOfTheWeek(new Date());
    datepickerDay.setDate(datepickerDay.getDate() + 7);
    var firstDayOfNextWeek = getFirstDayOfTheWeek(datepickerDay);

    datepickerDay = getFirstDayOfTheWeek(new Date());

    var prev = weekDaysStartingFrom(firstDayOfPreviousWeek);
    var active = weekDaysStartingFrom(datepickerDay);
    var next = weekDaysStartingFrom(firstDayOfNextWeek);
    datepickerWeeks.push(prev);
    datepickerWeeks.push(active);
    datepickerWeeks.push(next);
  }
  initializeDatepickerWeeks();

  // http://stackoverflow.com/a/3067896
  function yyyymmdd(date) {
    var yyyy, mm, dd;

    yyyy = date.getFullYear().toString();
    mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
    dd = date.getDate().toString();

    return yyyy + '-' + (mm[1] ? mm : '0' + mm[0]) + '-' + (dd[1] ? dd : '0' + dd[0]); // padding
  }

  // http://stackoverflow.com/a/4156516
  function getFirstDayOfTheWeek(date) {
    var currentDay = date.getDay();
    var diff = date.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // adjust when day is sunday
    date.setDate(diff);

    return date;
  }

  function weekDaysStartingFrom(date) {
    var day;
    var week = [];

    for (var i = 0, len = weekdays.length; i < len; i++) {
      day = {};
      day.date = date.getDate();
      day.weekday = weekdays[date.getDay()];
      day.month = {};
      day.month.name = monthNames[date.getMonth()];
      day.year = date.getFullYear();
      day.yyyymmdd = yyyymmdd(date);

      // show today or month + date
      // http://stackoverflow.com/a/9300653
      day.displayDate = (date.toDateString() === today.date.toDateString() ? 'today' : day.month.name + ' ' + day.date);
      day.displayDateShort = day.date;

      week.push(day);
      date.setDate(date.getDate() + 1);
    }

    return week;
  }

  function getWeekWithOffset(offsetDays) {
    var activeMonday = (activeWeek) ? new Date(activeWeek[0].yyyymmdd) : getFirstDayOfTheWeek(new Date());
    activeMonday.setDate(activeMonday.getDate() + offsetDays);

    return weekDaysStartingFrom(activeMonday);
  }

  return {
    datepickerWeeks: function() {
      return datepickerWeeks;
    },
    changeDatePickerWeeks: function(direction) {
      if (direction === 'prev') {
        var datepickerFirstMonday = new Date(datepickerWeeks[0][0].yyyymmdd);
        datepickerFirstMonday.setDate(datepickerFirstMonday.getDate() - 7);

        var firstDayOfPreviousWeek = getFirstDayOfTheWeek(datepickerFirstMonday);
        var prev = weekDaysStartingFrom(firstDayOfPreviousWeek);

        datepickerWeeks.splice((datepickerWeeks.length - 1), 1);
        datepickerWeeks.unshift(prev);
      } else if (direction === 'next') {
        var datepickerLastMonday = new Date(datepickerWeeks[2][0].yyyymmdd);
        datepickerLastMonday.setDate(datepickerLastMonday.getDate() + 7);

        var firstDayOfNextWeek = getFirstDayOfTheWeek(datepickerLastMonday);
        var next = weekDaysStartingFrom(firstDayOfNextWeek);

        datepickerWeeks.splice(0, 1);
        datepickerWeeks.push(next);
      }
      return datepickerWeeks;
    },
    activeWeek: function() {
      return activeWeek || (function() {
        var date = getFirstDayOfTheWeek(new Date());

        return weekDaysStartingFrom(date);
      })();
    },
    nextWeek: function() {
      activeWeek = getWeekWithOffset(daysFromActiveWeekToNext);
      return activeWeek;
    },
    previousWeek: function() {
      activeWeek = getWeekWithOffset(daysFromActiveWeekToPrevious);
      return activeWeek;
    },
    registerDayChangeCallback: function(dayChangeCB) {
      dayChangeCallback = dayChangeCB;
    },
    removeDayChangeCallback: function() {
      dayChangeCallback = null;
    },

    // getters
    getMondayDate: function() {
      return (activeWeek) ? activeWeek[0] : (function() {
        var date = getFirstDayOfTheWeek(new Date());
        activeWeek = weekDaysStartingFrom(date);
        return activeWeek[0];
      })();
    },
    getTodayDate: function() {
      if (activeWeek) {
        for (var i = 0, len = activeWeek.length; i < len; i++) {
          if (activeWeek[i].yyyymmdd === today.yyyymmdd) {
            return activeWeek[i];
          }
        }
      }
    },
    getTodayYYYYMMDD: function() {
      return today.yyyymmdd;
    }
  };
}

DateService.$inject = ['$timeout'];
angular.module('common').factory('DateService', DateService);
