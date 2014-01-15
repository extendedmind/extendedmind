/*global angular */
'use strict';

// Wrapper for:
// https://github.com/bgrins/ExpandingTextareas

function expandingTextareaDirective(){
  return {
    restrict:'A',
    require:'ngModel',
    link: function(scope, element, attrs, ngModelCtrl) {
      element.expandingTextarea();
    }
  };
};
angular.module('common').directive('expandingTextarea', expandingTextareaDirective);
