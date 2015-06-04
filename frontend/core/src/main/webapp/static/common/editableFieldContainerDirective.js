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

 function editableFieldContainerDirective($parse, $rootScope) {
  return {
    restrict: 'A',
    scope: true,
    require: '^editableFieldBackdrop',
    controller: ['$scope', function($scope) {

      this.notifyFocus = function() {
        if (!$scope.containerActive){
          // activate on focus
          $scope.activateContainer();
        }
        if ($scope.unFocusCallback){
          $scope.unFocusCallback();
        }
      };
      this.notifyReFocus = function(unFocusFn) {
        $scope.unFocusCallback = unFocusFn;
      };
      this.deactivateContainer = function(){
        // deactivate and call click elsewhere
        $scope.deactivateContainer();
      };
    }],
    link: function (scope, element, attrs, backdropController) {
      element.addClass('editable-field-container');

      scope.containerActive = false;
      function clickedContainer() {
        if (attrs.editableFieldContainerScrollable) {
          // Scrollable editable field container has height: 100% so when it does not have enough content to
          // be scrollable, container click may hit into area where is no content.
          var targetElement = event.target;
          if (targetElement === element[0] || targetElement === element[0].firstElementChild) {
            // Clicked on non-scrollable content. Do not notify about container click.
            return;
          }
        }
        backdropController.notifyContainerClicked(element[0]);
      }

      scope.activateContainer = function() {
        if (!scope.containerActive){
          backdropController.activateContainer(element[0], attrs.editableFieldContainerBlur !== undefined);
          element[0].addEventListener('click', clickedContainer, false);
          element.addClass('active');
          scope.containerActive = true;
          if (attrs.editableFieldContainerScrollable) {
            element.addClass('scrollable');
          }
        }
      };

      scope.deactivateContainer = function() {
        if (scope.containerActive){
          backdropController.deactivateContainer(element[0]);
          element[0].removeEventListener('click', clickedContainer, false);
          element.removeClass('active');
          scope.containerActive = false;
          if (scope.unFocusCallback){
            scope.unFocusCallback();
            scope.unFocusCallback = undefined;
          }
          if (attrs.editableFieldContainerScrollable) {
            element.removeClass('scrollable');
          }

          if (typeof deactivateCallback === 'function') {
            // NOTE: use $apply because callback may not be inside scope.
            if (!scope.$$phase && !$rootScope.$$phase) scope.$apply(deactivateCallback);
            else deactivateCallback();
          }
        }
      };

      function onContainerDestroy() {
        if (scope.containerActive) {
          backdropController.deactivateContainer(element[0]);
          element[0].removeEventListener('click', clickedContainer, false);
          element.removeClass('active');
          if (attrs.editableFieldContainerScrollable) {
            element.removeClass('scrollable');
          }
          scope.unFocusCallback = undefined;
        }
        backdropController.unregisterContainer(element[0]);
      }

      // optional click elsewhere function can be set with editable-field-container-click-elswhere="fn"
      // If not set, clicking elsewhere just deactivates the backdrop
      var deactivateCallback;
      if (attrs.editableFieldContainerClickedElsewhere){
        deactivateCallback = $parse(attrs.editableFieldContainerClickedElsewhere).bind(undefined, scope);
      }

      backdropController.registerContainer(element[0], scope.deactivateContainer);

      if (attrs.editableFieldContainer === 'auto') {
        // Activate immediately for "auto" type container
        scope.activateContainer();
      }

      scope.$on('$destroy', onContainerDestroy);
    }
  };
}
editableFieldContainerDirective['$inject'] = ['$parse', '$rootScope'];
angular.module('common').directive('editableFieldContainer', editableFieldContainerDirective);
