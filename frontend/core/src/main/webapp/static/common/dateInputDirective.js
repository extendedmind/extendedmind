'use strict';

function dateInputDirective() {
  return {
    restrict: 'A',
    scope: {
      task: '=dateInput',
      isFocused: '=dateInputSetFocus',
      blurDateFn: '=dateInputBlur'
    },
    link: function(scope, element) {
      function unfocusDate() {
        if (angular.isFunction(scope.blurDateFn)) scope.blurDateFn();
        else scope.isFocused = false;
      }

      function dateInputBlurred() {
        if (!scope.task.date) {
          scope.$evalAsync(function() {
            unfocusDate();
          });
        }
      }
      element.bind('blur', dateInputBlurred);

      // http://ruoyusun.com/2013/08/24/a-glimpse-of-angularjs-scope-via-example.html
      scope.$watch('isFocused', function(newValue) {
        if (newValue) {
          if (!scope.task.date) {
            scope.task.date = new Date().toISOString().substring(0, 10);
            element[0].value = new Date().toISOString().substring(0, 10);
          }

          scope.$evalAsync(function() {
            element[0].focus();
          });
        }
      });

      scope.$on('$destroy', unfocusDate);
    }
  };
}
angular.module('common').directive('dateInput', dateInputDirective);
