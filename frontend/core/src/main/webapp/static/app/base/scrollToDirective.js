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

 function scrollToDirective() {
  return {
    restrict: 'A',
    link: function postLink(scope, element) {
      var scrollToContainer = element;

      // http://stackoverflow.com/a/2906009
      scope.scrollToElement = function scrollToElement(targetElement) {
        scrollToContainer.animate({
          scrollTop: targetElement.offset().top - scrollToContainer.offset().top + scrollToContainer.scrollTop()
        }, 450);
      };
    }
  };
}
angular.module('em.directives').directive('scrollTo', scrollToDirective);
