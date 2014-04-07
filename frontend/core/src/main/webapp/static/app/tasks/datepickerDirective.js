/* global IScroll */
'use strict';

function datepickerDirective($q) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'static/app/tasks/datepicker.html',
    link: function postLink($scope, $element) {
      var scroller = new IScroll($element[0], {
        snap: true,
        momentum: false,
        scrollX: true
      });
      goToMiddlePage();

      scroller.on('scrollEnd', scrollEnd);
      function scrollEnd() {
        if (scroller.currentPage.pageX === 0) {
          $scope.changeActiveWeek('prev', goToMiddlePage);
        }
        else if (scroller.currentPage.pageX === scroller.pages.length - 1) {
          $scope.changeActiveWeek('next', goToMiddlePage);
        }
      }

      function goToMiddlePage() {
        // http://iscrolljs.com/#snap
        // x = 1, y = 0, time = 0, easing = 0
        return $q.when(scroller.goToPage(1, 0, 0, 0));
      }

      $scope.$on('$destroy', function() {
        scroller.destroy();
        scroller = null;
      });
    }
  };
}
datepickerDirective.$inject = ['$q'];
angular.module('em.directives').directive('datepicker', datepickerDirective);
