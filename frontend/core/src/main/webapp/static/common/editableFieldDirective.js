'use strict';

function editableFieldDirective() {
  return {
    require: '^editableFieldContainer',
    restrict: 'A',
    link: function($scope, $element, $attrs, editableFieldContainerDirectiveController) {
      $element.addClass('editable-field');

      var editableFieldFocus = function() {
        $element.addClass('active');
        editableFieldContainerDirectiveController.showBackdrop();
      };
      var editableFieldBlur = function() {
        $element.removeClass('active');
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
editableFieldDirective.$inject = [];
angular.module('common').directive('editableField', editableFieldDirective);

