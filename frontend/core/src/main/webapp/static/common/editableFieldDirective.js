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

 function editableFieldDirective($animate) {
  return {
    require: '^editableFieldContainer',
    restrict: 'A',
    link: function($scope, $element, $attrs, editableFieldContainerDirectiveController) {
      $element.addClass('editable-field');

      var editableFieldFocus = function() {
        $animate.addClass($element[0], 'active');
        editableFieldContainerDirectiveController.showBackdrop();
      };
      var editableFieldBlur = function() {
        $animate.removeClass($element[0], 'active');
        editableFieldContainerDirectiveController.hideBackdrop();
      };

      angular.element($element).bind('focus', editableFieldFocus);
      angular.element($element).bind('blur', editableFieldBlur);

      $scope.$on('$destroy', function() {
        angular.element($element).unbind('focus', editableFieldFocus);
        angular.element($element).unbind('blur', editableFieldBlur);
      });
    }
  };
}
editableFieldDirective['$inject'] = ['$animate'];
angular.module('common').directive('editableField', editableFieldDirective);
