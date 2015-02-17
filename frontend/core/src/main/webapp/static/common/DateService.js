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
   *  weekday:          'tue'
   *  yyyyymmdd:        '2014-03-18'
   *  displayDate       '18'
   *  type:             'past', 'today' or 'future'
   *
   * @param {Date} date Day of the week.
   * @returns {Array} Weekdays.
   */
   function weekDaysStartingFrom(referenceDate) {
    var week = [];
    var today = new Date();

    for (var i = 0; i < weekdaysShort.length; i++) {
      var day = {
        weekday: weekdaysShort[referenceDate.getDay()],
        displayDate: referenceDate.getDate(),
        yyyymmdd: yyyymmdd(referenceDate)
      };

      // Set date type for easy reference
      var todayYYYYMMDD = yyyymmdd(today);
      if (day.yyyymmdd === todayYYYYMMDD) day.type = 'today';
      else if (day.yyyymmdd < todayYYYYMMDD) day.type = 'past';
      else day.type = 'future';

      week.push(day);
      referenceDate.setDate(referenceDate.getDate() + 1); // Set to next day.
    }

    return week;
  }

  return {
    generateAndReturnCurrentWeek: function(date) {
      date = getFirstDateOfTheWeek(date);
      return weekDaysStartingFrom(date);
    },
    generateAndReturnPreviousWeek: function(week) {
      var date = week[0].yyyymmdd.yyyymmddToNoonDate();
      date.setDate(date.getDate() + daysFromActiveWeekToPrevious);
      return weekDaysStartingFrom(date);
    },
    generateAndReturnNextWeek: function(week) {
      var date = week[0].yyyymmdd.yyyymmddToNoonDate();
      date.setDate(date.getDate() + daysFromActiveWeekToNext);
      return weekDaysStartingFrom(date);
    },
    generateAndReturnWeekWithOffset: function(offsetWeeks, week) {
      var date = week[0].yyyymmdd.yyyymmddToNoonDate();
      var offsetDays = daysFromActiveWeekToNext * offsetWeeks;
      date.setDate(date.getDate() + offsetDays);
      return weekDaysStartingFrom(date);
    },
    numberOfDaysBetweenYYYYMMDDs: function(a, b) {
      var aDate = a.yyyymmddToNoonDate(), bDate = b.yyyymmddToNoonDate();
      return Math.abs((aDate - bDate)  / (1000*60*60*24));
    },

    // GETTERS
    getYesterdayDate: function() {
      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    },
    getTodayDateWithoutTime: function() {
      return new Date().setHours(0, 0, 0, 0);
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
      if (dateYYYYMMDD && (dateYYYYMMDD > yyyymmdd(new Date()))) return dateYYYYMMDD.yyyymmddToNoonDate();
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
      var d = new Date(date);
      d.setDate(date.getDate() + offsetDays);
      return d;
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
