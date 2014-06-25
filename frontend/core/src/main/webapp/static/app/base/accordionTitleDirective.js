'use strict';

// From:
// https://github.com/angular-app/Samples/tree/master/1820EN_10_Code/03_basic_accordion_directive

// The accordion-title directive indicates the title of a block of html that will expand and collapse in an accordion
function accordionTitleDirective() {
  return {
    require: '^accordion',        // We need this directive to be inside an accordion
    restrict: 'A',                // It will be an attribute
    transclude: true,             // Transcludes teaser below title
    replace: true,                // The element containing the directive will be replaced with the template
    templateUrl: 'static/app/base/accordionTitle.html',
    scope: {
      item: '=accordionTitle',
      editItemFields: '&',
      editItem: '&',
      editItemInline: '=?',
      hasComplete: '=',
      toggleComplete: '&',
      boldTitle: '=?',
      titlePrefix: '=?'
    },  // Create an isolated scope
    link: function($scope, $element, $attrs, accordionCtrl) {
      accordionCtrl.addItem($scope);

      if ($scope.$parent.$first) accordionCtrl.notifyFirst();
      if ($scope.$parent.$last) accordionCtrl.notifyLast();

      $scope.titleOpen = false;

      function cacheFields(){
        $scope.oldTitle = $scope.item.title;
        $scope.oldLink = $scope.item.link;
        $scope.oldDescription = $scope.item.description;
      }
      cacheFields();

      $scope.getElement = function getElement() {
        return $element;
      };

      $scope.openItem = function openItem(skipScroll) {
        if (!$scope.titleOpen){
          $scope.titleOpen = true;
          $element.parent().addClass('accordion-item-active');
          if (!skipScroll) {
            accordionCtrl.scrollToElement($element.parent());
          }
        }
        return $scope.titleOpen;
      };

      $scope.closeItem = function(skipSave) {
        if ($scope.titleOpen){
          $scope.endFieldsEdit(skipSave);
          $element.parent().removeClass('accordion-item-active');
          $scope.titleOpen = false;
          return true;
        }
        return false;
      };

      $scope.clickTitle = function() {
        if (!$scope.titleOpen) {
          // Not open, don't open unless nothing else was closed
          if (!accordionCtrl.closeOthers($scope, $element)){
            $scope.openItem();
          }
        }
      };

      $scope.getItemTitle = function() {
        var title;
        if ($scope.titlePrefix){
          title = $scope.titlePrefix + $scope.item.title;
        }else{
          title = $scope.item.title;
        }
        return title;
      };

      $scope.endFieldsEdit = function(skipSave){
        // Programmatically blur the textarea
        $element.find('textarea#accordionTitleInput')[0].blur();
        // Reset description field
        if ($scope.item.description === '') delete $scope.item.description;
        if ($scope.oldTitle !== $scope.item.title
            || $scope.oldLink !== $scope.item.link
            || $scope.oldDescription !== $scope.item.description){
          if (!skipSave){
            // Task fields have changed
            $scope.editItemFields({item: $scope.item});
          }
          cacheFields();
        }
      };

      $scope.pressItemEdit = function(){
        if (!$scope.editItemInline){
          $scope.closeItem(true);
        }
        $scope.editItem({item: $scope.item});
      };

      $scope.startTitleEdit = function(event) {
        event.stopPropagation();
      };

      $scope.evaluateKeyPress = function(event) {
        // Enter key
        if(event.which === 13) {
          $scope.endFieldsEdit();
          event.preventDefault();
        }
      };

      $scope.getTitleClasses = function() {
        var titleInputClasses;
        if ($scope.hasComplete){
          titleInputClasses = 'center-input-wrapper';
        }else{
          titleInputClasses = 'left-input-wrapper';
        }
        if ($scope.boldTitle){
          titleInputClasses += ' bold-title';
        }
        return titleInputClasses;
      };

      $scope.itemChecked = function() {
        if ($scope.toggleComplete){
          $scope.toggleComplete({item: $scope.item});
        }
      };
    }
  };
}
accordionTitleDirective.$inject = [];
angular.module('em.directives').directive('accordionTitle', accordionTitleDirective);
