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

 function scrollThenToggleDirective() {
  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {
      var topElement = document.getElementById(attrs.scrollThenToggleTop);
      var topElementHeight = topElement.offsetHeight;

      if (attrs.scrollThenToggleResizeable) {
        scope.$on('elastic:resize', function(event, element) {
          if (element[0].id === attrs.scrollThenToggleResizeable) {
            topElementHeight = topElement.offsetHeight;
          }
        });
      }

      var toggleElement = document.getElementById(attrs.scrollThenToggle);
      var toggleElementVisible;  // Cache element visiblity info.

      function scroll() {
        /* jshint validthis: true */

        // Element.scrollTop does not cause reflow.
        if (this.scrollTop < topElementHeight && toggleElementVisible) {
          // Top element is visible, hide toggle element.
          toggleElement.classList.toggle('show-sticky', false);
          toggleElementVisible = false;
        } else if (this.scrollTop >= topElementHeight && !toggleElementVisible) {
          // Top element hidden, show toggle element.
          toggleElement.classList.toggle('show-sticky', true);
          toggleElementVisible = true;
        }
      }

      element[0].addEventListener('scroll', scroll, false);
    }
  };
}
angular.module('em.base').directive('scrollThenToggle', scrollThenToggleDirective);
