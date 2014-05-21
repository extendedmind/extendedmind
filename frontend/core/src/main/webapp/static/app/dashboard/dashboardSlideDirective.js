'use strict';

function dashboardSlideDirective() {
  return {
    scope: true,
    restrict: 'A',
    templateUrl: 'static/app/dashboard/dashboardSlide.html',
    link: function postLink(scope, element, attrs) {
      scope.slideIndex = attrs.slideIndex;
      scope.dashboardSlide = attrs.dashboardSlide;
      scope.heading = attrs.dashboardSlide;
      scope.omnibarFeature = 'dashboard';
    }
  };
}
dashboardSlideDirective.$inject = [];
angular.module('em.directives').directive('dashboardSlide', dashboardSlideDirective);
