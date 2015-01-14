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

      // Prevent horizontal when going up/down to prevent flickering
      element[0].addEventListener('touchstart', slideTouchStart, false);
      element[0].addEventListener('touchmove', slideTouchMove, false);
      element[0].addEventListener('touchend', slideTouchEnd, false);
      element[0].addEventListener('scroll', slideScroll, false);

      // http://blogs.windows.com/windows_phone/b/wpdev/archive/2012/11/15/adapting-your-webkit-optimized-site-for-internet-explorer-10.aspx#step4
      if (window.navigator.msPointerEnabled) {
        element[0].addEventListener('MSPointerDown', slideTouchStart, false);
        element[0].addEventListener('MSPointerMove', slideTouchMove, false);
        element[0].addEventListener('MSPointerUp', slideTouchEnd, false);
      }

      var swipeStartX, swipeStartY, swipeDistX, swipeDistY;

      function slideTouchStart(event) {
        $rootScope.innerSwiping = false;
        if (event.type === 'touchstart') {
          swipeStartX = event.targetTouches[0].pageX;
          swipeStartY = event.targetTouches[0].pageY;
        } else {
          swipeStartX = event.pageX;
          swipeStartY = event.pageY;
        }
      }

      function slideTouchMove(event) {
        /*jshint validthis: true */
        if ($rootScope.backdropActive) {
          event.stopPropagation();
          event.stopImmediatePropagation();
          return;
        }

        if (event.type === 'touchmove') {
          swipeDistX = event.targetTouches[0].pageX - swipeStartX;
          swipeDistY = event.targetTouches[0].pageY - swipeStartY;
        } else {
          swipeDistX = event.pageX - swipeStartX;
          swipeDistY = event.pageY - swipeStartY;
        }

        // Determine swipe direction.
        if (Math.abs(swipeDistX) < Math.abs(swipeDistY)) { // vertical
          // Swiping up or down, prevent event from reaching Swiper
          event.stopPropagation();
          event.stopImmediatePropagation();
          $rootScope.innerSwiping = true;
        }
      }

      function slideTouchEnd() {
        if ($rootScope.innerswiping) {
          setTimeout(function() {
            // Clear flag.
            $rootScope.innerSwiping = false;
          }, 100);
        }
      }

      var scrollTimeout;
      function slideScroll() {
        $rootScope.scrolling = true;
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(function() {
          $rootScope.scrolling = false;
        }, 500);
        return false;
      }

      scope.$on('$destroy', function() {
        $rootScope.scrolling = false;
        $rootScope.innerSwiping = false;
        element[0].removeEventListener('touchstart', slideTouchStart, false);
        element[0].removeEventListener('touchmove', slideTouchMove, false);
        element[0].removeEventListener('scroll', slideScroll, false);

        if (window.navigator.msPointerEnabled) {
          element[0].removeEventListener('MSPointerDown', slideTouchStart, false);
          element[0].removeEventListener('MSPointerMove', slideTouchMove, false);
        }
      });
    }
  };
}
swiperPreventDirective['$inject'] = ['$rootScope'];
angular.module('em.base').directive('swiperPrevent', swiperPreventDirective);
