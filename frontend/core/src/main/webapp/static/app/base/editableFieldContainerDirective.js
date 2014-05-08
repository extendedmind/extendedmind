'use strict';

function editableFieldContainerDirective() {
  return {
    restrict: 'A',
    require: '^editableFieldBackdrop',
    link: function($scope, $element, $attrs, editableFieldBackdropDirectiveController) {
      $element.addClass('editable-field-container');

      if ($attrs.editableFieldContainer === 'auto'){
        editableFieldBackdropDirectiveController.showBackdrop();
      }
      $scope.$on('$destroy', function() {
        editableFieldBackdropDirectiveController.hideBackdrop();
      });

      var showEditableFieldBackdropCallback = function(){
        $element.addClass('active');
      };
      var hideEditableFieldBackdropCallback = function(){
        $element.removeClass('active');
      };

      editableFieldBackdropDirectiveController.registerEditableFieldCallbacks(
        showEditableFieldBackdropCallback, hideEditableFieldBackdropCallback);
    }
  };
}
angular.module('em.directives').directive('editableFieldContainer', editableFieldContainerDirective);

