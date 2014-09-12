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

 function verticalResizeDirective($rootScope) {
  return {
    restrict: 'A',
    link: function postLink(scope, element) {
      var maxHeightWithoutKeyboard;
      function windowResized(){
        if ($rootScope.currentHeight > $rootScope.MAX_HEIGHT){
          element[0].style.maxHeight = $rootScope.MAX_HEIGHT + 'px';
          maxHeightWithoutKeyboard = $rootScope.MAX_HEIGHT;
        }else{
          element[0].style.maxHeight = $rootScope.currentHeight + 'px';
          maxHeightWithoutKeyboard = $rootScope.currentHeight;
        }
      }
      if (angular.isFunction(scope.registerWindowResizedCallback)){
        scope.registerWindowResizedCallback(windowResized, 'verticalResizeDirective');
      }
      windowResized();

      scope.$watch('softKeyboard.height', function(newValue) {
        if (newValue) {
          var originalOffsetTop = element[0].firstElementChild.offsetTop;

          // Animate
          element[0].style.webkitTransform = 'translate3d(0, -' + originalOffsetTop + 'px, 0)';

          // Delay changin
          setTimeout(function(){
            // Change directly
            element[0].style.position = 'relative';
            element[0].style.maxHeight = (maxHeightWithoutKeyboard - newValue) + 'px';

            var newOffsetTop = element[0].firstElementChild.offsetTop;
            element[0].style.top = '-' + (newOffsetTop - originalOffsetTop) + 'px';
          }, $rootScope.KEYBOARD_ANIMATION_TIME);
        } else {
          element[0].style.position = 'inherit';
          element[0].style.top = '0';
          element[0].style.maxHeight = maxHeightWithoutKeyboard  + 'px';
          element[0].style.webkitTransform = 'translate3d(0, 0, 0)';
        }
      });
    }
  };
}
verticalResizeDirective['$inject'] = ['$rootScope'];
angular.module('em.base').directive('verticalResize', verticalResizeDirective);
