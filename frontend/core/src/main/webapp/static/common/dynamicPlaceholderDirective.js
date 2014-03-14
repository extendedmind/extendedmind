'use strict';

function dynamicPlaceholderDirective() {
  return {
    restrict: 'A',
    link: function ($scope, element, attrs) {
      attrs.$observe('dynamicPlaceholder', function(value) {
          element.attr('placeholder', value);
      });
    }
  };
}
angular.module('common').directive('dynamicPlaceholder', dynamicPlaceholderDirective);
