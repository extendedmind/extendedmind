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

      var scrollToContainer = element;

      function scrollerViewActiveCallback(){
        // TODO
      }

      // http://stackoverflow.com/a/2906009
      scope.scrollToElement = function scrollToElement(element) {
        scrollToContainer.animate({
          scrollTop: element.offset().top - scrollToContainer.offset().top + scrollToContainer.scrollTop()
        }, 250);
      };

      scope.$on('$destroy', function() {
        featureContainerController.removeViewActiveCallback(attrs.scrollTo);
      });
    }
  };
}
scrollToDirective.$inject = [];
angular.module('em.directives').directive('scrollTo', scrollToDirective);
