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

 function snoozeDirective(DateService) {
  return {
    restrict: 'A',
    templateUrl: 'static/app/tasks/snooze.html',
    repace: true,
    scope: {
      initialDate: '@snooze',
      closeAndSave: '&snoozeCloseAndSave',
      closeAndOpen: '&snoozeCloseAndOpen',
      destroy: '&snoozeDestroy'
    },
    link: function(scope) {

      function processClose(date) {
        if (angular.isFunction(scope.closeAndSave)) scope.closeAndSave({date: date});
      }

      function setDateAndClose(date, dateSetterFn) {
        var startingDate = DateService.getDateTodayOrFromLaterYYYYMMDD(date);
        var offsetFromStaringDate = dateSetterFn(startingDate).getYYYYMMDD(startingDate);
        processClose(offsetFromStaringDate);
      }

      scope.setDateToday = function setDateToday() {
        var today = DateService.getTodayYYYYMMDD();
        processClose(today);
      };
      scope.setDateTomorrow = function setDateTomorrow() {
        var tomorrow = DateService.getTomorrowYYYYMMDD();
        processClose(tomorrow);
      };
      scope.setDateNextDay = function setDateNextDay(date) {
        setDateAndClose(date, DateService.setOffsetDate.bind(DateService, 1));
      };
      scope.setDateTwoDaysLater = function setDateTwoDaysLater(date) {
        setDateAndClose(date, DateService.setOffsetDate.bind(DateService, 2));
      };
      scope.setDateWeekend = function setDateWeekend(date) {
        setDateAndClose(date, DateService.setReferenceDate.bind(DateService, 'saturday'));
      };
      scope.setDateFirstDayOfNextWeek = function setDateFirstDayOfNextWeek(date) {
        setDateAndClose(date, DateService.setReferenceDate.bind(DateService, 'monday'));
      };
      scope.setDateFirstDayOfNextMonth = function setDateFirstDayOfNextMonth(date) {
        setDateAndClose(date, DateService.setDateToFirstDayOfNextMonth.bind(DateService));
      };

      scope.isDateTodayOrLess = function isDateTodayOrLess(date) {
        return date <= DateService.getTodayYYYYMMDD();
      };

      scope.$on('$destroy', function() {
        if (angular.isFunction(scope.destroy)) scope.destroy();
      });
    }
  };
}
snoozeDirective['$inject'] = ['DateService'];
angular.module('em.tasks').directive('snooze', snoozeDirective);
