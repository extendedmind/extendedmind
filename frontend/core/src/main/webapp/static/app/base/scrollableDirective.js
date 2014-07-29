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

 /* global IScroll */
 'use strict';

 function scrollableDirective($timeout) {
  return {
    restrict: 'A',
    link: function postLink(scope, element) {
      var scroller;

      function delayedRefreshScroller() {
        if (scroller) {
          $timeout(function() {
            scroller.refresh();
          }, 200);
        }
      }
      scope.refreshScroller = function refreshScroller() {
        delayedRefreshScroller();
      };
      scroller = new IScroll(element[0], {
        deceleration: 0.006,
        mouseWheel: true
      });
      delayedRefreshScroller();

      scope.$on('$destroy', function() {
        scroller.destroy();
        scroller = null;
      });
    }
  };
}
scrollableDirective['$inject'] = ['$timeout'];
angular.module('em.directives').directive('scrollable', scrollableDirective);
