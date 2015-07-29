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

 function iconCheckboxDirective() {
  return {
    restrict: 'A',
    scope: {
      checkboxId: '=iconCheckbox'
    },
    link: function (scope, element) {
      element.addClass('icon-checkbox-input');
      element[0].id = scope.checkboxId ? scope.checkboxId : 'iconCheckbox';
      // Create label and set it after the input element
      var checkboxLabel = document.createElement('label');
      checkboxLabel.setAttribute('for', element[0].id);
      element[0].parentNode.insertBefore(checkboxLabel, element[0].nextSibling);
    }
  };
}
angular.module('common').directive('iconCheckbox', iconCheckboxDirective);
