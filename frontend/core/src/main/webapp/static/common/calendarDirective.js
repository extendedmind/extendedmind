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
 function calendarDirective($animate, DateService) {
  return {
    restrict: 'A',
    scope: {
      getStartingDate: '&calendar',
      setDefaultDate: '=calendarSetDefaultDate',
      returnDate: '&calendarReturnDate',
      firstDay: '@calendarFirstDay',
      bound: '=calendarBound'
    },
    transclude: true,
    link: function (scope, element, attrs, controller, transclude) {
      var transcludedContent, transclusionScope;

      transclude(function(clone, scope) {
        element.append(clone);
        transcludedContent = clone;
        transclusionScope = scope;
      });

      transclusionScope.gotoCurrentMonth = function() {
        calendar.gotoToday();
      };

      var startingDate = scope.getStartingDate();

      // Set first day of the week. Default to 1 = Monday.
      var firstDay = scope.firstDay ? parseInt(scope.firstDay) : 1;

      // Listen to touch events to detect movements during date select.
      var touchMovedAmount = 0, touchMoveThreshold = 5;
      element[0].addEventListener('touchstart', function() {
        touchMovedAmount = 0;
        element[0].addEventListener('touchmove', incrementTouchMovedAmount);
        element[0].addEventListener('touchend', removeTouchListeners);
      });
      // Increment moved amount (into any direction).
      function incrementTouchMovedAmount() {
        touchMovedAmount++;
      }
      function removeTouchListeners() {
        element[0].removeEventListener('touchmove', incrementTouchMovedAmount);
        element[0].removeEventListener('touchend', removeTouchListeners);
      }

      function getActiveDate() {
        var activeDates = element[0].getElementsByClassName('is-selected');
        if (activeDates) return activeDates[0]; // There is only one active date at a time.
      }

      /*
      * Return date to whoever is interested.
      */
      function returnDate() {
        var activeDate = getActiveDate();
        if (!activeDate) return;  // Class .is-selected has not been set for some reason.

        // Callback fires too soon. Do nothing if touched past threshold.
        if (touchMovedAmount < touchMoveThreshold) {
          // Legit touch. Back to AngularJS event loop from callback.
          scope.$apply(function() {
            // Add little animation to indicate the user that he/she succesfully clicked a date.
            $animate.addClass(activeDate.firstElementChild, 'animate-calendar-selected-date')
            .then(function() {
              scope.$apply(function() {
                // Good to return the date.
                scope.returnDate({date: calendar.getDate()});
              });
            });
          });
        }
      }

      /*
      * set class to active date programmatically.
      */
      function setStartingDateActive() {
        var activeDate = getActiveDate();
        if (!activeDate) return;  // Class .is-selected has not been set for some reason.

        // Actucally, it is not animated, but we are using same class anyway.
        activeDate.firstElementChild.classList.add('animate-calendar-selected-date');
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
          weekdaysShort : DateService.getShortWeekdayNames()
        },
        onSelect: returnDate,
        onOpen: setStartingDateActive
      });
    }
  };
}
calendarDirective['$inject'] = ['$animate', 'DateService'];
angular.module('common').directive('calendar', calendarDirective);
