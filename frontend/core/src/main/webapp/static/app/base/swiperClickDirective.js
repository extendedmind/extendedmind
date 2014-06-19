'use strict';
/**
 * @name
 * em.directives:swiperClick
 *
 * @summary
 * Wrapper directive for (mobile) clicks inside swiper.
 * Replace ng-click="expression" with this in DOM.
 *
 * @see
 * http://docs.angularjs.org/api/ng/directive/ngClick
 * angular.js ngClick directive source code
 * http://usejsdoc.org/#JSDoc3_Tag_Dictionary
 *
 * @description
 * Function bound to click is not called if swiper has set swiping flag to true.
 * This is needed because it seems that there is no way call e.g. event.preventClick()
 * and event.preventDefault() during swipe would also prevent scrolling and other important browser functions.
 */
function swiperClickDirective($parse, $rootScope) {
  return {
    restrict: 'A',
    compile: function(element, attr) {
      var fn = $parse(attr.swiperClick);
      return function(scope, element) {
        element.on('click', function(event) {
          if (!$rootScope.outerSwiping && !$rootScope.innerSwiping && !$rootScope.scrolling) {
            scope.$apply(function() {
              fn(scope, {$event: event});
            });
          } else {
            event.preventDefault();
            $rootScope.outerSwiping = false;
            $rootScope.innerSwiping = false;
            $rootScope.scrolling = false;
          }
        });
      };
    }
  };
}
swiperClickDirective['$inject'] = ['$parse', '$rootScope'];
angular.module('em.directives').directive('swiperClick', swiperClickDirective);
