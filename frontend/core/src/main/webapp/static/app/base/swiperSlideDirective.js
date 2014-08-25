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

 function swiperSlideDirective() {
  return {
    restrict: 'A',
    // All relevant business logic is in the container, which is
    // injected into the link with require. ^ means search for parent
    // elements for direcitive.
    require: '^swiperContainer',
    scope: {
      slidePath: '@swiperSlide',
      slideIndex: '='
    },
    link: function postLink(scope, element, attrs, swiperContainerDirectiveController) {
      swiperContainerDirectiveController.registerSlide(scope.slidePath, element, scope.slideIndex);
      scope.$on('$destroy', function() {
        swiperContainerDirectiveController.unregisterSlide(scope.slidePath);
      });
    }
  };
}
angular.module('em.base').directive('swiperSlide', swiperSlideDirective);
