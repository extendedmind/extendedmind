'use strict';

function scrollToDirective() {

  return {
    restrict: 'A',
    require: '^featureContainer',
    /* TODO
    controller: function() {
    },
    */
    link: function postLink(scope, element, attrs, featureContainerController) {
      featureContainerController.registerViewActiveCallback(attrs.scrollTo, scrollerViewActiveCallback);

      function scrollerViewActiveCallback(){
        // TODO
      }

      scope.$on('$destroy', function() {
        featureContainerController.removeViewActiveCallback(attrs.scrollTo);
      });
    }
  };
}
scrollToDirective.$inject = [];
angular.module('em.directives').directive('scrollTo', scrollToDirective);
