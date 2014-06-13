'use strict';

function omnibarInputDirective() {
  return {
    restrict: 'A',
    link: function(scope, element) {
      omnibarInputFocus();

      scope.registerOmnibarInputFocusCallback(omnibarInputFocus);
      function omnibarInputFocus() {
        element[0].focus();
      }
    }
  };
}
angular.module('em.directives').directive('omnibarInput', omnibarInputDirective);
