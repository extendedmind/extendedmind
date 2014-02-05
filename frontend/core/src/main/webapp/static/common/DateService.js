'use strict';

angular.module('common').factory('DateService', [
  function() {
    var today = new Date();

    var monthNames = [
    'jan', 'feb', 'mar', 'apr',
    'may', 'jun', 'jul', 'aug',
    'sep', 'oct', 'nov', 'dec'
    ];
    var weekdays = ['s', 'm', 't', 'w', 't', 'f', 's'];

    var activeWeek;
    var daysFromActiveWeekToNext = 7;
    var daysFromActiveWeekToPrevious = -daysFromActiveWeekToNext;

    // http://stackoverflow.com/a/3067896
    function yyyymmdd(date) {
      var yyyy, mm, dd;

      yyyy = date.getFullYear().toString();
      mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
      dd  = date.getDate().toString();

      return yyyy + '-' + (mm[1] ? mm : '0' + mm[0]) + '-' + (dd[1] ? dd : '0' + dd[0]); // padding
    }

    function toDate(yyyymmdd) {
      var year = yyyymmdd.substring(0,4);
      var month = yyyymmdd.substring(5,7);
      var day = yyyymmdd.substring(8,9);
      return new Date(year, month-1, day);
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
      activeWeek = [];

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
        day.displayDate = (date.toDateString() === today.toDateString() ? 'today' : day.month.name + ' ' + day.date);
        day.displayDateShort = day.date;

        activeWeek.push(day);
        date.setDate(date.getDate() + 1);
      }
      
      return activeWeek;
    }

    function getWeekWithOffset(offsetDays) {
      var activeMonday = new Date(activeWeek[0].yyyymmdd);
      activeMonday.setDate(activeMonday.getDate() + offsetDays);

      return weekDaysStartingFrom(activeMonday);
    }

    return {
      toDate: function(yyyymmdd) {
        return toDate(yyyymmdd);
      },
      yyyymmdd: function(date) {
        return yyyymmdd(date);
      },
      today: function() {
        return today;
      },
      activeWeek: function() {
        return activeWeek || (function() {
          var date = getFirstDayOfTheWeek(new Date());

          return weekDaysStartingFrom(date);
        })();
      },
      nextWeek: function() {
        return getWeekWithOffset(daysFromActiveWeekToNext);
      },
      previousWeek: function() {
        return getWeekWithOffset(daysFromActiveWeekToPrevious);
      },
      getMondayDateString: function() {
        return activeWeek[0].yyyymmdd;
      }
    };
  }]);
