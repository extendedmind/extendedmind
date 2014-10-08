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
    require: '^?editableFieldBackdrop',
    controller: function($scope, $element, $attrs) {
      var undisableBackdrop = false;
      var backdropWasDisabled = false;
      function doShowBackdrop() {
        $element.addClass('active');
        if (undisableBackdrop && $scope.undisableBackdrop) backdropWasDisabled = $scope.undisableBackdrop();
        if ($scope.showBackdrop) $scope.showBackdrop();
      }
      $element.addClass('editable-field-container');

      this.showBackdrop = function showBackdrop() {
        doShowBackdrop();
      };

      this.hideBackdrop = function hideBackdrop() {
        if ($attrs.editableFieldContainer !== 'auto') {
          $element.removeClass('active');
          if (backdropWasDisabled) $scope.disableBackdrop();
          $scope.hideBackdrop();
        }
      };

      if ($attrs.editableFieldContainer === 'auto') {
        if ($scope.disableBackdrop) $scope.disableBackdrop();
        doShowBackdrop();
      } else if ($attrs.editableFieldContainer === 'disable') {
        $scope.disableBackdrop();
      } else {
        undisableBackdrop = true;
      }

      $scope.$on('$destroy', function() {
        if ($scope.hideBackdrop) $scope.hideBackdrop();
      });
    },
    link: function postLink(scope, element, attrs, backdropController) {
      function clickedContainer() {
        if (backdropController) backdropController.setEditableFieldClicked(element[0]);
      }

      if (attrs.editableFieldContainer === 'auto' && backdropController) {
        var clickElsewhereFn;
        if (attrs.editableFieldContainerClickElsewhere)
          clickElsewhereFn = $parse(attrs.editableFieldContainerClickElsewhere).bind(undefined, scope);

        backdropController.registerClickElsewhere(element[0], clickElsewhereFn);
        element[0].addEventListener('click', clickedContainer, false);
      }

      scope.$on('$destroy', function() {
        if (attrs.editableFieldContainer === 'auto' && backdropController) {
          element[0].removeEventListener('click', clickedContainer, false);
          backdropController.unregisterClickElsewhere(element[0]);
        }
      });
    }
  };
}
editableFieldContainerDirective['$inject'] = ['$parse'];
angular.module('common').directive('editableFieldContainer', editableFieldContainerDirective);
