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
      pikadayHasDoneButton: '=snoozePikadayHasDoneButton'
    },
    link: function(scope) {

      scope.openSnooze.pikaday = {
        isVisible: false,
        hasDoneButton: scope.pikadayHasDoneButton
      };

      function processClose(task){
        if (angular.isFunction(scope.closeAndCall)){
          scope.closeAndCall(task, scope.selectedFn);
        }else if (angular.isFunction(scope.selectedFn)){
          scope.selectedFn(task);
        }
        scope.openSnooze.isOpen = false;
      }

      function setTaskDateAndSave(task, dateSetterFn) {
        var startingDate = DateService.getDateTodayOrFromLaterYYYYMMDD(task.date);
        task.date = dateSetterFn(startingDate).getYYYYMMDD(startingDate);
        processClose(task);
      }

      scope.savePikaday = function savePikaday(task) {
        processClose(task);
      };

      scope.setDateToday = function setDateToday(task) {
        task.date = DateService.getTodayYYYYMMDD();
        processClose(task);
      };
      scope.setDateTomorrow = function setDateTomorrow(task) {
        task.date = DateService.getTomorrowYYYYMMDD();
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
        if (!task.date) return; // set date/snooze ng-swith-default value
        return task.date <= DateService.getTodayYYYYMMDD();
      };

      scope.taskHasDate = function taskHasDate(task) {
        return task.date;
      };
    }
  };
}
snoozeDirective['$inject'] = ['DateService'];
angular.module('em.directives').directive('snooze', snoozeDirective);
