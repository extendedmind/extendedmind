'use strict';

function scrollToDirective() {

  return {
    restrict: 'A',
    link: function postLink(scope, element) {
      var scrollToContainer = element;

      // http://stackoverflow.com/a/2906009
      scope.scrollToElement = function scrollToElement(targetElement) {
        scrollToContainer.animate({
          scrollTop: targetElement.offset().top - scrollToContainer.offset().top + scrollToContainer.scrollTop()
        }, 450);
      };
    }
  };
}
scrollToDirective.$inject = [];
angular.module('em.directives').directive('scrollTo', scrollToDirective);
