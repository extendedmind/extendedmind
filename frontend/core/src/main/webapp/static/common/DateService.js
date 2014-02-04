'use strict';

angular.module('common').factory('DateService', [
  function() {
    var today = {};
    var monthNames = [
    'jan', 'feb', 'mar', 'apr',
    'may', 'jun', 'jul', 'aug',
    'sep', 'oct', 'nov', 'dec'
    ];
    var weekdays = ['s', 'm', 't', 'w', 't', 'f', 's'];
    var numberOfDays = 7;

    // date object with shared data (prototype/this)

    function nextDate(date) {
      // compare current date with number of days in month
      // http://stackoverflow.com/a/315767
      if (date.getDate() < new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()) {
        date.setDate(date.getDate() + 1);
      } else {
        // reset date
        date.setDate(1);
        // compare current month with number of months in year
        if (date.getMonth() < 11) { //getMonth() is zero-based
          date.setMonth(date.getMonth() + 1);
        } else {
        // reset month and year
        date.setMonth(0);
        date.setYear(date.getYear() + 1);
      }
    }
    return date;
  }

  // http://stackoverflow.com/a/3067896
  function yyyymmdd(date) {
    var yyyy, mm, dd;

    yyyy = date.getFullYear().toString();
    mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
    dd  = date.getDate().toString();

    return yyyy +'-'+ (mm[1]?mm:'0'+mm[0]) +'-'+ (dd[1]?dd:'0'+dd[0]); // padding
  }

  return {
    today: function() {
      return today;
    },
    week: function() {
      var date, day, week, i;
      date = new Date();
      week = [];
      i = 0;

      for (i = 0; i < numberOfDays; i++) {
        day = {};
        day.date = date.getDate();
        day.weekday = weekdays[date.getDay()];

        day.month = {};
        day.month.name = monthNames[date.getMonth()];

          // is this needed?
          day.month.number = date.getMonth() + 1;

          day.year = date.getFullYear();
          day.yyyymmdd = yyyymmdd(date);
          week.push(day);

          if (i === 0) {
            day.displayDate = 'today';
            today = day;
          } else {
            day.displayDate = day.month.name + ' ' + day.date;
          }
          day.displayDateShort = day.date;

          date = nextDate(date);
        }
        return week;
      }
    };
  }]);
