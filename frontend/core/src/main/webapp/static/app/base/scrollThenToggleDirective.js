/* Copyright 2013-2015 Extended Mind Technologies Oy
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

 function scrollThenToggleDirective($parse) {
  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {

      function getTopElementBottomPosition() {
        return topElement.offsetHeight + topElement.offsetTop;
      }

      var topElement = document.getElementById(attrs.scrollThenToggleTop);
      var topElementBottomPosition = getTopElementBottomPosition();

      if (attrs.scrollThenToggleReset) $parse(attrs.scrollThenToggleReset)(scope)(scrollToTop);

      if (attrs.scrollThenToggleResizeable) {
        scope.$on('elastic:resize', function(event, element) {
          if (element[0].id === attrs.scrollThenToggleResizeable) {
            topElementBottomPosition = getTopElementBottomPosition();
          }
        });
      }

      function scrollToTop() {
        element[0].scrollTop = 0;
      }

      var toggleElement = document.getElementById(attrs.scrollThenToggle);
      var toggleElementVisible;  // Cache element visiblity info.

      function scroll() {
        /* jshint validthis: true */

        // Element.scrollTop does not cause reflow.
        if (this.scrollTop <= topElementBottomPosition && toggleElementVisible) {
          // Top element is visible, hide toggle element.
          toggleElement.classList.remove('show-sticky');
          toggleElementVisible = false;
        } else if (this.scrollTop > topElementBottomPosition && !toggleElementVisible) {
          // Top element hidden, show toggle element.
          toggleElement.classList.add('show-sticky');
          toggleElementVisible = true;
        }
      }

      element[0].addEventListener('scroll', scroll, false);
    }
  };
}
scrollThenToggleDirective['$inject'] = ['$parse'];
angular.module('em.base').directive('scrollThenToggle', scrollThenToggleDirective);
