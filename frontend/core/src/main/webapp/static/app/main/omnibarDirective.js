'use strict';

function omnibarDirective() {
  return {
    restrict: 'A',
    templateUrl: 'static/app/main/omnibar.html'
  };
}
angular.module('em.directives').directive('omnibar', omnibarDirective);
