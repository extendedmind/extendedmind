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

 function inputModelValidatorDirective() {
  return {
    restrict: 'A',
    require: 'ngModel', // get a hold of NgModelController
    link: function(scope, element, _, ngModel) {

      /*
      * Validate non-whitespace model value string.
      */
      ngModel.$validators.validNonWhiteSpaceString = function(modelValue, viewValue) {
        var value = modelValue || viewValue;
        return value && value.trim() !== '';
      };

      // Cancel an update and reset the input element's value to prevent an update to the $modelValue.
      element[0].addEventListener('blur', ngModel.$rollbackViewValue);
    }
  };
}
angular.module('common').directive('inputModelValidator', inputModelValidatorDirective);
