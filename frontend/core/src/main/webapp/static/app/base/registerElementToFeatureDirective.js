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

 function registerElementToFeatureDirective() {
  return {
    restrict: 'A',
    require: '^featureContainer',
    link: function postLink(scope, element, attrs, featureContainerController) {
      var scopeDestroyCallbackFn;

      if (attrs.registerElementToFeatureSwiper) {
        featureContainerController.registerSwiperElement(attrs.registerElementToFeature, element[0]);
        scopeDestroyCallbackFn = function scopeDestroy() {
          featureContainerController.unregisterSwiperElement(attrs.registerElementToFeature);
        };
      }

      else if (attrs.registerElementToFeatureSnap) {
        featureContainerController.registerSnapDrawerDragElement(attrs.registerElementToFeature, element[0], attrs.registerElementToFeatureSnap);
        scopeDestroyCallbackFn = function scopeDestroy() {
          featureContainerController.unregisterSnapDrawerDragElement(attrs.registerElementToFeature, attrs.registerElementToFeatureSnap);
        };
      }

      scope.$on('$destroy', function() {
        if (typeof scopeDestroyCallbackFn === 'function') scopeDestroyCallbackFn();
      });
    }
  };
}
angular.module('em.base').directive('registerElementToFeature', registerElementToFeatureDirective);
