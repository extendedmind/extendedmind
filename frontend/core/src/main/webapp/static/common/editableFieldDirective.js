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

 function editableFieldDirective() {
  return {
    require: '^editableFieldContainer',
    restrict: 'A',
    link: function($scope, $element, $attrs, editableFieldContainerController) {
      $element.addClass('editable-field');

      var editableFieldFocus = function() {
        $element.addClass('active');
        editableFieldContainerController.notifyFocus();
      };
      var editableFieldBlur = function() {
        $element.removeClass('active');
      };
      var editableFieldKeydown = function(event){
        // ESC button
        if (event.keyCode === 27){
          editableFieldBlur();
          editableFieldContainerController.deactivateContainer();
        }
      };

      angular.element($element).bind('keydown', editableFieldKeydown);
      angular.element($element).bind('focus', editableFieldFocus);
      angular.element($element).bind('blur', editableFieldBlur);

      $scope.$on('$destroy', function() {
        angular.element($element).unbind('focus', editableFieldFocus);
        angular.element($element).unbind('blur', editableFieldBlur);
        angular.element($element).unbind('focus', editableFieldKeydown);
      });
    }
  };
}
angular.module('common').directive('editableField', editableFieldDirective);
