'use strict';

function scrollableDirective() {
  return {
    restrict: 'A',
    link: function postLink($scope, $element) {
      var scroller;

      scroller = new IScroll($element[0], {
        deceleration: 0.006
      });

      $scope.$on('$destroy', function() {
        scroller.destroy();
        scroller = null;
      });
    }
  };
}
scrollableDirective.$inject = [];
angular.module('em.directives').directive('scrollable', scrollableDirective);
