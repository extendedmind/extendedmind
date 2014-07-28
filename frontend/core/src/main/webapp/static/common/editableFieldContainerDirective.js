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

 function editableFieldContainerDirective() {
  return {
    restrict: 'A',
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
    }
  };
}
angular.module('common').directive('editableFieldContainer', editableFieldContainerDirective);
