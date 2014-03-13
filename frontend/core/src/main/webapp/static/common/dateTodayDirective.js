'use strict';

function dateTodayDirective() {
  return {
    restrict: 'A',
    link: function(scope, element) {
      if (!scope.task.date) {
        element[0].focus();
        element[0].value = new Date().toISOString().substring(0, 10);
      }
    }
  };
}
angular.module('common').directive('dateToday', dateTodayDirective);
