'use strict';

angular.module('common').factory('DateService', [
  function() {

    var monthNames = [
    'jan', 'feb', 'mar', 'apr',
    'may', 'jun', 'jul', 'aug',
    'sep', 'oct', 'nov', 'dec'
    ];
    var weekdays = ['s', 'm', 't', 'w', 't', 'f', 's'];

    var activeWeek;
    var daysFromActiveWeekToNext = 7;
    var daysFromActiveWeekToPrevious = -daysFromActiveWeekToNext;
    
    function Today() {
      this.date = new Date();
      this.yyyymmdd = yyyymmdd(this.date);
      setNewDayTimer(this.date);
    }
    // http://stackoverflow.com/a/5294766
    function setNewDayTimer(date) {
      if (window.newDayTimer) {
        clearTimeout(newDayTimer);
      }
      var tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      window.newDayTimer = setTimeout(function() {
        today = new Today();
      }, tomorrow - date);
    }
    var today = new Today();

    // http://stackoverflow.com/a/3067896
    function yyyymmdd(date) {
      var yyyy, mm, dd;

      yyyy = date.getFullYear().toString();
      mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
      dd  = date.getDate().toString();

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
        day.displayDate = (date.toDateString() === today.date.toDateString() ? 'today' : day.month.name + ' ' + day.date);
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
      },
      getTodayDateString: function() {
        for (var i = 0, len = activeWeek.length; i < len; i++) {
          if (activeWeek[i].yyyymmdd === today.yyyymmdd) {
            return activeWeek[i].yyyymmdd;
          }
        }
      },
      getTodayYYYYMMDD: function() {
        return today.yyyymmdd;
      }
    };
  }]);
