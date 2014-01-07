/*global angular */
'use strict';

function swiperSlideDirective() {
  return {
    restrict: 'A',
    // All relevant business logic is in the container, which is
    // injected into the link with require. ^ means search for parent 
    // elements for direcitive.
    require: '^swiperContainer',
    scope: {
      slidePath: '@swiperSlide'
    },
    link: function link(scope, element, attrs, swiperContainerDirectiveController) {
      swiperContainerDirectiveController.registerSlidePath(scope.slidePath);
    }
  };
}
angular.module('em.directives').directive('swiperSlide', swiperSlideDirective);
