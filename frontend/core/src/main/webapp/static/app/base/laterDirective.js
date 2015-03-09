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

 function laterDirective($rootScope, DateService) {
  return {
    restrict: 'A',
    templateUrl: $rootScope.urlBase + 'app/base/later.html',
    scope: {
      closeAndSave: '&later'
    },
    link: function(scope) {

      function processClose(date) {
        if (angular.isFunction(scope.closeAndSave)) scope.closeAndSave({date: date});
      }

      function setDateAndClose(date, dateSetterFn) {
        dateSetterFn(date);
        processClose(date);
      }

      scope.setDateToday = function() {
        processClose(new Date());
      };

      scope.setDateTomorrow = function() {
        var tomorrow = DateService.getTomorrowDate();
        processClose(tomorrow);
      };

      scope.setDateDayAfterTomorrow = function() {
        var tomorrow = DateService.getTomorrowDate();
        setDateAndClose(tomorrow, DateService.setOffsetDate.bind(DateService, 1));
      };

      scope.setDateNextWeekend = function() {
        var date = new Date();
        setDateAndClose(date, DateService.setReferenceDateToNext.bind(DateService, 'saturday'));
      };

      scope.setDateFirstDayOfNextWeek = function() {
        var date = new Date();
        setDateAndClose(date, DateService.setReferenceDateToNext.bind(DateService, 'monday'));
      };

      scope.setDateToSecondMonday = function() {
        var date = new Date();
        setDateAndClose(date, DateService.setDateToFirstDayOfFortNight.bind(DateService));
      };

      scope.setDateFirstDayOfNextMonth = function() {
        var date = new Date();
        setDateAndClose(date, DateService.setDateToFirstDayOfNextMonth.bind(DateService));
      };
    }
  };
}
laterDirective['$inject'] = ['$rootScope', 'DateService'];
angular.module('em.base').directive('later', laterDirective);
