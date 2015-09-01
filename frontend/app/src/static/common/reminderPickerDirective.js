/* Copyright 2013-2015 Extended Mind Technologies Oy
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

 function reminderPickerDirective() {
  return {
    restrict: 'A',
    require: 'ngModel', // get a hold of NgModelController
    scope: {
      getOptions: '&reminderPicker'
    },
    link: function(scope, element, attrs, ngModel) {
      if (ngModel.$formatters && ngModel.$formatters.length) {
        // Clear formatters. Otherwise Angular will throw 'numfmt' exception.
        // https://docs.angularjs.org/error/ngModel/numfmt
        ngModel.$formatters = [];
      }

      var options = scope.getOptions();
      var maxValue = options.limit;
      var minValue = options.bottomLimit;

      function isNull(viewValue) {
        if (viewValue === null) {
          return;
        }
        return viewValue;
      }

      function isInteger(viewValue) {
        var currentValue;

        // http://stackoverflow.com/a/3886106
        if (viewValue % 1 !== 0) {
          currentValue = ngModel.$modelValue;
          ngModel.$setViewValue(currentValue);
          ngModel.$render();
          return currentValue;
        }
        return viewValue;
      }

      function isTooLong(viewValue) {
        var currentValue;

        if (!options.padOneDigit && viewValue < 10 && viewValue.length > 1) {
          currentValue = ngModel.$modelValue;
          ngModel.$setViewValue(currentValue);
          ngModel.$render();
          return currentValue;
        } else if (viewValue.length > 2) {
          currentValue = ngModel.$modelValue;
          if (currentValue !== undefined && currentValue !== null) {
            if (viewValue.charAt(0) === '0') {
              currentValue = '0' + currentValue.toString();
            }
          }
          ngModel.$setViewValue(currentValue);
          ngModel.$render();
          return currentValue;
        }
        return viewValue;
      }

      function isTooBig(viewValue) {
        var currentValue;
        var viewValueInt = parseInt(viewValue);

        if (viewValueInt > maxValue) {
          currentValue = ngModel.$modelValue;
          ngModel.$setViewValue(currentValue);
          ngModel.$render();
          return currentValue;
        }
        return viewValue;
      }

      function isTooSmall(viewValue) {
        var currentValue;
        var viewValueInt = parseInt(viewValue);

        if (viewValueInt < minValue) {
          currentValue = ngModel.$modelValue;
          ngModel.$setViewValue(currentValue);
          ngModel.$render();
          return currentValue;
        }
        return viewValue;
      }

      function hasOneDigit(viewValue) {
        if (viewValue.length === 1) {
          padOneDigitInput();
        }
        return viewValue;
      }

      /*
      * Pad one digit to two digits debounced.
      */
      var padOneDigitInput = function() {
        if (document.activeElement === element[0]) {
          var currentValue = ngModel.$modelValue;
          if (currentValue !== undefined && currentValue !== null && currentValue.toString().length === 1) {
            var newValue = '0' + currentValue.toString();
            ngModel.$setViewValue(newValue);
            ngModel.$render();
            return newValue;
          }
        }
      }.debounce(3000);

      function padValidInput() {
        if (ngModel.$valid) {
          var value = element[0].value;
          if (value === '') {
            element[0].value = options.padOneDigit ? '00' : 0;
          } else if (value && value.length === 1 && options.padOneDigit) {
            element[0].value = '0' + value.toString();
          }
        }
      }

      if (options.padOneDigit) {
        ngModel.$parsers.unshift(isNull, isInteger, isTooLong, isTooBig, hasOneDigit);
      } else {
        ngModel.$parsers.unshift(isNull, isInteger, isTooLong, isTooBig, isTooSmall);
      }
      element[0].addEventListener('blur', padValidInput);

    }
  };
}
angular.module('common').directive('reminderPicker', reminderPickerDirective);
