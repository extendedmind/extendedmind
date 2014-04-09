/* global IScroll */
'use strict';

function scrollableDirective($timeout) {
  return {
    restrict: 'A',
    link: function postLink($scope, $element) {
      var scroller;

      $scope.$on('$includeContentLoaded', function() {
        scroller = new IScroll($element[0], {
          deceleration: 0.006
        });
        $timeout(function() {
          scroller.refresh();
        }, 200);
      });

      $scope.$on('$destroy', function() {
        scroller.destroy();
        scroller = null;
      });
    }
  };
}
scrollableDirective.$inject = ['$timeout'];
angular.module('em.directives').directive('scrollable', scrollableDirective);
