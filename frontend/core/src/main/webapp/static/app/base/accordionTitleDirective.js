'use strict';

// From:
// https://github.com/angular-app/Samples/tree/master/1820EN_10_Code/03_basic_accordion_directive

// The accordion-title directive indicates the title of a block of html that will expand and collapse in an accordion
angular.module('common').directive('accordionTitle', [
  function () {
    return {
    require: '^accordion',         // We need this directive to be inside an accordion
    restrict: 'A',                 // It will be an attribute
    replace: true,                // The element containing the directive will be replaced with the template
    templateUrl: 'static/app/base/accordionTitle.html',
    scope: {
      item: '=accordionTitle',
      editItemTitle: '&',
      editItem: '&',
      hasComplete: '=',
      toggleComplete: '&'
    },  // Create an isolated scope
    link: function($scope, $element, $attrs, accordionCtrl) {
      accordionCtrl.addItem($scope);
      $scope.isOpen = false;
      $scope.oldTitle = $scope.item.title;

      $scope.toggleOpen = function() {
        if (!$scope.isOpen){
          $scope.isOpen = true;
          $element.parent().addClass('accordion-item-active');
        }else{
          $scope.closeItem();
        }
        return $scope.isOpen;
      };

      $scope.closeItem = function() {
        if ($scope.isOpen){
          $scope.endTitleEdit();
          $element.parent().removeClass('accordion-item-active');
          $scope.isOpen = false;
          return true;
        }
        return false;
      };

      $scope.clickTitle = function() {
        if ($scope.isOpen){
          $scope.toggleOpen();
          accordionCtrl.closeOthers($scope);
        }else{
          // Not open, don't open unless nothing else was closed
          if (!accordionCtrl.closeOthers($scope)){
            $scope.toggleOpen();
          }
        }
      };

      $scope.endTitleEdit = function(){
        // Programmatically blur the input
        $element.find('input#accordionTitleInput')[0].blur();
        if ($scope.oldTitle !== $scope.item.title){
          // Title has changed, call edit title method with new title
          $scope.editItemTitle({item: $scope.item});
          $scope.oldTitle = $scope.item.title;
        }
      };

      $scope.pressItemEdit = function(){
        $scope.editItem({item: $scope.item});
      };

      $scope.startTitleEdit = function(event) {
        event.stopPropagation();
      };

      $scope.evaluateKeyPress = function(event) {
        // Enter key
        if(event.which === 13) {
          $scope.endTitleEdit();
          event.preventDefault();
        }
      };

      $scope.getTitleInputClass = function() {
        if ($scope.hasComplete){
          return 'center-input-wrapper';
        }
        return 'left-input-wrapper';
      };

      $scope.itemChecked = function() {
        if ($scope.toggleComplete){
          $scope.toggleComplete({item: $scope.item});
        }
      };
    }
  };
}]);
