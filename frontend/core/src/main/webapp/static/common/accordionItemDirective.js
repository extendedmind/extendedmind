/*global angular */
'use strict';

// From:
// https://github.com/angular-app/Samples/tree/master/1820EN_10_Code/03_basic_accordion_directive

// The accordion-item directive indicates a block of html that will expand and collapse in an accordion
function accordionItemDirective(){
  return {
    require:'^accordion',         // We need this directive to be inside an accordion
    restrict:'A',                 // It will be an attribute
    transclude:true,              // It transcludes the contents of the directive into the template
    replace: true,                // The element containing the directive will be replaced with the template
    templateUrl:'static/common/accordionItem.html',
    scope:{ heading:'@' },          // Create an isolated scope and mirror the heading attribute onto this scope
    link: function(scope, element, attrs, accordionCtrl) {
      accordionCtrl.addItem(scope);
      scope.isOpen = false;
      scope.$watch('isOpen', function(value) {
        if ( value ) {
          accordionCtrl.closeOthers(scope);
        }
      });
    }
  };
};
angular.module('common').directive('accordionItem', accordionItemDirective);