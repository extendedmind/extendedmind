/* Copyright 2013-2017 Extended Mind Technologies Oy
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

 // Deactivates editable field based on fired event
 function editableFieldDeactivateDirective() {
  return {
    require: '^editableFieldContainer',
    restrict: 'A',
    link: function(scope, element, attrs, editableFieldContainerController) {
      var clicked = function() {
        editableFieldContainerController.deactivateContainer();
      };

      // Defaults to deactivating 'click' event
      angular.element(element).bind('click', clicked);

      scope.$on('$destroy', function() {
        angular.element(element).unbind('click', clicked);
      });
    }
  };
}
angular.module('common').directive('editableFieldDeactivate', editableFieldDeactivateDirective);
