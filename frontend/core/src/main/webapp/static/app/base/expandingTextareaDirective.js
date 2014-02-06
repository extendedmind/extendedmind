/*global angular */
'use strict';

// Wrapper for:
// https://github.com/bgrins/ExpandingTextareas

function expandingTextareaDirective($timeout) {
  return {
    restrict:'A',
    link: function(scope, element) {
      element.expandingTextarea();
      // Needed to get textarea to increase size
      // on load
      $timeout(function(){
        element.change();
      }, 0);
    }
  };
};

expandingTextareaDirective['$inject'] = ['$timeout'];
angular.module('em.directives').directive('expandingTextarea', expandingTextareaDirective);
