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
    link: function($scope, $element, $attrs, ngModel) {
      if (ngModel.$formatters && ngModel.$formatters.length) ngModel.$formatters = [];
    }
  };
}
angular.module('common').directive('leadingZero', leadingZeroDirective);
