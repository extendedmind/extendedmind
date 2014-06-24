'use strict';

function editableFieldBackdropDirective($rootScope) {
  return {
    restrict: 'A',
    controller: function($scope, $element) {
      $element.addClass('editable-field-backdrop');

      $scope.disableBackdrop = function(){
        $element.addClass('backdrop-disable');
      };
      $scope.undisableBackdrop = function(){
        if ($element.hasClass('backdrop-disable')){
          $element.removeClass('backdrop-disable');
          return true;
        }
      };
      $scope.showBackdrop = function(){
        $rootScope.backdropActive = true;
        $element.addClass('active swiper-no-swiping');
      };
      $scope.hideBackdrop = function(){
        $rootScope.backdropActive = false;
        $element.removeClass('active swiper-no-swiping');
        $element.addClass('animating');
      };

      // Listen to transition end callbacks

      var transitionEndCallback = function() {
        $element.removeClass('animating');
      };
      angular.element($element).bind(
        'webkitTransitionend oTransitionend msTransitionend transitionend',transitionEndCallback);
      $scope.$on('$destroy', function(){
        $rootScope.backdropActive = false;
        angular.element($element).unbind(
          'webkitTransitionend oTransitionend msTransitionend transitionend', transitionEndCallback);
      });
    }
  };
}
editableFieldBackdropDirective['$inject'] = ['$rootScope'];
angular.module('common').directive('editableFieldBackdrop', editableFieldBackdropDirective);
