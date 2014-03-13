'use strict';

function includeReplaceDirective() {
  return {
    require: 'ngInclude',
    restrict: 'A', /* optional */
    link: function (scope, el, attrs) {
      el.replaceWith(el.children());
    }
  };
}
angular.module('common').directive('includeReplace', includeReplaceDirective);
