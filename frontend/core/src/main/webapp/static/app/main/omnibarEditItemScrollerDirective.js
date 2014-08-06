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

 function omnibarEditItemScrollerDirective($timeout) {
  return {
    restrict: 'A',
    link: function postLink(scope, element) {
      var omnibarEditItemScroller, omnibarEditItemScrollerTimer;

      omnibarEditItemScroller = new IScroll(element[0], {
        snap: true,
        eventPassthrough: true,
        scrollX: true,
        scrollY: false,
        preventDefault: false,
        indicators: {
          el: document.getElementById('omnibar-edit-item-scroller-indicator'),
          resize: false
        }
      });
      scope.setEditItemHasScrollerIndicators(true);

      omnibarEditItemScrollerTimer = $timeout(function() {
        omnibarEditItemScroller.refresh();
      }, 500);

      scope.$on('$destroy', function() {
        scope.setEditItemHasScrollerIndicators(false);
        omnibarEditItemScroller.destroy();
        $timeout.cancel(omnibarEditItemScrollerTimer);
        omnibarEditItemScroller = null;
      });
    }
  };
}
omnibarEditItemScrollerDirective['$inject'] = ['$timeout'];
angular.module('em.directives').directive('omnibarEditItemScroller', omnibarEditItemScrollerDirective);
