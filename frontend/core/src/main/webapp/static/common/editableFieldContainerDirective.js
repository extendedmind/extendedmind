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

 function editableFieldContainerDirective($parse) {
  return {
    restrict: 'A',
    scope: true,
    require: '^editableFieldBackdrop',
    controller: function($scope, $element, $attrs) {
      this.notifyFocus = function() {
        if ($attrs.editableFieldContainer !== 'auto'){
          // activate on focus
          $scope.activateContainer();
        }
      };
      this.notifyBlur = function(reFocusFn) {
        if ($scope.notifyLatestBlur){
          $scope.notifyLatestBlur(reFocusFn)
        }
      };
      this.deactivateContainer = function(){
        // deactivate and call click elsewhere
        $scope.deactivateContainer(true);
      }
    },
    link: function (scope, element, attrs, backdropController) {
      element.addClass('editable-field-container');

      var listeningToClick = false;
      function clickedContainer() {
        backdropController.notifyContainerClicked(element[0]);
      }

      scope.activateContainer = function() {
        if (!listeningToClick){
          backdropController.activateContainer(element[0]);
          element[0].addEventListener('click', clickedContainer, false);
          element.addClass('active');
          listeningToClick = true;
        }
      }

      scope.deactivateContainer = function(callClickElsewhere) {
        if (listeningToClick){
          backdropController.deactivateContainer(element[0]);
          element[0].removeEventListener('click', clickedContainer, false);
          element.removeClass('active');
          listeningToClick = false;
          if (callClickElsewhere && clickedElsewhereFn){
            // Call click elsewhere also on direct deactivation
            clickedElsewhereFn();
          }
        }
      }

      // optional click elsewhere function can be set with editable-field-container-click-elswhere="fn"
      // If not set, clicking elsewhere just deactivates the backdrop
      var clickedElsewhereFn;
      if (attrs.editableFieldContainerClickedElsewhere){
        clickedElsewhereFn = $parse(attrs.editableFieldContainerClickedElsewhere).bind(undefined, scope);
      }

      backdropController.registerContainer(element[0], scope.deactivateContainer, clickedElsewhereFn);

      if (attrs.editableFieldContainer === 'auto') {
        // Activate immediately for "auto" type container
        scope.activateContainer();
      }

      if (attrs.editableFieldContainer === 'active') {
        // Set active class permanately
        element.addClass('active');
      }


      scope.$on('$destroy', function() {
        if (listeningToClick) {
          scope.deactivateContainer();
        }
        backdropController.unregisterContainer(element[0]);
      });
    }
  };
}
editableFieldContainerDirective['$inject'] = ['$parse'];
angular.module('common').directive('editableFieldContainer', editableFieldContainerDirective);
