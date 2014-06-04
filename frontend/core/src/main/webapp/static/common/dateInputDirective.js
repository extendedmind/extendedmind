'use strict';

function dateInputDirective() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {

      // http://ruoyusun.com/2013/08/24/a-glimpse-of-angularjs-scope-via-example.html
      scope.$watch(attrs.dateInput, function(newValue) {
        if (newValue) {
          if (!scope.task.date) {
            scope.$evalAsync(function() {
              element[0].focus();
              element[0].value = new Date().toISOString().substring(0, 10);
            });
          } else if (attrs.dateInputSetFocus) {
            scope.$evalAsync(function() {
              element[0].focus();
            });
          }
        }
      });

      var initialDate = scope.task.date;

      scope.hideDateInput = function hideDateInput() {
        if (attrs.dateInputSetFocus) {
          scope.openSnooze.showPickDate = false;
          if (initialDate !== scope.task.date) {
            scope.closeAndCall(scope.task, scope.taskQuickEditDone);
          }
        }
        else if (!scope.task.date) {
          scope.hideDate();
        }
      };
    }
  };
}
angular.module('common').directive('dateInput', dateInputDirective);
