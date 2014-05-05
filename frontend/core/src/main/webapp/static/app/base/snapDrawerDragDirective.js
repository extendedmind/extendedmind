'use strict';

function snapDrawerDragDirective() {
  return {
    restrict: 'A',
    require: '^featureContainer',
    link: function(scope, element, attrs, featureContainerController) {
      featureContainerController.registerSnapDrawerDragElement(attrs.snapDrawerDrag, element[0]);
    }
  };
}
snapDrawerDragDirective.$inject = [];
angular.module('em.directives').directive('snapDrawerDrag', snapDrawerDragDirective);
