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
    scope: {
      task: '=snooze',
      openSnooze: '=snoozeOpen',
      selectedFn: '=snoozeSelected',
      closeAndCall: '=snoozeClose',
      pikadayHasDoneButton: '=snoozePikadayHasDoneButton',
      scrollToElementFn: '=snoozeScrollToElement'
    },
    link: function(scope) {

      scope.openSnooze.pikaday = {
        isVisible: false,
        hasDoneButton: scope.pikadayHasDoneButton
      };

      function processClose(task) {
        if (angular.isFunction(scope.closeAndCall)) {
          scope.closeAndCall(task, scope.selectedFn);
        } else if (angular.isFunction(scope.selectedFn)) {
          scope.selectedFn(task);
        }
        scope.openSnooze.isOpen = false;
      }

      function setTaskDateAndSave(task, dateSetterFn) {
        if (!task.transientProperties) task.transientProperties = {};

        var startingDate = DateService.getDateTodayOrFromLaterYYYYMMDD(task.transientProperties.date);
        task.transientProperties.date = dateSetterFn(startingDate).getYYYYMMDD(startingDate);
        processClose(task);
      }

      scope.savePikaday = function savePikaday(task) {
        processClose(task);
      };

      scope.setDateToday = function setDateToday(task) {
        if (!task.transientProperties) task.transientProperties = {};
        task.transientProperties.date = DateService.getTodayYYYYMMDD();
        processClose(task);
      };
      scope.setDateTomorrow = function setDateTomorrow(task) {
        if (!task.transientProperties) task.transientProperties = {};
        task.transientProperties.date = DateService.getTomorrowYYYYMMDD();
        processClose(task);
      };
      scope.setDateNextDay = function setDateNextDay(task) {
        setTaskDateAndSave(task, DateService.setOffsetDate.bind(DateService, 1));
      };
      scope.setDateTwoDaysLater = function setDateTwoDaysLater(task) {
        setTaskDateAndSave(task, DateService.setOffsetDate.bind(DateService, 2));
      };
      scope.setDateWeekend = function setDateWeekend(task) {
        setTaskDateAndSave(task, DateService.setReferenceDate.bind(DateService, 'saturday'));
      };
      scope.setDateFirstDayOfNextWeek = function setDateFirstDayOfNextWeek(task) {
        setTaskDateAndSave(task, DateService.setReferenceDate.bind(DateService, 'monday'));
      };
      scope.setDateFirstDayOfNextMonth = function setDateFirstDayOfNextMonth(task) {
        setTaskDateAndSave(task, DateService.setDateToFirstDayOfNextMonth.bind(DateService));
      };

      scope.isTaskDateTodayOrLess = function isTaskDateTodayOrLess(task) {
        if (task.transientProperties && task.transientProperties.date)
          return task.transientProperties.date <= DateService.getTodayYYYYMMDD();
      };

      scope.taskHasDate = function taskHasDate(task) {
        return task.transientProperties && task.transientProperties.date;
      };

      scope.openPikaDayAndScroll = function openPikaDayAndScroll() {
       scope.openSnooze.pikaday.isVisible = true;
       if (angular.isFunction(scope.scrollToElementFn)) scope.scrollToElementFn();
     };
   }
 };
}
snoozeDirective['$inject'] = ['DateService'];
angular.module('em.tasks').directive('snooze', snoozeDirective);
