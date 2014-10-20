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

 function verticalResizeDirective($parse, $rootScope) {
  return {
    restrict: 'A',
    controller: function($scope) {
      this.overrideVerticalResize = function(element) {
        $scope.overrideElement = element;
      };
      this.clearOverrideElement = function() {
        $scope.overrideElement = undefined;
      };
    },
    link: function postLink(scope, element, attrs) {
      var maxHeightWithoutKeyboard;

      var isPrevented = $parse(attrs.verticalResizePrevent).bind(undefined, scope);

      function windowResized(){
        if (isPrevented()) {
          // do nothing in attrs.verticalResize
          return;
        }
        if ($rootScope.currentHeight > $rootScope.MAX_HEIGHT) {
          element[0].style.maxHeight = $rootScope.MAX_HEIGHT + 'px';
          maxHeightWithoutKeyboard = $rootScope.MAX_HEIGHT;
        } else {
          element[0].style.maxHeight = $rootScope.currentHeight + 'px';
          maxHeightWithoutKeyboard = $rootScope.currentHeight;
        }
      }
      if (angular.isFunction(scope.registerWindowResizedCallback)) {
        scope.registerWindowResizedCallback(windowResized, 'verticalResizeDirective' + '-' +
                                            attrs.verticalResize);
      }
      windowResized();

      function doVerticalResize(newHeight, oldHeight) {
        if (isPrevented()) {
          // do nothing in attrs.verticalResize
          return;
        }
        if (newHeight || oldHeight) {

          var resizeElement = element;

          if (scope.overrideElement)
            resizeElement = scope.overrideElement;

          if (newHeight) {
            resizeElement[0].style.maxHeight = (maxHeightWithoutKeyboard - newHeight) + 'px';
          }
          else resizeElement[0].style.maxHeight = maxHeightWithoutKeyboard  + 'px';
        }
      }

      scope.$watch('softKeyboard.height', doVerticalResize);
    }
  };
}
verticalResizeDirective['$inject'] = ['$parse', '$rootScope'];
angular.module('em.base').directive('verticalResize', verticalResizeDirective);
