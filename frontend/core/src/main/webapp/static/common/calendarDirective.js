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

 /* global Pikaday */

 'use strict';
 function calendarDirective($parse, DateService) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var startingDate;
      if (attrs.calendar) startingDate = DateService.getDateTodayOrFromLaterYYYYMMDD(attrs.calendar);
      if (attrs.calendarDestroy) scope.destroyFn = $parse(attrs.calendarDestroy);

      var registerGetCalendarDateFn = $parse(attrs.calendarGetDateFn);
      registerGetCalendarDateFn(scope, {getCalendarDateFn: getPikadayDateYYYYMMDD});
      function getPikadayDateYYYYMMDD() {
        return DateService.getYYYYMMDD(calendar.getDate());
      }

      var calendar = new Pikaday({
        field: element[0],
        container: element[0],
        bound: attrs.calendarBound !== 'false',
        format: attrs.format || 'ddd MMM D YYYY',
        defaultDate: startingDate,
        setDefaultDate: attrs.calendarSetDefaultDate === 'true',
        firstDay: attrs.firstDay ? parseInt(attrs.firstDay) : 1,
        yearRange: attrs.yearRange ? JSON.parse(attrs.yearRange) : 10,
        isRTL: attrs.isRTL === 'true',
        i18n: {
          previousMonth : '',
          nextMonth     : '',
          months        : DateService.getMonthNames(),
          weekdays      : DateService.getWeekdayNames(),
          weekdaysShort : ['sun','mon','tue','wed','thu','fri','sat']
        },
        yearSuffix: attrs.yearSuffix || '',
        showMonthAfterYear: attrs.showMonthAfterYear === 'true'
      });

      scope.$on('$destroy', function() {
        if (angular.isFunction(scope.destroyFn)) scope.destroyFn(scope);
      });
    }
  };
}
calendarDirective['$inject'] = ['$parse', 'DateService'];
angular.module('common').directive('calendar', calendarDirective);
