'use strict';

function editableFieldBackdropDirective($document) {
  return {
    restrict: 'A',
    controller: function($scope, $element, $attrs) {
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
        $element.addClass('active');
      };
      $scope.hideBackdrop = function(){
        $element.removeClass('active');
        $element.addClass('animating');
      };

      // Listen to transition end callbacks

      var transitionEndCallback = function(event) {
        $element.removeClass('animating');
      };
      angular.element($element).bind(
        'webkitTransitionend oTransitionend msTransitionend transitionend',transitionEndCallback);
      $scope.$on('$destroy', function(){
        angular.element($element).unbind(
          'webkitTransitionend oTransitionend msTransitionend transitionend', transitionEndCallback);
      });
    }
  };
}
editableFieldBackdropDirective['$inject'] = ['$document'];
angular.module('common').directive('editableFieldBackdrop', editableFieldBackdropDirective);
