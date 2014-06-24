'use strict';

function addItemDirective($rootScope) {
  return {
    restrict: 'A',
    link: function postLink(scope, element/*, attrs, scrollToController*/) {

      var scrollToAddItem = false;
      function accordionLastElementCallback() {
        if (scrollToAddItem && angular.isFunction(scope.scrollToElement)) {
          scope.scrollToElement(element);
          scrollToAddItem = false;
        }
      }
      if (angular.isFunction(scope.registerLastCallback)) scope.registerLastCallback(accordionLastElementCallback);

      var elementHasFocus = false;
      scope.focusedAddItemElement = function focusedAddItemElement() {
        elementHasFocus = true;
        scope.ignoreSnap = true;
        element[0].classList.toggle('swiper-no-swiping', true);
      };

      scope.blurredAddItemElement = function blurredAddItemElement() {
        elementHasFocus = false;
        // data-snap-ignore can not have any value, so setting it to false is not enough
        scope.ignoreSnap = undefined;
        element[0].classList.toggle('swiper-no-swiping', false);
      };

      // In Android, scrolling needs to be done after keyboard is shown
      if ($rootScope.packaging === 'android-cordova' && angular.isFunction(scope.scrollToElement)){
        scope.$watch('softKeyboard.height', function(newValue){
          if (newValue && elementHasFocus){
            scope.scrollToElement(element);
          }
        });
      }

      scope.callAndRefresh = function callAndRefresh(itemAction, parameter) {
        itemAction(parameter);
        if (scope.getOnboardingPhase() === 'new'){
          scope.setOnboardingPhase('itemAdded');
          var inputField = element.find('input');
          setTimeout(function(){
            inputField.blur();
          });
        }else{
          if (angular.isFunction(scope.registerLastCallback)){
            scrollToAddItem = true;
          }else if (angular.isFunction(scope.scrollToElement)){
            // No accordion present, scroll immediately
            scope.scrollToElement(element);
          }
          if (scope.getOnboardingPhase() === 'itemAdded' || scope.getOnboardingPhase() === 'sortingStarted'){
            scope.setOnboardingPhase('secondItemAdded');
          }
        }
      };
    }
  };
}
addItemDirective.$inject = ['$rootScope'];
angular.module('em.directives').directive('addItem', addItemDirective);
