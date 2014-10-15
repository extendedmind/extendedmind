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

 function editableFieldDirective($document) {
  return {
    require: '^editableFieldContainer',
    restrict: 'A',
    link: function($scope, $element, $attrs, editableFieldContainerController) {
      $element.addClass('editable-field');

      var refocusInProgress = false;
      function reFocusEditableField(){
        refocusInProgress = true;
        if ($document[0].activeElement !== $element[0]) $element[0].focus();
      }

      var unfocusInProgress = false;
      function unFocusEditableField(){
        unfocusInProgress = true;
        if ($document[0].activeElement === $element[0]) $element[0].blur();
      }

      var editableFieldClicked = function() {
        editableFieldContainerController.notifyFocus();
        reFocusEditableField();
      }

      var editableFieldFocus = function() {
        if (!refocusInProgress){
          editableFieldContainerController.notifyFocus();
          $element.addClass('active');
        }
        refocusInProgress = false;
      };

      var editableFieldBlur = function() {
        if ($attrs.editableField === 'sticky' && !unfocusInProgress){
          reFocusEditableField();
          editableFieldContainerController.notifyReFocus(unFocusEditableField);
        }else{
          $element.removeClass('active');
          unfocusInProgress = false;
        }
      };

      var editableFieldKeydown = function(event){
        // ESC button
        if (event.keyCode === 27){
          editableFieldBlur();
          editableFieldContainerController.deactivateContainer();
        }
      };

      angular.element($element).bind('focus', editableFieldFocus);
      angular.element($element).bind('blur', editableFieldBlur);
      angular.element($element).bind('keydown', editableFieldKeydown);
      if ($attrs.editableField === 'sticky')
        angular.element($element).bind('click', editableFieldClicked);


      $scope.$on('$destroy', function() {
        angular.element($element).unbind('focus', editableFieldFocus);
        angular.element($element).unbind('blur', editableFieldBlur);
        angular.element($element).unbind('keydown', editableFieldKeydown);
        if ($attrs.editableField === 'sticky')
          angular.element($element).bind('click', editableFieldClicked);
      });
    }
  };
}
editableFieldDirective['$inject'] = ['$document'];
angular.module('common').directive('editableField', editableFieldDirective);
