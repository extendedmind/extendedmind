/*global angular */
'use strict';

angular.module('common').factory('DateService', [
  function() {
    var today = {};
    var monthNames = ['jan', 'feb', 'mar', 'apr', 
                  'may', 'jun', 'jul', 'aug',
                  'sep', 'oct', 'nov', 'dec'];

    return{
      yyyymmdd: function(d) {
        var yyyy, mm, dd;

        yyyy = d.getFullYear().toString();
        mm = (d.getMonth() + 1).toString(); // getMonth() is zero-based
        dd  = d.getDate().toString();

        return yyyy +'-'+ (mm[1]?mm:'0'+mm[0]) +'-'+ (dd[1]?dd:'0'+dd[0]); // padding
      },
      today: function() {
        return today;
      },
      week: function() {
        var date, day, week, i;
        date = new Date();
        week = [];
        i = 0;

        for (i = 0; i < 7; i++) {
          day = {};
          day.date = date.getDate();

          day.month = {};
          day.month.name = monthNames[date.getMonth()];
          day.month.day = date.getMonth();

          day.year = date.getFullYear();
          day.yyyymmdd = this.yyyymmdd(date);
          week.push(day);

          if (i === 0){
            day.displayDate = 'today';
            day.displayDateShort = day.displayDate;
            today = day;
          } else {
            day.displayDate = day.month.name + ' ' + day.date;
            day.displayDateShort = day.date;
          }

          if (date.getDate() < new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()) {
            date.setDate(date.getDate() + 1);
          } else {
            date.setDate(1);
            if (date.getMonth() < 11){
              date.setMonth(date.getMonth() + 1);
            } else {
              date.setMonth(0);
              date.setYear(date.getYear() + 1);
            }
          }
        }
        return week;
      }
    };
  }]);
