'use strict';

function addItemDirective() {
  return {
    /* TODO
    require: '?^scrollTo',
    */
    restrict: 'A',
    link: function postLink(scope, element/*, attrs, scrollToController*/) {

      /* TODO
      if (scrollToController) scrollToController.registerAddItemElement(element[0]);
      */

      scope.focusedAddItemElement = function focusedAddItemElement() {
        scope.ignoreSnap = true;
        /* TODO
        if (scrollToController) scrollToController.focusedAddItemElement(element[0]);
        */
        element[0].classList.toggle('swiper-no-swiping', true);
      };

      scope.blurredAddItemElement = function blurredAddItemElement() {
        // data-snap-ignore can not have any value, so setting it to false is not enough
        scope.ignoreSnap = undefined;

        /* TODO
        if (scrollToController) scrollToController.blurredAddItemElement(element[0]);
        */
        element[0].classList.toggle('swiper-no-swiping', false);
      };

      scope.callAndRefresh = function callAndRefresh(itemAction, parameter) {
        itemAction(parameter);
        /* TODO
        scope.refreshScrollerAndScrollToFocusedAddElement(element[0]);
        */
      };
    }
  };
}
addItemDirective.$inject = [];
angular.module('em.directives').directive('addItem', addItemDirective);
