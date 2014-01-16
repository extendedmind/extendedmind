/*global angular */
'use strict';

// From:
// https://github.com/angular-app/Samples/tree/master/1820EN_10_Code/03_basic_accordion_directive

// The accordion-item directive indicates a block of html that will expand and collapse in an accordion
function accordionItemDirective($document){
  return {
    require:'^accordion',         // We need this directive to be inside an accordion
    restrict:'A',                 // It will be an attribute
    transclude:true,              // It transcludes the contents of the directive into the template
    replace: true,                // The element containing the directive will be replaced with the template
    templateUrl:'static/common/accordionItem.html',
    scope:{ 
      item:'=accordionItem',
      editItemTitle:'&',
      editItem:'&'
    },          // Create an isolated scope
    link: function(scope, element, attrs, accordionCtrl) {
      accordionCtrl.addItem(scope);
      scope.isOpen = false;
      scope.oldTitle = scope.item.title;

      scope.toggleOpen = function() {
        if (!scope.isOpen){
          scope.isOpen = true;
          element.addClass("accordion-item-active");
        }else{
          scope.closeItem();          
        }
        return scope.isOpen;
      }

      scope.closeItem = function() {
        if (scope.isOpen){
          element.removeClass("accordion-item-active");
          scope.isOpen = false;
        }
      }

      scope.clickTitle = function() {
        if (scope.toggleOpen()) {
          accordionCtrl.closeOthers(scope);
        }
      };

      scope.endTitleEdit = function(){
        // Programmatically blur the input
        element.find('input')[0].blur();
        if (scope.oldTitle !== scope.item.title){
          // Title has changed, call edit title method with new title
          scope.editItemTitle({item: scope.item});
          scope.oldTitle = scope.item.title;
        }
      };

      scope.pressItemEdit = function(){
        scope.editItem({item: scope.item});
      };

      scope.startTitleEdit = function($event) {  
        $event.stopPropagation();
      };

      scope.evaluateKeyPress = function($event) {
        // Enter key
        if(event.which === 13) {
          scope.endTitleEdit();
          event.preventDefault();
        }
      };
    }
  };
};
angular.module('common').directive('accordionItem', ['$document', accordionItemDirective]);