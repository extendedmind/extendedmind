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

 function masterFooterDirective() {
  return {
    require: '?^swiperSlide',
    restrict: 'A',
    templateUrl: 'static/app/main/masterFooter.html',
    scope: {
      featureInfo: '=masterFooter',
      addItemFn: '&masterFooterAddItem',
    },
    link: function(scope, element, attrs, swiperSlideController){

      if (swiperSlideController){
        var currentSlidePath = swiperSlideController.getSlidePath();
        scope.navigationAction = swiperSlideController.swipeToSibling;

        if (scope.featureInfo.slides.left.path === currentSlidePath){
          // Leftmost slide
          if (scope.featureInfo.slides.middle){
            scope.rightNavigationText = scope.featureInfo.slides.middle.heading;
            scope.rightNavigationActionParameter = scope.featureInfo.slides.middle.path;
          }else{
            scope.rightNavigationText = scope.featureInfo.slides.right.heading;
            scope.rightNavigationActionParameter = scope.featureInfo.slides.right.path;
          }
        }else if (scope.featureInfo.slides.middle
                  && scope.featureInfo.slides.middle.path === currentSlidePath){
          // Middle slide
          scope.leftNavigationText = scope.featureInfo.slides.left.heading;
          scope.leftNavigationActionParameter = scope.featureInfo.slides.left.path;

          scope.rightNavigationText = scope.featureInfo.slides.right.heading;
          scope.$watch('featureInfo.slides.right.heading', function(newValue) {
            scope.rightNavigationText = newValue;
          });
          scope.rightNavigationActionParameter = scope.featureInfo.slides.right.path;

        }else if (scope.featureInfo.slides.right.path === currentSlidePath){
          // Rightmost slide
          if (scope.featureInfo.slides.middle){
            scope.leftNavigationText = scope.featureInfo.slides.middle.heading;
            scope.leftNavigationActionParameter = scope.featureInfo.slides.middle.path;
          }else{
            scope.leftNavigationText = scope.featureInfo.slides.left.heading;
            scope.leftNavigationActionParameter = scope.featureInfo.slides.left.path;
          }
        }
      }
    }
  };
}
angular.module('em.base').directive('masterFooter', masterFooterDirective);
