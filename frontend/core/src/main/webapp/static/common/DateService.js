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

 function DateService() {

  var monthNames = [
  'jan', 'feb', 'mar', 'apr',
  'may', 'jun', 'jul', 'aug',
  'sep', 'oct', 'nov', 'dec'
  ];
  var weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  var weekdaysShort = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  var activeWeek;
  var daysFromActiveWeekToNext = 7;
  var daysFromActiveWeekToPrevious = -daysFromActiveWeekToNext;

  // http://stackoverflow.com/a/3067896
  function yyyymmdd(date) {
    var yyyy, mm, dd;

    yyyy = date.getFullYear().toString();
    mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
    dd = date.getDate().toString();

    return yyyy + '-' + (mm[1] ? mm : '0' + mm[0]) + '-' + (dd[1] ? dd : '0' + dd[0]); // padding
  }

  // http://stackoverflow.com/a/4156516
  function getFirstDateOfTheWeek(date) {
    var currentDay = date.getDay();
    var diff = date.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // adjust when day is sunday
    date.setDate(diff);

    return date;
  }

  /**
   * @description
   *
   * Constructs a week with date objects in a following format:
   *  date:             '18'
   *  weekday:          'tuesday'
   *  weekdayIndex:     '1'
   *  month.name:       'mar'
   *  year:             '2014'
   *  yyyyymmdd:        '2014-03-18'
   *  displayDate:      'mar 18' or 'today'
   *  displayDateShort  '18'
   *
   * @param {Date} date Day of the week.
   * @returns {Array} Weekdays.
   */
   function weekDaysStartingFrom(date) {
    var day;
    var week = [];
    var today = new Date();

    for (var i = 0, len = weekdaysShort.length; i < len; i++) {
      var dayIndex = (date.getDay() === 0) ? 6 : date.getDay() - 1;
      day = {};
      day.date = date.getDate();
      day.weekday = weekdaysShort[date.getDay()];
      day.weekdayIndex = dayIndex;
      day.month = {};
      day.month.name = monthNames[date.getMonth()];
      day.year = date.getFullYear();
      day.yyyymmdd = yyyymmdd(date);

      // show today or month + date
      // http://stackoverflow.com/a/9300653
      day.referenceDate = day.displayDate =
      (date.toDateString() === today.toDateString() ? 'today' : day.month.name + ' ' + day.date);
      day.displayDateShort = day.date;

      week.push(day);
      date.setDate(date.getDate() + 1);
    }

    return week;
  }

  return {
    generateAndReturnCurrentWeek: function(date) {
      date = getFirstDateOfTheWeek(date);
      return weekDaysStartingFrom(date);
    },
    generateAndReturnPreviousWeek: function(week) {
      var date = new Date(week[0].yyyymmdd);
      date.setDate(date.getDate() + daysFromActiveWeekToPrevious);
      return weekDaysStartingFrom(date);
    },
    generateAndReturnNextWeek: function(week) {
      var date = new Date(week[0].yyyymmdd);
      date.setDate(date.getDate() + daysFromActiveWeekToNext);
      return weekDaysStartingFrom(date);
    },
    generateAndReturnWeekWithOffset: function(offsetWeeks, week) {
      var date = new Date(week[0].yyyymmdd);
      var offsetDays = daysFromActiveWeekToNext * offsetWeeks;
      date.setDate(date.getDate() + offsetDays);
      return weekDaysStartingFrom(date);
    },
    /**
    * @description
    * Check if week is current week and that today is in the right day.
    */
    isCurrentWeekValid: function(week) {
      var todayYYYYMMDD = this.getTodayYYYYMMDD(new Date());
      for (var i = 0, len = week.length; i < len; i++) {
        if (week[i].displayDate === 'today') return week[i].yyyymmdd === todayYYYYMMDD;
      }
      return true;
    },
    isDateBeforeCurrentWeek: function(date) {
      var firstDayOfCurrentWeek = getFirstDateOfTheWeek(new Date());
      return date.yyyymmdd < (yyyymmdd(firstDayOfCurrentWeek));
    },

    // getters
    getMondayDate: function() {
      return (activeWeek) ? activeWeek[0] : (function() {
        var date = getFirstDateOfTheWeek(new Date());
        activeWeek = weekDaysStartingFrom(date);
        return activeWeek[0];
      })();
    },
    getYesterdayDate: function() {
      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    },
    getTodayDate: function(currentWeek) {
      var today = new Date();
      for (var i = 0, len = currentWeek.length; i < len; i++) {
        if (currentWeek[i].yyyymmdd === yyyymmdd(today)) {
          return currentWeek[i];
        }
      }
    },
    getTomorrowDate: function() {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    },
    getYYYYMMDD: function(date) {
      return yyyymmdd(date);
    },
    getFirstDateOfTheWeek: function(date) {
      return getFirstDateOfTheWeek(date);
    },
    getFirstDateOfTheMonth: function(date) {
      return new Date(date.getFullYear(), date.getMonth(), 1);
    },
    getYesterdayYYYYMMDD: function() {
      var yesterday = this.getYesterdayDate();
      return yyyymmdd(yesterday);
    },
    getTodayYYYYMMDD: function() {
      return yyyymmdd(new Date());
    },
    getTomorrowYYYYMMDD: function() {
      var tomorrow = this.getTomorrowDate();
      return yyyymmdd(tomorrow);
    },
    getDateTodayOrFromLaterYYYYMMDD: function(dateYYYYMMDD) {
      if (dateYYYYMMDD && (dateYYYYMMDD > yyyymmdd(new Date()))) return new Date(dateYYYYMMDD);
      else return new Date();
    },
    getShortWeekdayNames: function() {
      return weekdaysShort;
    },
    getWeekdayNames: function() {
      return weekdays;
    },
    getMonthNames: function() {
      return monthNames;
    },
    getDateWithOffset: function(offsetDays, date) {
      // console.log(date.getDate());
      var d = new Date(date);
      d.setDate(date.getDate() + offsetDays);
      return d;
    },

    /*
     * For a given date, get the ISO week number
     *
     * Copied from: http://stackoverflow.com/a/6117889
     *
     * Based on information at:
     *
     *    http://www.merlyn.demon.co.uk/weekcalc.htm#WNR
     *
     * Algorithm is to find nearest thursday, it's year
     * is the year of the week number. Then get weeks
     * between that date and the first day of that year.
     *
     * Note that dates in one year can be weeks of previous
     * or next year, overlap is up to 3 days.
     *
     * e.g. 2014/12/29 is Monday in week  1 of 2015
     *      2012/1/1   is Sunday in week 52 of 2011
     */
     getWeekNumber: function(d) {
      // Copy date so don't modify original
      d = new Date(+d);
      d.setHours(0,0,0);
      // Set to nearest Thursday: current date + 4 - current day number
      // Make Sunday's day number 7
      d.setDate(d.getDate() + 4 - (d.getDay()||7));
      // Get first day of year
      var yearStart = new Date(d.getFullYear(),0,1);
      // Calculate full weeks to nearest Thursday
      var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
      // Return array of year and week number
      return weekNo;
    },

    // setters
    setReferenceDate: function(weekday, referenceDate) {
      // http://stackoverflow.com/a/1579109
      var offsetToWeekday = (weekdays.indexOf(weekday) + (7 - referenceDate.getDay())) % 7;
      // jump seven days if reference day is same day as weekday
      if (offsetToWeekday === 0) offsetToWeekday = 7;
      referenceDate.setDate(referenceDate.getDate() + offsetToWeekday);
      return this;
    },
    setOffsetDate: function(offsetDays, date) {
      date.setDate(date.getDate() + offsetDays);
      return this;
    },
    setDateToFirstDayOfFortNight: function(referenceDate) {
      var offsetToWeekday = (weekdays.indexOf('monday') + (7 - referenceDate.getDay())) % 7;
      // jump seven days if reference day is same day as weekday
      if (offsetToWeekday === 0) offsetToWeekday = 7;
      // set new date with offset to next monday plus one week.
      referenceDate.setDate(referenceDate.getDate() + offsetToWeekday + 7);
      return this;
    },
    setDateToFirstDayOfNextMonth: function(referenceDate) {
      referenceDate.setMonth(referenceDate.getMonth() + 1);
      referenceDate.setDate(1);
      return this;
    }
  };
}

angular.module('common').factory('DateService', DateService);
