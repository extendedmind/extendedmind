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
 function calendarDirective(DateService) {
  return {
    restrict: 'A',
    scope: {
      getStartingDate: '&calendar',
      setDefaultDate: '=calendarSetDefaultDate',
      returnDate: '&calendarReturnDate',
      firstDay: '@calendarFirstDay',
      bound: '=calendarBound'
    },
    link: function (scope, element) {
      var startingDate = scope.getStartingDate();

      // Set first day of the week. Default to 1 = Monday.
      var firstDay = scope.firstDay ? parseInt(scope.firstDay) : 1;

      function returnDate() {
        // Back to AngularJS event loop from callback.
        scope.$apply(function() {
          scope.returnDate({date: calendar.getDate()});
        });
      }

      // See https://github.com/dbushell/Pikaday#configuration for all available options.
      var calendar = new Pikaday({
        field: element[0],
        container: element[0],
        bound: scope.bound,
        defaultDate: startingDate,
        setDefaultDate: scope.setDefaultDate,
        firstDay: firstDay,
        i18n: {
          previousMonth : '', // Remove previous month text label
          nextMonth     : '', // Remove next month text label
          months        : DateService.getMonthNames(),
          weekdays      : DateService.getWeekdayNames(),
          weekdaysShort : ['sun','mon','tue','wed','thu','fri','sat']
        },
        onSelect: returnDate
      });
    }
  };
}
calendarDirective['$inject'] = ['DateService'];
angular.module('common').directive('calendar', calendarDirective);
