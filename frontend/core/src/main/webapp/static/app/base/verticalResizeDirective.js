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
    controller: function($scope, $element, $attrs) {

      var maxHeightWithoutKeyboard;
      var overrideElement;
      var isPrevented = $parse($attrs.verticalResizePrevent).bind(undefined, $scope);

      function setMaxHeight(){
        var referenceMaxHeight = $rootScope.MAX_HEIGHT;
        if ($rootScope.currentHeight < $rootScope.MAX_HEIGHT) {
          referenceMaxHeight = $rootScope.currentHeight;
        }
        if (referenceMaxHeight !== maxHeightWithoutKeyboard){
          // Hide footer under keyboard
          maxHeightWithoutKeyboard = referenceMaxHeight;
          $element[0].style.maxHeight = referenceMaxHeight + 'px';
        }

        if (overrideElement){
          maxHeightWithoutKeyboard =
          referenceMaxHeight - $rootScope.TOOLBAR_HEIGHT - $rootScope.LIST_FOOTER_HEIGHT;
          overrideElement[0].style.maxHeight = maxHeightWithoutKeyboard;
        }
      }

      this.overrideVerticalResize = function(elem) {
        overrideElement = elem;
        setMaxHeight();
      };
      this.clearOverrideElement = function() {
        overrideElement = undefined;
        setMaxHeight();
      };

      if (angular.isFunction($scope.registerWindowResizedCallback)) {
        $scope.registerWindowResizedCallback(setMaxHeight, 'verticalResizeDirective' + '-' +
                                             $attrs.verticalResize);
      }
      setMaxHeight();

      function doVerticalResize(newHeight, oldHeight) {
        if (isPrevented()) {
          // do nothing in attrs.verticalResize
          return;
        }
        if (newHeight || oldHeight) {

          var resizeElement = $element;

          if (overrideElement)
            resizeElement = overrideElement;

          if (newHeight) {
            if ($attrs.verticalResizeHideFooter){
              setTimeout(function() {
                resizeElement[0].style.maxHeight = (maxHeightWithoutKeyboard + $rootScope.LIST_FOOTER_HEIGHT -
                                                    newHeight) + 'px';
              }, 0);
            }else {
              setTimeout(function() {
                resizeElement[0].style.maxHeight = (maxHeightWithoutKeyboard  - newHeight) + 'px';
              }, 0);
            }
          }
          else{
            resizeElement[0].style.maxHeight = maxHeightWithoutKeyboard  + 'px';
            // If scrollTop is below scrollHeight, set it to the bottom
            if (resizeElement[0].scrollTop > resizeElement[0].scrollHeight)
              resizeElement[0].scrollTop = resizeElement[0].scrollHeight;
          }
        }
      }
      $scope.$watch('softKeyboard.height', doVerticalResize);
    }
  };
}
verticalResizeDirective['$inject'] = ['$parse', '$rootScope'];
angular.module('em.base').directive('verticalResize', verticalResizeDirective);
