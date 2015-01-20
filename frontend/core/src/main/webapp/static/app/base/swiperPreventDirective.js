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

 function swiperPreventDirective($rootScope) {
  return {
    restrict: 'A',
    link: function postLink(scope, element) {

      element[0].addEventListener('touchstart', onTouchStart, false);
      element[0].addEventListener('touchmove', onTouchMove, false);
      element[0].addEventListener('touchend', onTouchEnd, false);

      // http://blogs.windows.com/windows_phone/b/wpdev/archive/2012/11/15/adapting-your-webkit-optimized-site-for-internet-explorer-10.aspx#step4
      if (window.navigator.msPointerEnabled) {
        element[0].addEventListener('MSPointerDown', onTouchStart, false);
        element[0].addEventListener('MSPointerMove', onTouchMove, false);
        element[0].addEventListener('MSPointerUp', onTouchEnd, false);
      }

      var touchStartX, touchStartY, touchDistanceX, touchDistanceY;

      // Touchmove boundary, beyond which a click will be cancelled. Same as FastClick.touchBoundary
      var touchBoundaryX = 10;
      var touchBoundaryY = 10;

      var moveUp = false;
      var moveDown = false;
      var moveLeft = false;
      var moveRight = false;

      function onTouchStart(event) {
        touchStartX = event.targetTouches[0].pageX || event.pageX;
        touchStartY = event.targetTouches[0].pageY || event.pageY;

        $rootScope.contentTouchMoved = false;
        moveLeft = false;
        moveRight = false;
        moveDown = false;
        moveUp = false;
      }

      function onTouchMove(event) {
        /*jshint validthis: true */

        touchDistanceX = (event.targetTouches[0].pageX || event.pageX) - touchStartX;
        touchDistanceY = (event.targetTouches[0].pageY || event.pageY) - touchStartY;

        // http://www.javascriptkit.com/javatutors/touchevents2.shtml
        if (Math.abs(touchDistanceX) >= touchBoundaryX &&
            Math.abs(touchDistanceY) <= touchBoundaryY)
        {
          // Horizontal move.
          if (touchDistanceX < 0) {
            moveLeft = true;
            moveRight = false;
          } else {
            moveLeft = false;
            moveRight = true;
          }
        } else if (Math.abs(touchDistanceY) >= touchBoundaryY &&
                   Math.abs(touchDistanceX) <= touchBoundaryX)
        {
          // Vertical move.
          if (touchDistanceY < 0) {
            moveDown = false;
            moveUp = true;
          } else {
            moveDown = true;
            moveUp = false;
          }
        }
      }

      function onTouchEnd() {
        if (moveUp || moveDown || moveLeft || moveRight) {
          // Moving in some direction.
          $rootScope.contentTouchMoved = true;
          setTimeout(function() {
            // Clear flag.
            $rootScope.contentTouchMoved = false;
          }, 100);
        }
      }

      scope.$on('$destroy', function() {
        $rootScope.contentTouchMoved = false;

        element[0].removeEventListener('touchstart', onTouchStart, false);
        element[0].removeEventListener('touchmove', onTouchMove, false);
        element[0].removeEventListener('touchend', onTouchEnd, false);

        if (window.navigator.msPointerEnabled) {
          element[0].removeEventListener('MSPointerDown', onTouchStart, false);
          element[0].removeEventListener('MSPointerMove', onTouchMove, false);
          element[0].removeEventListener('MSPointerUp', onTouchEnd, false);
        }
      });
    }
  };
}
swiperPreventDirective['$inject'] = ['$rootScope'];
angular.module('em.base').directive('swiperPrevent', swiperPreventDirective);
