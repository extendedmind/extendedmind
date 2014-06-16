'use strict';

function addItemDirective() {
  return {
    restrict: 'A',
    link: function postLink(scope, element/*, attrs, scrollToController*/) {

      scope.focusedAddItemElement = function focusedAddItemElement() {
        scope.ignoreSnap = true;
        element[0].classList.toggle('swiper-no-swiping', true);
      };

      scope.blurredAddItemElement = function blurredAddItemElement() {
        // data-snap-ignore can not have any value, so setting it to false is not enough
        scope.ignoreSnap = undefined;
        element[0].classList.toggle('swiper-no-swiping', false);
      };

      var scrollToAddItem = false;

      function accordionLastElementCallback() {
        if (scrollToAddItem && angular.isFunction(scope.scrollToElement)) {
          scope.scrollToElement(element);
          scrollToAddItem = false;
        }
      }
      if (angular.isFunction(scope.registerLastCallback)) scope.registerLastCallback(accordionLastElementCallback);

      scope.callAndRefresh = function callAndRefresh(itemAction, parameter) {
        itemAction(parameter);
        if (angular.isFunction(scope.registerLastCallback)){
          scrollToAddItem = true;
        }else if (angular.isFunction(scope.scrollToElement)){
          // No accordion present, scroll immediately
          scope.scrollToElement(element);
        }
      };
    }
  };
}
addItemDirective.$inject = [];
angular.module('em.directives').directive('addItem', addItemDirective);
