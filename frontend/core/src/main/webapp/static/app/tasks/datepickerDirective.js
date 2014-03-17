'use strict';

function datepickerDirective() {
  return {
    restrict: 'A',
    link: function postLink($scope, $element) {

      // datepicker
      // onscroll --> $scope.changeWeek
      var scroller = new IScroll($element[0], {
        snap: true,
        momentum: false,
        scrollX: true
      });

      $scope.$on('$destroy', function() {
        scroller.destroy();
        scroller = null;
      });
    }
  };
}
datepickerDirective.$inject = [];
angular.module('em.directives').directive('datepicker', datepickerDirective);
