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

 function swiperSlideDirective(SwiperService) {
  return {
    restrict: 'A',
    // All relevant business logic is in the container, which is
    // injected into the link with require. ^ means search for parent
    // elements for direcitive.
    require: '^swiperContainer',
    scope: {
      slidePath: '@swiperSlide',
      slideIndex: '=',
      duplicateSlide: '=?swiperSlideDuplicate',
      loopStart: '=?swiperSlideLoopStart'
    },
    controller: function($scope, $element){
      this.isSlideActiveByDefault = function(){
        if ($scope.slideIndex === 0 && !$scope.duplicateSlide) return true;
        if ($scope.slideIndex === 1 && $scope.loopStart) return true;
      };
      this.getSlidePath = function(){
        return $scope.slidePath;
      };
      this.swipeToSibling = function(siblingSlidePath){
        return SwiperService.swipeTo(siblingSlidePath);
      }

      // CALLBACKS

      this.registerSlideActiveCallback = function(callback, id) {
        SwiperService.registerSlideActiveCallback(callback,
                                                  $scope.slidePath, id);
      }
      this.unregisterSlideActiveCallback = function(id){
        SwiperService.unregisterSlideActiveCallback($scope.slidePath, id);
      }
    },
    link: function(scope, element, attrs, swiperContainerDirectiveController) {
      swiperContainerDirectiveController.registerSlide(scope.slidePath,
                                                       element,
                                                       scope.slideIndex,
                                                       scope.duplicateSlide,
                                                       scope.loopStart);
      scope.$on('$destroy', function() {
        swiperContainerDirectiveController.unregisterSlide(scope.slidePath);
      });
    }
  };
}
swiperSlideDirective['$inject'] = ['SwiperService'];
angular.module('em.base').directive('swiperSlide', swiperSlideDirective);
