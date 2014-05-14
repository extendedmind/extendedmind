'use strict';

function editableFieldContainerDirective() {
  return {
    restrict: 'A',
    controller: function($scope, $element, $attrs){
      var undisableBackdrop = false;
      var backdropWasDisabled = false;
      function doShowBackdrop(){
        $element.addClass('active');
        if (undisableBackdrop && $scope.undisableBackdrop) backdropWasDisabled = $scope.undisableBackdrop();
        if ($scope.showBackdrop) $scope.showBackdrop();
      }
      $element.addClass('editable-field-container');

      this.showBackdrop = function(){
        doShowBackdrop();
      };

      this.hideBackdrop = function(){
        if ($attrs.editableFieldContainer !== 'auto'){
          $element.removeClass('active');
          if (backdropWasDisabled) $scope.disableBackdrop();
          $scope.hideBackdrop();
        }
      };

      if ($attrs.editableFieldContainer === 'auto'){
        if ($scope.disableBackdrop) $scope.disableBackdrop();
        doShowBackdrop();
      }else if ($attrs.editableFieldContainer === 'disable'){
        $scope.disableBackdrop();
      }else{
        undisableBackdrop = true;
      }

      $scope.$on('$destroy', function() {
        if ($scope.hideBackdrop) $scope.hideBackdrop();
      });
    }
  };
}
angular.module('common').directive('editableFieldContainer', editableFieldContainerDirective);

