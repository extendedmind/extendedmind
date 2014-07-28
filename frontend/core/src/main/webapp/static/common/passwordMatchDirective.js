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

// http://rogeralsing.com/2013/08/26/angularjs-directive-to-check-that-passwords-match-followup/
function passwordMatchDirective() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, control) {
      var checker = function () {
        //get the value of the first password
        var e1 = scope.$eval(attrs.ngModel);

        //get the value of the other password
        var e2 = scope.$eval(attrs.passwordMatch);
        return e1 == e2;
      };
      scope.$watch(checker, function (n) {
        //set the form control to valid if both
        //passwords are the same, else invalid
        control.$setValidity('unique', n);
      });
    }
  };
}
angular.module('common').directive('passwordMatch', passwordMatchDirective);
