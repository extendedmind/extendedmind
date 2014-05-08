'use strict';

function editableFieldBackdropDirective($document) {
  return {
    restrict: 'A',
    controller: function($scope, $element, $attrs) {
      $element.addClass('editable-field-backdrop');

      if ($attrs.editableFieldBackdrop === 'disable'){
        $element.addClass('backdrop-disable');
      }

      var showBackdropCallback, hideBackdropCallback;
      this.showBackdrop = function(){
        $element.addClass('active');
        if (showBackdropCallback) showBackdropCallback();
      };
      this.hideBackdrop = function(){
        $element.removeClass('active');
        $element.addClass('animating');
        if (hideBackdropCallback) hideBackdropCallback();
      };
      this.registerEditableFieldCallbacks = function(showCallback, hideCallback){
        showBackdropCallback = showCallback;
        hideBackdropCallback = hideCallback;
      };

      // Listen to transition end callbacks

      var transitionEndCallback = function() {
        $element.removeClass('animating');
      };

      angular.element($element).bind('webkitTransitionend', transitionEndCallback);
      angular.element($element).bind('oTransitionend', transitionEndCallback);
      angular.element($element).bind('msTransitionend', transitionEndCallback);
      angular.element($element).bind('transitionend', transitionEndCallback);

      $scope.$on('$destroy', function(){
        angular.element($element).unbind('webkitTransitionend', transitionEndCallback);
        angular.element($element).unbind('oTransitionend', transitionEndCallback);
        angular.element($element).unbind('msTransitionend', transitionEndCallback);
        angular.element($element).unbind('transitionend', transitionEndCallback);
      });
    }
  };
}
editableFieldBackdropDirective['$inject'] = ['$document'];
angular.module('em.directives').directive('editableFieldBackdrop', editableFieldBackdropDirective);

