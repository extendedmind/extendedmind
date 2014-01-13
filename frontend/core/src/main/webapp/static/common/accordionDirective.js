/*global angular */
'use strict';

// From:
// https://github.com/angular-app/Samples/tree/master/1820EN_10_Code/03_basic_accordion_directive

// The accordion directive simply sets up the directive controller
// and adds an accordion CSS class to itself element.
function accordionDirective(){
  return {
    restrict:'A',
    controller: function($scope) {
      // This array keeps track of the accordion items
      this.items = [];

      // Ensure that all the items in this accordion are closed, unless close-others explicitly says not to
      this.closeOthers = function(openItem) {
        angular.forEach(this.items, function (item) {
          if ( item !== openItem ) {
            item.isOpen = false;
          }
        });
      };
      
      // This is called from the accordion-item directive to add itself to the accordion
      this.addItem = function(itemScope) {
        var that = this;
        this.items.push(itemScope);

        itemScope.$on('$destroy', function (event) {
          that.removeItem(itemScope);
        });
      };

      // This is called from the accordion-item directive when to remove itself
      this.removeItem = function(item) {
        var index = this.items.indexOf(item);
        if ( index !== -1 ) {
          this.items.splice(this.items.indexOf(item), 1);
        }
      };
    },
    link: function(scope, element, attrs) {
      element.addClass('accordion');
    }
  };
};
angular.module('common').directive('accordion', accordionDirective);
