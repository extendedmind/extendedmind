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

/**
 * @name
 * em.directives:swiperClick
 *
 * @summary
 * Wrapper directive for (mobile) clicks inside swiper.
 * Replace ng-click="expression" with this in DOM.
 *
 * @see
 * http://docs.angularjs.org/api/ng/directive/ngClick
 * angular.js ngClick directive source code
 * http://usejsdoc.org/#JSDoc3_Tag_Dictionary
 *
 * @description
 * Function bound to click is not called if swiper has set swiping flag to true.
 * This is needed because it seems that there is no way call e.g. event.preventClick()
 * and event.preventDefault() during swipe would also prevent scrolling and other important browser functions.
 */
 function swiperClickDirective($parse, $rootScope) {
  return {
    restrict: 'A',
    compile: function(element, attr) {
      var fn = $parse(attr.swiperClick);
      return function(scope, element) {
        element.on('click', function(event) {
          if (!$rootScope.outerSwiping && !$rootScope.innerSwiping && !$rootScope.scrolling) {
            scope.$apply(function() {
              fn(scope, {$event: event});
            });
          } else {
            event.preventDefault();
            $rootScope.outerSwiping = false;
            $rootScope.innerSwiping = false;
            $rootScope.scrolling = false;
          }
        });
      };
    }
  };
}
swiperClickDirective['$inject'] = ['$parse', '$rootScope'];
angular.module('em.base').directive('swiperClick', swiperClickDirective);
