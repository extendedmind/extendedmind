'use strict';

function scrollableDirective() {
  return {
    restrict: 'A',
    link: function($scope, $element) {
      var scroller;

      scroller = new IScroll($element[0], {
        deceleration: 0.006
      });
    }
  };
}
scrollableDirective.$inject = [];
angular.module('em.directives').directive('scrollableDirective', scrollableDirective);
