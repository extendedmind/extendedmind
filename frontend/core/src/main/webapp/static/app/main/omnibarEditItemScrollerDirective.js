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

 function omnibarEditItemScrollerDirective($parse, $timeout) {
  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {
      var omnibarEditItemScroller, omnibarEditItemScrollerTimer;
      var setActiveSlideFn = $parse(attrs.omnibarEditItemScroller);
      var registerGotoEditItemScrollerSlideFn = $parse(attrs.omnibarEditItemScrollerGotoSlideFn);
      var setEditItemHasScrollerHasIndicatorsFn = $parse(attrs.omnibarEditItemScrollerHasIndicatorsFn);

      registerGotoEditItemScrollerSlideFn(scope, {gotoSlideFn: gotoSlide});
      function gotoSlide(slideIndex) {
        omnibarEditItemScroller.goToPage(slideIndex, 0);
      }

      omnibarEditItemScroller = new IScroll(element[0], {
        snap: true,
        eventPassthrough: true,
        scrollX: true,
        scrollY: false,
        preventDefault: false,
        disableMouse: true
      });

      omnibarEditItemScroller.on('scrollEnd', function() {
        scope.$apply(function() {
          setActiveSlideFn(scope, {slideIndex: omnibarEditItemScroller.currentPage.pageX});
        });
      });

      setEditItemHasScrollerHasIndicatorsFn(scope, {hasIndicators: true});

      scope.$on('$destroy', function() {
        setActiveSlideFn(scope, {slideIndex: 0});
        setEditItemHasScrollerHasIndicatorsFn(scope, {hasIndicators: false});
        omnibarEditItemScroller.destroy();
        $timeout.cancel(omnibarEditItemScrollerTimer);
        omnibarEditItemScroller = null;
      });
    }
  };
}
omnibarEditItemScrollerDirective['$inject'] = ['$parse', '$timeout'];
angular.module('em.directives').directive('omnibarEditItemScroller', omnibarEditItemScrollerDirective);
