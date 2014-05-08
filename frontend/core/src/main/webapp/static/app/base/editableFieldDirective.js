'use strict';

function editableFieldDirective() {
  return {
    require: '^editableFieldBackdrop',
    restrict: 'A',
    link: function($scope, $element, $attrs, editableFieldBackdropDirectiveController) {
      $element.addClass('editable-field');

      var editableFieldFocus = function() {
        $element.addClass('active');
        editableFieldBackdropDirectiveController.showBackdrop();
      };
      var editableFieldBlur = function() {
        $element.removeClass('active');
        editableFieldBackdropDirectiveController.hideBackdrop();
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
angular.module('em.directives').directive('editableField', editableFieldDirective);

