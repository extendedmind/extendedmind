'use strict';

function dateInputDirective() {
  return {
    restrict: 'A',
    link: function(scope, element) {

      if (!scope.task.date) {
        element[0].focus();
        element[0].value = new Date().toISOString().substring(0, 10);
      }

      function hideDateInput() {
        if (!scope.task.date) {
          scope.$apply(scope.hideDate());
        }
      }

      element[0].addEventListener('blur', hideDateInput, false);

      scope.$on('$destroy', function() {
        element[0].removeEventListener('blur', hideDateInput, false);
      });
    }
  };
}
angular.module('common').directive('dateInput', dateInputDirective);
