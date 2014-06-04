'use strict';

function editableFieldDirective($animate) {
  return {
    require: '^editableFieldContainer',
    restrict: 'A',
    link: function($scope, $element, $attrs, editableFieldContainerDirectiveController) {
      $element.addClass('editable-field');

      var editableFieldFocus = function() {
        $animate.addClass($element[0], 'active');
        editableFieldContainerDirectiveController.showBackdrop();
      };
      var editableFieldBlur = function() {
        $animate.removeClass($element[0], 'active');
        editableFieldContainerDirectiveController.hideBackdrop();
      };

      angular.element($element).bind('focus', editableFieldFocus);
      angular.element($element).bind('blur', editableFieldBlur);

      $scope.$on('$destroy', function(){
        angular.element($element).unbind('focus', editableFieldFocus);
        angular.element($element).unbind('blur', editableFieldBlur);
      });
    }
  };
}
editableFieldDirective.$inject = ['$animate'];
angular.module('common').directive('editableField', editableFieldDirective);

