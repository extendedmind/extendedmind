/* global Pikaday */

'use strict';
function pikadayDirective(DateService) {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      var startingDate;
      if (attrs.defaultDate) startingDate = DateService.getDateTodayOrFromLaterYYYYMMDD(attrs.defaultDate);

      function getPikadayDateAndSetToTaskDate() {
        var date = pikaday.getDate();
        scope.task.date = DateService.getYYYYMMDD(date);
      }

      var pikaday = new Pikaday({
        field: elem[0],
        container: elem[0],
        bound: attrs.bound !== 'false',
        format: attrs.format || 'ddd MMM D YYYY',
        defaultDate: startingDate,
        setDefaultDate: attrs.setDefaultDate === 'true',
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
        showMonthAfterYear: attrs.showMonthAfterYear === 'true',
        onSelect: scope.openSnooze.pikaday.hasDoneButton ? undefined : getPikadayDateAndSetToTaskDate
      });

      scope.pikadayEditDone = function pikadayEditDone() {
        getPikadayDateAndSetToTaskDate();
        scope.savePikaday(scope.task);
      };
    }
  };
}
pikadayDirective['$inject'] = ['DateService'];
angular.module('common').directive('pikaday', pikadayDirective);
