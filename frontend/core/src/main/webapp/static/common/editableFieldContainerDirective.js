'use strict';

function editableFieldContainerDirective() {
  return {
    restrict: 'A',
    controller: function($scope, $element, $attrs){
      function doShowBackdrop(){
        $element.addClass('active');
        if ($scope.showBackdrop) $scope.showBackdrop();
      }
      $element.addClass('editable-field-container');

      this.showBackdrop = function(){
        doShowBackdrop();
      };

      this.hideBackdrop = function(){
        if ($attrs.editableFieldContainer !== 'auto'){
          $element.removeClass('active');
          $scope.hideBackdrop();
        }
      };

      if ($attrs.editableFieldContainer === 'auto'){
        if ($scope.disableBackdrop) $scope.disableBackdrop();
        doShowBackdrop();
      }else if ($attrs.editableFieldContainer === 'disable'){
        $scope.disableBackdrop();
      }

      $scope.$on('$destroy', function() {
        if ($scope.hideBackdrop) $scope.hideBackdrop();
      });
    }
  };
}
angular.module('common').directive('editableFieldContainer', editableFieldContainerDirective);

