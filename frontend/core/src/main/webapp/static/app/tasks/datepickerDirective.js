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

 function datepickerDirective($q) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'static/app/tasks/datepicker.html',
    link: function postLink(scope, element) {
      var scroller = new IScroll(element[0], {
        snap: true,
        momentum: false,
        scrollX: true
      });
      goToMiddlePage();

      scroller.on('scrollEnd', scrollEnd);
      function scrollEnd() {
        if (scroller.currentPage.pageX === 0) {
          scope.changeActiveWeek('prev', goToMiddlePage);
        }
        else if (scroller.currentPage.pageX === scroller.pages.length - 1) {
          scope.changeActiveWeek('next', goToMiddlePage);
        }
      }

      function goToMiddlePage() {
        // http://iscrolljs.com/#snap
        // x = 1, y = 0, time = 0, easing = 0
        return $q.when(scroller.goToPage(1, 0, 0, 0));
      }

      scope.$on('$destroy', function() {
        scroller.destroy();
        scroller = null;
      });
    }
  };
}
datepickerDirective['$inject'] = ['$q'];
angular.module('em.directives').directive('datepicker', datepickerDirective);
