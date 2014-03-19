'use strict';

function snapDrawerDragDirective(SnapService) {
  return {
    restrict: 'A',
    link: function($scope, $element) {
      SnapService.setDraggerElement($element[0]);
    }
  };
}
snapDrawerDragDirective.$inject = ['SnapService'];
angular.module('em.directives').directive('snapDrawerDrag', snapDrawerDragDirective);
