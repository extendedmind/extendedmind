'use strict';

// http://stackoverflow.com/a/20912566
function includeReplaceDirective() {
  return {
    require: 'ngInclude',
    restrict: 'A', /* optional */
    link: function (scope, el) {
      el.replaceWith(el.children());
    }
  };
}
angular.module('common').directive('includeReplace', includeReplaceDirective);
