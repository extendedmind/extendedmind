/*global angular */
'use strict';

// Wrapper for:
// https://github.com/bgrins/ExpandingTextareas

function expandingTextareaDirective($timeout) {
  return {
    restrict:'A',
    link: function(scope, element) {
      if (!element.expanding('active')) {
        element.expanding();
        // Needed to get textarea to increase size
        // on load
        $timeout(function(){
          element.change();
        }, 200);
      }

      scope.$on('$destroy', function() {
        if (element.expanding('active'))
          element.expanding('destroy');
      });
    }
  };
};

expandingTextareaDirective['$inject'] = ['$timeout'];
angular.module('em.directives').directive('expandingTextarea', expandingTextareaDirective);
