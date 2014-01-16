/*global angular */
'use strict';

// Wrapper for:
// https://github.com/bgrins/ExpandingTextareas

function expandingTextareaDirective(){
  return {
    restrict:'A',
    link: function(scope, element) {
      element.expandingTextarea();
    }
  };
};
angular.module('common').directive('expandingTextarea', expandingTextareaDirective);
