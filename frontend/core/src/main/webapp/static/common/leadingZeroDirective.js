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

 function leadingZeroDirective() {
  return {
    restrict: 'A',
    require: 'ngModel', // get a hold of NgModelController
    link: function(scope, element, attrs, ngModel) {
      if (ngModel.$formatters && ngModel.$formatters.length) {
        // Clear formatters. Otherwise Angular will throw 'numfmt' exception.
        // https://docs.angularjs.org/error/ngModel/numfmt
        ngModel.$formatters = [];
      }

      var maxValue = parseInt(attrs.leadingZero);

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

        if (viewValue.length > 2) {
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

      ngModel.$parsers.unshift(isNull, isInteger, isTooLong, isTooBig);
    }
  };
}
angular.module('common').directive('leadingZero', leadingZeroDirective);
