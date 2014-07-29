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

 function omnibarInputDirective() {
  return {
    restrict: 'A',
    link: function postLink(scope, element) {
      omnibarInputFocus();

      scope.registerOmnibarInputFocusCallback(omnibarInputFocus);
      function omnibarInputFocus() {
        element[0].focus();
      }
    }
  };
}
angular.module('em.directives').directive('omnibarInput', omnibarInputDirective);
